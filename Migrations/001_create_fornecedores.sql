-- Migration: create fornecedores module tables
create extension if not exists "uuid-ossp";

create table if not exists public.fornecedores (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    contato text,
    telefone text,
    email text,
    endereco text,
    cnpj text,
    prazo_entrega integer,
    pedido_minimo numeric(12,2),
    observacoes text,
    ativo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fornecedores_set_updated_at
before update on public.fornecedores
for each row execute procedure public.set_updated_at();

create table if not exists public.insumo_fornecedores (
    id uuid primary key default uuid_generate_v4(),
    insumo_id uuid not null,
    fornecedor_id uuid not null references public.fornecedores(id) on delete cascade,
    preco_bruto numeric(12,2) not null,
    preco_com_desconto numeric(12,2),
    quantidade_comprada numeric(12,3) not null,
    usar_preco_com_desconto boolean not null default false,
    prazo_entrega integer,
    observacoes text,
    ativo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger insumo_fornecedores_set_updated_at
before update on public.insumo_fornecedores
for each row execute procedure public.set_updated_at();

create index if not exists idx_insumo_fornecedores_fornecedor on public.insumo_fornecedores(fornecedor_id);
create index if not exists idx_insumo_fornecedores_insumo on public.insumo_fornecedores(insumo_id);
