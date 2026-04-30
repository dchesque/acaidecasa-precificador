-- ============================================================================
-- Açaí de Casa - Initial Schema
-- ============================================================================
-- Multi-tenant: every business row carries a `user_id` that references
-- `auth.users(id)`. RLS policies enforce that authenticated users can only
-- read/write rows they own.
--
-- Conventions:
--   - `id` is text/uuid (random_uuid())
--   - timestamps default to now()
--   - cascading deletes follow ownership (a user's data dies with the user)
-- ============================================================================

-- ----- Extensions -----------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----- Helper: updated_at trigger -------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----- configuracao (one row per user) --------------------------------------
create table if not exists public.configuracao (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  markup_padrao numeric(6,2) not null default 30,
  incluir_impostos boolean not null default false,
  aliquota_imposto numeric(6,2) default 10,
  arredondar_precos boolean not null default false,
  custo_fixo_mensal numeric(12,2) not null default 0,
  custo_energia numeric(12,2) not null default 0,
  custo_mao_obra numeric(12,2) not null default 0,
  taxa_cartao numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger configuracao_set_updated_at before update on public.configuracao
  for each row execute function public.set_updated_at();

-- ----- categorias -----------------------------------------------------------
create table if not exists public.categorias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  cor text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categorias_user_id_idx on public.categorias(user_id);
create trigger categorias_set_updated_at before update on public.categorias
  for each row execute function public.set_updated_at();

-- ----- unidades_medida ------------------------------------------------------
create table if not exists public.unidades_medida (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  sigla text not null,
  tipo text not null check (tipo in ('PESO','VOLUME','UNIDADE')),
  fator_conversao numeric(12,4) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index unidades_medida_user_id_idx on public.unidades_medida(user_id);
create trigger unidades_medida_set_updated_at before update on public.unidades_medida
  for each row execute function public.set_updated_at();

-- ----- fornecedores ---------------------------------------------------------
create table if not exists public.fornecedores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  contato text,
  telefone text,
  email text,
  endereco text,
  cnpj text,
  prazo_entrega int,
  pedido_minimo numeric(12,2),
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index fornecedores_user_id_idx on public.fornecedores(user_id);
create trigger fornecedores_set_updated_at before update on public.fornecedores
  for each row execute function public.set_updated_at();

-- ----- insumos --------------------------------------------------------------
create table if not exists public.insumos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  unidade_medida_id uuid references public.unidades_medida(id) on delete set null,
  fornecedor_calculo_id uuid references public.fornecedores(id) on delete set null,
  custo_por_unidade numeric(12,4),
  custo_por_grama numeric(12,4),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index insumos_user_id_idx on public.insumos(user_id);
create index insumos_categoria_id_idx on public.insumos(categoria_id);
create trigger insumos_set_updated_at before update on public.insumos
  for each row execute function public.set_updated_at();

-- ----- insumo_fornecedores --------------------------------------------------
create table if not exists public.insumo_fornecedores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insumo_id uuid not null references public.insumos(id) on delete cascade,
  fornecedor_id uuid not null references public.fornecedores(id) on delete cascade,
  preco_bruto numeric(12,2) not null,
  preco_com_desconto numeric(12,2),
  quantidade_comprada numeric(12,4) not null,
  usar_preco_com_desconto boolean not null default false,
  prazo_entrega int,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (insumo_id, fornecedor_id),
  check (
    preco_com_desconto is null
    or (preco_com_desconto > 0 and preco_com_desconto <= preco_bruto)
  )
);
create index insumo_fornecedores_user_id_idx on public.insumo_fornecedores(user_id);
create index insumo_fornecedores_insumo_id_idx on public.insumo_fornecedores(insumo_id);
create trigger insumo_fornecedores_set_updated_at before update on public.insumo_fornecedores
  for each row execute function public.set_updated_at();

-- ----- receitas -------------------------------------------------------------
create table if not exists public.receitas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  rendimento numeric(12,2) not null check (rendimento > 0),
  custo_por_grama numeric(12,4) not null default 0,
  custo_total numeric(12,2) not null default 0,
  tempo_preparo int,
  instrucoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index receitas_user_id_idx on public.receitas(user_id);
create trigger receitas_set_updated_at before update on public.receitas
  for each row execute function public.set_updated_at();

-- ----- receita_ingredientes -------------------------------------------------
create table if not exists public.receita_ingredientes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  receita_id uuid not null references public.receitas(id) on delete cascade,
  insumo_id uuid not null references public.insumos(id) on delete restrict,
  quantidade numeric(12,4) not null check (quantidade > 0),
  custo numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index receita_ingredientes_user_id_idx on public.receita_ingredientes(user_id);
create index receita_ingredientes_receita_id_idx on public.receita_ingredientes(receita_id);
create trigger receita_ingredientes_set_updated_at before update on public.receita_ingredientes
  for each row execute function public.set_updated_at();

-- ----- copos_base -----------------------------------------------------------
create table if not exists public.copos_base (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  insumo_base_id uuid references public.insumos(id) on delete restrict,
  quantidade_base numeric(12,2) not null,
  custo_base numeric(12,2) not null default 0,
  custo_insumos numeric(12,2) not null default 0,
  custo_total numeric(12,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index copos_base_user_id_idx on public.copos_base(user_id);
create trigger copos_base_set_updated_at before update on public.copos_base
  for each row execute function public.set_updated_at();

-- ----- copo_base_insumos ----------------------------------------------------
create table if not exists public.copo_base_insumos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  copo_base_id uuid not null references public.copos_base(id) on delete cascade,
  insumo_id uuid not null references public.insumos(id) on delete restrict,
  quantidade numeric(12,4) not null check (quantidade > 0),
  custo numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index copo_base_insumos_user_id_idx on public.copo_base_insumos(user_id);
create index copo_base_insumos_copo_base_id_idx on public.copo_base_insumos(copo_base_id);
create trigger copo_base_insumos_set_updated_at before update on public.copo_base_insumos
  for each row execute function public.set_updated_at();

-- ----- combinados -----------------------------------------------------------
create table if not exists public.combinados (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  copo_base_id uuid references public.copos_base(id) on delete restrict,
  custo_copo_base numeric(12,2) not null default 0,
  custo_complementos numeric(12,2) not null default 0,
  custo_total numeric(12,2) not null default 0,
  preco_sugerido numeric(12,2) not null default 0,
  preco_cardapio numeric(12,2),
  preco_venda_total numeric(12,2) not null default 0,
  preco_venda_sugerido numeric(12,2) not null default 0,
  margem numeric(8,4) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index combinados_user_id_idx on public.combinados(user_id);
create trigger combinados_set_updated_at before update on public.combinados
  for each row execute function public.set_updated_at();

-- ----- combinado_complementos -----------------------------------------------
create table if not exists public.combinado_complementos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  combinado_id uuid not null references public.combinados(id) on delete cascade,
  tipo text not null check (tipo in ('INSUMO','RECEITA')),
  insumo_id uuid references public.insumos(id) on delete restrict,
  receita_id uuid references public.receitas(id) on delete restrict,
  quantidade numeric(12,4) not null check (quantidade > 0),
  custo numeric(12,4) not null default 0,
  preco_venda numeric(12,2),
  item_cardapio_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (tipo = 'INSUMO' and insumo_id is not null and receita_id is null)
    or (tipo = 'RECEITA' and receita_id is not null and insumo_id is null)
  )
);
create index combinado_complementos_user_id_idx on public.combinado_complementos(user_id);
create index combinado_complementos_combinado_id_idx on public.combinado_complementos(combinado_id);
create trigger combinado_complementos_set_updated_at before update on public.combinado_complementos
  for each row execute function public.set_updated_at();

-- ----- cardapio (item_cardapio) ---------------------------------------------
create table if not exists public.cardapio (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  tipo text not null check (tipo in ('COPO_BASE','COMBINADO','INSUMO','RECEITA')),
  copo_base_id uuid references public.copos_base(id) on delete cascade,
  combinado_id uuid references public.combinados(id) on delete cascade,
  insumo_id uuid references public.insumos(id) on delete cascade,
  receita_id uuid references public.receitas(id) on delete cascade,
  custo_atual numeric(12,2) not null default 0,
  preco_atual numeric(12,2) not null default 0,
  margem_atual numeric(8,4) not null default 0,
  preco_novo numeric(12,2),
  margem_nova numeric(8,4),
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One of the four foreign keys must be set, matching `tipo`
  check (
    (tipo = 'COPO_BASE' and copo_base_id is not null)
    or (tipo = 'COMBINADO' and combinado_id is not null)
    or (tipo = 'INSUMO' and insumo_id is not null)
    or (tipo = 'RECEITA' and receita_id is not null)
  )
);
create index cardapio_user_id_idx on public.cardapio(user_id);
create trigger cardapio_set_updated_at before update on public.cardapio
  for each row execute function public.set_updated_at();

-- ----- custos_operacionais (dual: rapido or detalhado) ----------------------
create table if not exists public.custos_operacionais (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mes_referencia text not null check (mes_referencia ~ '^\d{4}-\d{2}$'),
  tipo text not null check (tipo in ('RAPIDO','DETALHADO')),
  valor_total numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mes_referencia)
);
create index custos_operacionais_user_id_idx on public.custos_operacionais(user_id);
create trigger custos_operacionais_set_updated_at before update on public.custos_operacionais
  for each row execute function public.set_updated_at();

-- ----- custo_itens (when tipo = DETALHADO) ----------------------------------
create table if not exists public.custo_itens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  custo_operacional_id uuid not null references public.custos_operacionais(id) on delete cascade,
  categoria text not null,
  descricao text,
  valor numeric(12,2) not null check (valor >= 0),
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index custo_itens_user_id_idx on public.custo_itens(user_id);
create index custo_itens_parent_idx on public.custo_itens(custo_operacional_id);
create trigger custo_itens_set_updated_at before update on public.custo_itens
  for each row execute function public.set_updated_at();

-- ----- vendas_importacoes ---------------------------------------------------
create table if not exists public.vendas_importacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  arquivo_nome text not null,
  arquivo_hash text,
  mes_referencia text not null check (mes_referencia ~ '^\d{4}-\d{2}$'),
  total_registros int not null default 0,
  registros_importados int not null default 0,
  registros_duplicados int not null default 0,
  produtos_sem_match int not null default 0,
  status text not null default 'CONCLUIDA' check (status in ('PROCESSANDO','CONCLUIDA','FALHA')),
  erro text,
  created_at timestamptz not null default now()
);
create index vendas_importacoes_user_id_idx on public.vendas_importacoes(user_id);
create index vendas_importacoes_hash_idx on public.vendas_importacoes(user_id, arquivo_hash);

-- ----- vendas_registradas ---------------------------------------------------
create table if not exists public.vendas_registradas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  importacao_id uuid references public.vendas_importacoes(id) on delete set null,
  venda_erp_id text not null,
  data_venda timestamptz not null,
  produto_erp_id text,
  produto_nome text not null,
  item_cardapio_id uuid references public.cardapio(id) on delete set null,
  item_cardapio_nome text,
  quantidade numeric(12,2) not null,
  preco_unitario_vendido numeric(12,2) not null,
  preco_total_vendido numeric(12,2) not null,
  preco_cardapio numeric(12,2) not null default 0,
  custo_calculado numeric(12,2) not null default 0,
  divergencia_valor numeric(12,2) not null default 0,
  divergencia_percentual numeric(8,4) not null default 0,
  lucro_bruto_real numeric(12,2) not null default 0,
  lucro_bruto_esperado numeric(12,2) not null default 0,
  margem_real numeric(8,4) not null default 0,
  margem_esperada numeric(8,4) not null default 0,
  status_match text not null default 'matched' check (status_match in ('matched','not_found','manual')),
  status_analise text not null default 'ok' check (status_analise in ('ok','divergencia','prejuizo')),
  vendedor text,
  created_at timestamptz not null default now(),
  unique (user_id, venda_erp_id)
);
create index vendas_registradas_user_id_idx on public.vendas_registradas(user_id);
create index vendas_registradas_data_venda_idx on public.vendas_registradas(user_id, data_venda);
create index vendas_registradas_item_cardapio_idx on public.vendas_registradas(item_cardapio_id);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
-- Pattern: every table is `select/insert/update/delete using (auth.uid() = user_id)`.
-- The CHECK on insert/update guarantees user_id can't be forged.
-- ============================================================================

do $$
declare
  t text;
  tables text[] := array[
    'configuracao',
    'categorias',
    'unidades_medida',
    'fornecedores',
    'insumos',
    'insumo_fornecedores',
    'receitas',
    'receita_ingredientes',
    'copos_base',
    'copo_base_insumos',
    'combinados',
    'combinado_complementos',
    'cardapio',
    'custos_operacionais',
    'custo_itens',
    'vendas_importacoes',
    'vendas_registradas'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      t || '_select',
      t
    );
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      t || '_insert',
      t
    );
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_update',
      t
    );
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      t || '_delete',
      t
    );
  end loop;
end$$;
