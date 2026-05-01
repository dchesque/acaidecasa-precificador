# Operações

Runbook prático: setup, deploy, migrations, troubleshooting.

---

## Setup local (do zero)

```sh
# 1. Instalar deps
npm install

# 2. Copiar env de exemplo
cp .env.local.example .env.local

# 3. Editar .env.local com URL/anon key do seu projeto Supabase
#    (ou deixar vazio para rodar em modo demo)

# 4. Subir o servidor
npm run dev
```

App em http://localhost:3000.

### Sem Supabase (modo demo)

Se `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` estiverem
vazios, o app sobe em **modo demo**:
- Banner amarelo no topo
- Mocks pré-populados no AppContext
- Mutations não persistem
- Login simula sem fazer request

Útil pra demonstrar o produto sem cloud setup.

---

## Provisionar Supabase

### Via dashboard

1. Criar projeto novo em [supabase.com](https://supabase.com)
2. `Settings → API` — copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SQL Editor → New query` — colar e rodar **em ordem**:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_seed_defaults.sql`
   - `supabase/migrations/0003_cascade_recalc.sql`
   - `supabase/migrations/0004_vendas_immutability.sql`
4. `Authentication → URL Configuration`:
   - **Site URL**: `https://seu-dominio.com` (ou `http://localhost:3000`
     em dev)
   - **Redirect URLs**: adicionar
     `https://seu-dominio.com/auth/reset-password`

### Via CLI

```sh
npm i -g supabase
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

A CLI vai aplicar migrations em ordem. Re-runs são idempotentes — todas
usam `create … if not exists` e `create or replace`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Em produção | URL do projeto. Validada no boot via `assertProductionEnv()` — build falha se faltar em prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Em produção | Anon key (NÃO use a service-role aqui) |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional | DSN do Sentry. Sem isso, observability vira no-op em prod e console.* em dev |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Opcional | Tag (`production`, `staging`, etc.). Default é `NODE_ENV` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nunca** com prefixo public | Apenas para scripts admin server-side. **Não exponha no client** |

---

## Deploy

### Vercel

1. Conectar o repo no dashboard Vercel
2. Em `Settings → Environment Variables`, configurar
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para
   Production (e Preview se quiser)
3. Push para `main` → deploy automático

O `next.config.mjs` já tem:
- Security headers (X-Frame-Options, HSTS, Referrer-Policy, etc.)
- `productionBrowserSourceMaps: false`
- `poweredByHeader: false`

### Outras plataformas (Netlify, AWS Amplify, Docker)

Build standard do Next 15:
```sh
npm run build
npm start
```

Lembre-se de configurar:
- `node` 20+
- Variáveis de ambiente acima
- Health check em `/` (retorna 200 quando OK)

---

## CI

Workflow em `.github/workflows/ci.yml`:

```
verify (lint + typecheck + unit + build)
  └── e2e (Playwright smoke contra dev server em mock mode)
```

Em PR e em push para `main`. Roda os ~120 testes unit (`npm test`) e os
17 specs E2E (`npm run test:e2e`).

Em caso de falha do E2E, o report vira artifact baixável (retenção 7 dias).

---

## Backups

Supabase free-tier faz backups diários automáticos. Para PITR (Point-In-Time
Recovery), upgrade para tier Pro.

Para backup manual:
```sh
supabase db dump -f backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### "Modo de demonstração — Supabase não configurado"

Banner amarelo no topo. Causa: env vars ausentes ou vazias. Verificar
`.env.local` (dev) ou painel do host (prod). Após corrigir, **reiniciar**
o dev server.

### "Usuário não autenticado" em mutations

Sessão expirou. O middleware deveria ter redirecionado, mas pode
acontecer em race com hot-reload no dev. Logout/login resolve.

### Insumo aparece com custo R$ 0,00

Causas comuns:
1. Não há relação `InsumoFornecedor` ativa para o `fornecedorCalculoId`
   selecionado
2. `quantidadeComprada = 0` na relação
3. Fornecedor selecionado foi deletado (FK fica `null`)

Solução: abrir o insumo, ir na step 3 (Fornecedores), garantir uma
relação ativa com `precoBruto > 0` e `quantidadeComprada > 0`.

### Receita / copo / combinado com custo desatualizado

Se o trigger `recalc_*` não disparou (banco antigo, migração 0003 não
aplicada), use o "Salvar" no formulário do insumo — isso re-dispatcha o
update e o front recalcula via `useCalculations`.

Para forçar recálculo de tudo no banco:
```sql
-- Recalcula tudo que depende de cada insumo do usuário
select public.cascade_from_insumo(id) from public.insumos
 where user_id = auth.uid();
```

### Vendas duplicadas após reimport

A constraint `unique (user_id, venda_erp_id)` em `vendas_registradas`
impede duplicatas pela coluna `vendaErpId`. Se mesmo assim aparecem,
verificar se o ERP está exportando IDs únicos.

### Erro "snapshot fields are immutable"

O trigger `vendas_lock_snapshot` está fazendo seu trabalho. Você está
tentando alterar `preco_cardapio`, `quantidade` ou outro campo
histórico de uma venda. **Isso é proposital** — vendas são fatos. Se
precisar corrigir um valor errado, **delete e re-importe**.

### Cron de recálculo

Não há cron. A cascata é toda baseada em triggers — só precisa rodar
quando algo muda.

### Service worker servindo conteúdo velho

O SW versiona caches por `CACHE_VERSION` em `public/sw.js`. Para forçar
todos os clients a atualizarem:
1. Bumpe `CACHE_VERSION = "v2"` (ou v3, …)
2. Deploy
3. No próximo refresh, o `activate` do SW limpa as versões antigas

Para o usuário forçar refresh sem esperar:
- DevTools → Application → Service Workers → Unregister, depois
  hard-reload (Ctrl+Shift+R)

### Build falha com "Missing required production environment variables"

`assertProductionEnv()` em `src/lib/env.ts` está bloqueando o build
porque `NODE_ENV=production` mas falta env var. Configurar no host antes
de fazer build.

Em CI, o workflow já injeta dummies para o build passar:
```yaml
NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key-for-ci
```

---

## Logs em produção

Sem Sentry (DSN não configurado), erros do client vão para `console.*`
no DevTools do usuário. Server errors vão para o stdout do host (Vercel
logs, etc.).

Com Sentry, eventos vão para o projeto configurado. Errors em error
boundaries (`app/error.tsx`, `app/global-error.tsx`) são automaticamente
capturados com `boundary` tag e `digest`.

Para identificar usuários no Sentry, o `useHydrateAppContext` chama
`identifyUser({ id, email })` no login.

---

## Rollback de migrations

Migrations não têm `DOWN` automatizado. Para reverter:

1. Snapshot atual: `supabase db dump -f pre-rollback.sql`
2. Edite o schema manualmente no SQL Editor:
   - Para reverter `0004_vendas_immutability`:
     `drop trigger vendas_lock_snapshot on public.vendas_registradas;`
     `drop trigger vendas_backfill on public.vendas_registradas;`
   - Para reverter `0003_cascade_recalc`: drop em todos os triggers
     `*_cascade` + `drop function recalc_*` em ordem
3. Para `0001` e `0002`, é mais fácil recriar o projeto Supabase do zero.

---

## Performance

- O Service Worker faz **network-first** para HTML, então mudanças vão
  pro usuário no próximo refresh
- A hidratação dispara **13 queries em paralelo** após login — escala
  bem até dezenas de milhares de linhas. Acima disso, considerar
  paginação/infinite scroll
- O `recalc_*` em SQL é eficiente para até ~1000 receitas/copos/combos
  por usuário; acima disso considerar `LISTEN/NOTIFY` para evitar
  cascatas síncronas

---

## Quem mexe em quê

| Quero… | Edite… |
|---|---|
| Mudar embalagem padrão R$ 0,58 | `src/utils/calculations.ts` (CUSTO_EMBALAGEM_PADRAO) **e** `0003_cascade_recalc.sql` (v_packaging) |
| Mudar limites de divergência | `src/utils/vendasCalculations.ts` (LIMITE_DIVERGENCIA_*) |
| Adicionar campo no insumo | `src/types/database.ts` + `src/types/supabase.ts` + nova migration SQL + mappers + form/modal/page |
| Trocar default de markup pra novos usuários | `0002_seed_defaults.sql` (`markup_padrao` na função seed_user_defaults) |
| Mudar cores/branding do PWA | `app/manifest.ts` (theme_color, background_color) + ícones em `public/icons/` |
| Adicionar nova entidade | Migration nova + mapper + service + reducer + action creator + hidratação + página + form + modal |
