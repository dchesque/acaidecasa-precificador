-- ============================================================================
-- Per-user bootstrap seed
-- ============================================================================
-- When a new user signs up, populate their workspace with sensible defaults so
-- the UI is not empty on first login. Called from a trigger on auth.users.
-- Idempotent: every insert is guarded by a NOT EXISTS check on user_id.
-- ============================================================================

create or replace function public.seed_user_defaults(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Default configuration
  insert into public.configuracao (user_id, markup_padrao, incluir_impostos, arredondar_precos)
  select p_user_id, 30, false, false
  where not exists (select 1 from public.configuracao where user_id = p_user_id);

  -- Default unidades de medida
  insert into public.unidades_medida (user_id, nome, sigla, tipo, fator_conversao)
  select p_user_id, 'Grama', 'g', 'PESO', 1
  where not exists (
    select 1 from public.unidades_medida where user_id = p_user_id and sigla = 'g'
  );
  insert into public.unidades_medida (user_id, nome, sigla, tipo, fator_conversao)
  select p_user_id, 'Quilograma', 'kg', 'PESO', 1000
  where not exists (
    select 1 from public.unidades_medida where user_id = p_user_id and sigla = 'kg'
  );
  insert into public.unidades_medida (user_id, nome, sigla, tipo, fator_conversao)
  select p_user_id, 'Mililitro', 'ml', 'VOLUME', 1
  where not exists (
    select 1 from public.unidades_medida where user_id = p_user_id and sigla = 'ml'
  );
  insert into public.unidades_medida (user_id, nome, sigla, tipo, fator_conversao)
  select p_user_id, 'Litro', 'l', 'VOLUME', 1000
  where not exists (
    select 1 from public.unidades_medida where user_id = p_user_id and sigla = 'l'
  );
  insert into public.unidades_medida (user_id, nome, sigla, tipo, fator_conversao)
  select p_user_id, 'Unidade', 'un', 'UNIDADE', 1
  where not exists (
    select 1 from public.unidades_medida where user_id = p_user_id and sigla = 'un'
  );

  -- Default categorias
  insert into public.categorias (user_id, nome, cor)
  select p_user_id, 'Açaí', '#7c3aed'
  where not exists (
    select 1 from public.categorias where user_id = p_user_id and nome = 'Açaí'
  );
  insert into public.categorias (user_id, nome, cor)
  select p_user_id, 'Frutas', '#10b981'
  where not exists (
    select 1 from public.categorias where user_id = p_user_id and nome = 'Frutas'
  );
  insert into public.categorias (user_id, nome, cor)
  select p_user_id, 'Cremes', '#f59e0b'
  where not exists (
    select 1 from public.categorias where user_id = p_user_id and nome = 'Cremes'
  );
  insert into public.categorias (user_id, nome, cor)
  select p_user_id, 'Toppings', '#ec4899'
  where not exists (
    select 1 from public.categorias where user_id = p_user_id and nome = 'Toppings'
  );
  insert into public.categorias (user_id, nome, cor)
  select p_user_id, 'Embalagens', '#64748b'
  where not exists (
    select 1 from public.categorias where user_id = p_user_id and nome = 'Embalagens'
  );
end;
$$;

-- Trigger that runs on every new auth.users row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_user_defaults(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
