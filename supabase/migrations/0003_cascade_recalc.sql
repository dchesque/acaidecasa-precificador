-- ============================================================================
-- Cascading cost recalculation
-- ============================================================================
-- Source of stale data before this migration:
--   - When `insumo_fornecedores` changed, `insumos.custo_por_unidade` was not
--     updated by the DB and downstream `receitas.custo_total` /
--     `copos_base.custo_total` / `combinados.custo_total` stayed stale until a
--     human re-saved each one in the UI.
--
-- This migration installs Postgres functions + triggers that propagate cost
-- changes automatically, eliminating the most reported pricing bug.
--
-- Order of recomputation:
--   insumo_fornecedores → insumos → receita_ingredientes/copo_base_insumos
--                                 → receitas/copos_base
--                                 → combinado_complementos → combinados
--
-- Each function takes a single id and updates the target row in place.
-- Triggers are AFTER INSERT/UPDATE/DELETE on the source table and call the
-- function with the appropriate id(s).
-- ============================================================================

-- ----- 1. Recompute insumo.custo_por_unidade from its supplier link --------
create or replace function public.recalc_insumo_custo(p_insumo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_calc_supplier uuid;
  v_preco numeric;
  v_qty numeric;
begin
  select fornecedor_calculo_id into v_calc_supplier
  from public.insumos
  where id = p_insumo_id;

  if v_calc_supplier is null then
    return;
  end if;

  select case when usar_preco_com_desconto and preco_com_desconto is not null
              then preco_com_desconto else preco_bruto end,
         quantidade_comprada
    into v_preco, v_qty
  from public.insumo_fornecedores
  where insumo_id = p_insumo_id
    and fornecedor_id = v_calc_supplier
    and ativo
  limit 1;

  if v_preco is null or v_qty is null or v_qty = 0 then
    return;
  end if;

  update public.insumos
     set custo_por_unidade = v_preco / v_qty,
         custo_por_grama = v_preco / v_qty
   where id = p_insumo_id;
end;
$$;

-- ----- 2. Recompute receita totals -----------------------------------------
create or replace function public.recalc_receita(p_receita_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric := 0;
  v_rendimento numeric;
begin
  -- Update each ingredient's row-level cost first
  update public.receita_ingredientes ri
     set custo = coalesce(i.custo_por_unidade, 0) * ri.quantidade
    from public.insumos i
   where ri.receita_id = p_receita_id
     and ri.insumo_id = i.id;

  select coalesce(sum(custo), 0) into v_total
  from public.receita_ingredientes
  where receita_id = p_receita_id;

  select rendimento into v_rendimento
  from public.receitas
  where id = p_receita_id;

  update public.receitas
     set custo_total = v_total,
         custo_por_grama = case when v_rendimento > 0 then v_total / v_rendimento else 0 end
   where id = p_receita_id;
end;
$$;

-- ----- 3. Recompute copo_base totals ---------------------------------------
create or replace function public.recalc_copo_base(p_copo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_custo_base numeric := 0;
  v_custo_insumos numeric := 0;
  v_packaging numeric := 0.58;  -- matches CUSTO_EMBALAGEM_PADRAO in calculations.ts
begin
  update public.copo_base_insumos cbi
     set custo = coalesce(i.custo_por_unidade, 0) * cbi.quantidade
    from public.insumos i
   where cbi.copo_base_id = p_copo_id
     and cbi.insumo_id = i.id;

  select coalesce(i.custo_por_unidade, 0) * cb.quantidade_base into v_custo_base
  from public.copos_base cb
  left join public.insumos i on i.id = cb.insumo_base_id
  where cb.id = p_copo_id;

  select coalesce(sum(custo), 0) into v_custo_insumos
  from public.copo_base_insumos
  where copo_base_id = p_copo_id;

  update public.copos_base
     set custo_base = coalesce(v_custo_base, 0),
         custo_insumos = v_custo_insumos,
         custo_total = coalesce(v_custo_base, 0) + v_custo_insumos + v_packaging
   where id = p_copo_id;
end;
$$;

-- ----- 4. Recompute combinado totals ---------------------------------------
create or replace function public.recalc_combinado(p_combo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_custo_copo numeric := 0;
  v_custo_complementos numeric := 0;
begin
  -- Update each complemento's row-level cost
  update public.combinado_complementos cc
     set custo = case
                   when cc.tipo = 'INSUMO' then coalesce(i.custo_por_unidade, 0) * cc.quantidade
                   when cc.tipo = 'RECEITA' then coalesce(r.custo_por_grama, 0) * cc.quantidade
                   else 0
                 end
    from public.combinados cb
    left join public.insumos i on i.id = cc.insumo_id
    left join public.receitas r on r.id = cc.receita_id
   where cc.combinado_id = p_combo_id
     and cb.id = p_combo_id;

  select coalesce(cb_cost.custo_total, 0) into v_custo_copo
  from public.combinados cb
  left join public.copos_base cb_cost on cb_cost.id = cb.copo_base_id
  where cb.id = p_combo_id;

  select coalesce(sum(custo), 0) into v_custo_complementos
  from public.combinado_complementos
  where combinado_id = p_combo_id;

  update public.combinados
     set custo_copo_base = v_custo_copo,
         custo_complementos = v_custo_complementos,
         custo_total = v_custo_copo + v_custo_complementos
   where id = p_combo_id;
end;
$$;

-- ----- 5. Cascade fan-out helpers ------------------------------------------
-- Given an insumo, recompute every receita / copo_base that uses it, then
-- every combinado that uses one of those copos or receitas.
create or replace function public.cascade_from_insumo(p_insumo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r_id uuid;
  c_id uuid;
  combo_id uuid;
begin
  for r_id in
    select distinct receita_id
    from public.receita_ingredientes
    where insumo_id = p_insumo_id
  loop
    perform public.recalc_receita(r_id);
  end loop;

  for c_id in
    select distinct copo_base_id
    from public.copo_base_insumos
    where insumo_id = p_insumo_id
    union
    select id from public.copos_base where insumo_base_id = p_insumo_id
  loop
    perform public.recalc_copo_base(c_id);
  end loop;

  -- Combos that reference the insumo directly OR via the affected copos/receitas
  for combo_id in
    select distinct id from public.combinados
     where copo_base_id in (
       select distinct copo_base_id from public.copo_base_insumos where insumo_id = p_insumo_id
       union
       select id from public.copos_base where insumo_base_id = p_insumo_id
     )
    union
    select distinct combinado_id from public.combinado_complementos
     where insumo_id = p_insumo_id
        or receita_id in (
          select distinct receita_id from public.receita_ingredientes where insumo_id = p_insumo_id
        )
  loop
    perform public.recalc_combinado(combo_id);
  end loop;
end;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- 1. Supplier price changes → re-derive insumo cost, then cascade.
create or replace function public.trg_insumo_fornecedor_changed()
returns trigger
language plpgsql
as $$
declare
  affected uuid;
begin
  affected := coalesce(new.insumo_id, old.insumo_id);
  perform public.recalc_insumo_custo(affected);
  perform public.cascade_from_insumo(affected);
  return null; -- AFTER trigger; row-result ignored
end;
$$;

drop trigger if exists insumo_fornecedor_cascade on public.insumo_fornecedores;
create trigger insumo_fornecedor_cascade
  after insert or update or delete on public.insumo_fornecedores
  for each row execute function public.trg_insumo_fornecedor_changed();

-- 2. Insumo cost / supplier-of-record change → cascade.
create or replace function public.trg_insumo_changed()
returns trigger
language plpgsql
as $$
begin
  -- Avoid recursion when the cascade itself updates insumos.
  if tg_op = 'UPDATE' and new.custo_por_unidade is not distinct from old.custo_por_unidade
     and new.fornecedor_calculo_id is not distinct from old.fornecedor_calculo_id then
    return null;
  end if;
  perform public.cascade_from_insumo(new.id);
  return null;
end;
$$;

drop trigger if exists insumo_cascade on public.insumos;
create trigger insumo_cascade
  after update on public.insumos
  for each row execute function public.trg_insumo_changed();

-- 3. Receita ingredient changes → recompute that receita then any combo using it.
create or replace function public.trg_receita_ing_changed()
returns trigger
language plpgsql
as $$
declare
  r_id uuid;
  combo_id uuid;
begin
  r_id := coalesce(new.receita_id, old.receita_id);
  perform public.recalc_receita(r_id);
  for combo_id in
    select distinct combinado_id from public.combinado_complementos where receita_id = r_id
  loop
    perform public.recalc_combinado(combo_id);
  end loop;
  return null;
end;
$$;

drop trigger if exists receita_ing_cascade on public.receita_ingredientes;
create trigger receita_ing_cascade
  after insert or update or delete on public.receita_ingredientes
  for each row execute function public.trg_receita_ing_changed();

-- 4. Copo base ingredients changed → recompute that copo and any combo using it.
create or replace function public.trg_copo_ing_changed()
returns trigger
language plpgsql
as $$
declare
  c_id uuid;
  combo_id uuid;
begin
  c_id := coalesce(new.copo_base_id, old.copo_base_id);
  perform public.recalc_copo_base(c_id);
  for combo_id in
    select id from public.combinados where copo_base_id = c_id
  loop
    perform public.recalc_combinado(combo_id);
  end loop;
  return null;
end;
$$;

drop trigger if exists copo_ing_cascade on public.copo_base_insumos;
create trigger copo_ing_cascade
  after insert or update or delete on public.copo_base_insumos
  for each row execute function public.trg_copo_ing_changed();

-- 5. Copo base itself changed (different insumo_base) → recompute it + combos.
create or replace function public.trg_copo_changed()
returns trigger
language plpgsql
as $$
declare
  combo_id uuid;
begin
  if tg_op = 'UPDATE'
     and new.insumo_base_id is not distinct from old.insumo_base_id
     and new.quantidade_base is not distinct from old.quantidade_base then
    return null;
  end if;
  perform public.recalc_copo_base(new.id);
  for combo_id in
    select id from public.combinados where copo_base_id = new.id
  loop
    perform public.recalc_combinado(combo_id);
  end loop;
  return null;
end;
$$;

drop trigger if exists copo_cascade on public.copos_base;
create trigger copo_cascade
  after update on public.copos_base
  for each row execute function public.trg_copo_changed();

-- 6. Combinado complement changes → recompute that combo.
create or replace function public.trg_combo_comp_changed()
returns trigger
language plpgsql
as $$
declare
  c_id uuid;
begin
  c_id := coalesce(new.combinado_id, old.combinado_id);
  perform public.recalc_combinado(c_id);
  return null;
end;
$$;

drop trigger if exists combo_comp_cascade on public.combinado_complementos;
create trigger combo_comp_cascade
  after insert or update or delete on public.combinado_complementos
  for each row execute function public.trg_combo_comp_changed();
