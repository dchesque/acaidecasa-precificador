-- ============================================================================
-- Vendas immutability + snapshot consistency
-- ============================================================================
-- A registered sale is a historical fact. Once inserted it must not silently
-- shift if the menu price or the recipe cost changes later — otherwise the
-- divergence/profit reports become meaningless after a price update.
--
-- This migration:
--   1. Locks the snapshot columns (preco_cardapio, custo_calculado, lucro_*,
--      margem_*, divergencia_*) against UPDATE — only `item_cardapio_id` and
--      `status_match` may change (manual product reconciliation).
--   2. Backfills `preco_cardapio` and `custo_calculado` from the matched
--      cardápio item if they're zero at insert time (defense in depth: if the
--      client forgets to set them, the trigger picks the right value rather
--      than reporting "free / no cost").
-- ============================================================================

-- Allowed-update guard ------------------------------------------------------
create or replace function public.vendas_registradas_lock_snapshot()
returns trigger
language plpgsql
as $$
begin
  -- Block edits to the historical numbers. The reconciliation flow only
  -- needs to flip item_cardapio_id / item_cardapio_nome / status_match when
  -- a user manually links a "not found" produto.
  if new.preco_cardapio is distinct from old.preco_cardapio
     or new.custo_calculado is distinct from old.custo_calculado
     or new.preco_total_vendido is distinct from old.preco_total_vendido
     or new.preco_unitario_vendido is distinct from old.preco_unitario_vendido
     or new.quantidade is distinct from old.quantidade
     or new.lucro_bruto_real is distinct from old.lucro_bruto_real
     or new.lucro_bruto_esperado is distinct from old.lucro_bruto_esperado
     or new.margem_real is distinct from old.margem_real
     or new.margem_esperada is distinct from old.margem_esperada
     or new.divergencia_valor is distinct from old.divergencia_valor
     or new.divergencia_percentual is distinct from old.divergencia_percentual
     or new.data_venda is distinct from old.data_venda
     or new.venda_erp_id is distinct from old.venda_erp_id then
    raise exception 'vendas_registradas: snapshot fields are immutable (only item_cardapio_id, item_cardapio_nome, status_match, status_analise, vendedor may change)';
  end if;
  return new;
end;
$$;

drop trigger if exists vendas_lock_snapshot on public.vendas_registradas;
create trigger vendas_lock_snapshot
  before update on public.vendas_registradas
  for each row execute function public.vendas_registradas_lock_snapshot();

-- Defense-in-depth backfill --------------------------------------------------
-- If the client sends preco_cardapio = 0 but item_cardapio_id is set, fill it
-- in from the current cardápio. Same for custo_calculado.
create or replace function public.vendas_registradas_backfill()
returns trigger
language plpgsql
as $$
declare
  v_preco numeric;
  v_custo numeric;
begin
  if new.item_cardapio_id is null then
    return new;
  end if;

  if new.preco_cardapio = 0 or new.custo_calculado = 0 then
    select preco_atual, custo_atual
      into v_preco, v_custo
    from public.cardapio
    where id = new.item_cardapio_id;

    if new.preco_cardapio = 0 and v_preco is not null then
      new.preco_cardapio = v_preco;
    end if;
    if new.custo_calculado = 0 and v_custo is not null then
      new.custo_calculado = v_custo * new.quantidade;
    end if;

    -- Recompute derived fields with the snapshotted values
    new.divergencia_valor = new.preco_unitario_vendido - new.preco_cardapio;
    if new.preco_cardapio > 0 then
      new.divergencia_percentual =
        ((new.preco_unitario_vendido - new.preco_cardapio) / new.preco_cardapio) * 100;
    end if;
    new.lucro_bruto_real = new.preco_total_vendido - new.custo_calculado;
    new.lucro_bruto_esperado = (new.preco_cardapio * new.quantidade) - new.custo_calculado;
    if new.preco_total_vendido > 0 then
      new.margem_real = (new.lucro_bruto_real / new.preco_total_vendido) * 100;
    end if;
    if new.preco_cardapio > 0 then
      new.margem_esperada =
        (new.lucro_bruto_esperado / (new.preco_cardapio * new.quantidade)) * 100;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists vendas_backfill on public.vendas_registradas;
create trigger vendas_backfill
  before insert on public.vendas_registradas
  for each row execute function public.vendas_registradas_backfill();
