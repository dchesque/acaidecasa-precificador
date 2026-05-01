# Arquitetura

Visão alto-nível do que vive onde, como o estado flui e onde cada
responsabilidade mora.

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser                                                            │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  Next 15 App Router (RSC + client components)               │  │
│   │                                                             │  │
│   │   ┌────────────┐    ┌─────────────┐    ┌───────────────┐    │  │
│   │   │  Pages     │ →  │ AppContext  │ →  │ Services      │    │  │
│   │   │  (use      │    │ (Reducer +  │    │ (Supabase     │    │  │
│   │   │  context)  │    │ optimistic  │    │ CRUD via      │    │  │
│   │   └────────────┘    │ persist)    │    │ @supabase/ssr)│    │  │
│   │                     └─────────────┘    └───────────────┘    │  │
│   │           ↑                                  │              │  │
│   │           │ Hydrate on auth                  ▼              │  │
│   │   ┌──────────────┐                   ┌──────────────┐       │  │
│   │   │ useHydrate   │                   │ Supabase     │       │  │
│   │   │ AppContext   │ ←─── lista 13 ──→ │ (Postgres +  │       │  │
│   │   │ (Promise.all)│                   │ Auth + RLS)  │       │  │
│   │   └──────────────┘                   └──────────────┘       │  │
│   │                                                             │  │
│   │   ┌────────────┐  Calc engine          ┌────────────────┐   │  │
│   │   │ utils/*.ts │  (puras, testadas)    │ SQL Triggers    │   │  │
│   │   └────────────┘                       │ (cascade +      │   │  │
│   │                                        │ immutability)   │   │  │
│   │                                        └────────────────┘   │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   Service Worker (offline shell, network-first nav, no cross-origin)│
└────────────────────────────────────────────────────────────────────┘
```

---

## Camadas

### 1. Pages (`app/*/page.tsx` + `src/pages/*.tsx`)

Cada rota em `app/` é um wrapper `"use client"` finíssimo que renderiza um
componente full em `src/pages/`. Os pages consomem `useAppContext()` para
ler estado e disparar ações — **eles nunca chamam serviços diretamente**.

### 2. AppContext (`src/contexts/AppContext.tsx`)

Reducer + dispatcher único para todo o estado de domínio do app. Os
action creators (`addInsumo`, `updateReceita`, `deleteCombinado`, etc.)
seguem um padrão **optimistic-then-persist**:

```ts
const addInsumo = (insumo: Insumo) => {
  dispatch({ type: 'ADD_INSUMO', payload: insumo });   // otimismo
  persist(() => svc.createInsumo(insumo));             // fire-and-forget
};
```

`persist` é um helper que:
- Em mock mode (Supabase não configurado), é no-op — o state local é a
  fonte da verdade.
- Em produção, dispara a chamada Supabase sem `await`. Em caso de erro,
  emite um toast vermelho. UI nunca bloqueia.

**Por que sem await?** Pages não querem ser async. Erros são raros
(RLS valida tudo) e a UX otimista é mais rápida.

#### Inicialização do estado

`AppContext.tsx:170-225` inicializa o `AppState` com:
- **Mock data** quando `isSupabaseConfigured() === false`
- **Arrays vazios** quando há Supabase configurado (a hydration popula em
  seguida)

Isso é decidido **uma vez no boot** via `const useMocks = !isSupabaseConfigured()`.

### 3. Hydration (`src/hooks/useHydrateAppContext.ts`)

Hook que, **depois do auth**, busca todas as 13 listas em paralelo
(`Promise.all`) e dispatcha por slice no AppContext. Montado em
`<HydrationGate />` dentro de `app/providers.tsx`.

Estratégia:
1. `useAuth.isAuthenticated && isSupabaseConfigured()` → segue
2. `Promise.all([listInsumos, listReceitas, ...])` em paralelo
3. Para cada slice resolvida, dispara um único dispatch
4. Erros são capturados via `captureException` (Sentry quando ativo)

### 4. Service layer (`src/services/supabase/`)

CRUD puro sobre Supabase, com mappers bidirecionais snake_case ↔ camelCase
em `src/services/mappers.ts`.

Conventions:
- `requireUserId()` em `_helpers.ts` garante chamadas autenticadas
- RLS faz o filtro de tenancy — services não precisam `.eq("user_id",…)`
  manualmente
- IDs locais (`crypto.randomUUID()`) são preservados como PKs no DB
- Operações compostas (receita + ingredientes, copo + insumos, combinado
  + complementos) fazem **upsert + delete + insert** em duas queries para
  evitar diff complexo

### 5. Calc engine (`src/utils/`)

Funções puras, sem dependência de React, testadas. Veja
[regras-precificacao.md](./regras-precificacao.md) para a especificação
completa.

### 6. SQL & banco (`supabase/migrations/`)

| Arquivo | Conteúdo |
|---|---|
| `0001_initial_schema.sql` | 17 tabelas, índices, RLS (4 policies × 17 = 68 policies) |
| `0002_seed_defaults.sql` | Trigger em `auth.users` que cria categorias + unidades padrão pra cada novo signup |
| `0003_cascade_recalc.sql` | 4 funções `recalc_*` + 1 fan-out `cascade_from_insumo` + 6 triggers |
| `0004_vendas_immutability.sql` | `vendas_lock_snapshot` (BEFORE UPDATE) + `vendas_backfill` (BEFORE INSERT) |

### 7. Auth (`src/lib/supabase/{client,server,middleware}.ts`)

Cliente moderno via `@supabase/ssr` (não o legado `auth-helpers-nextjs`):
- `client.ts` — `createBrowserClient` com cache singleton
- `server.ts` — `createServerClient` integrado com `cookies()` async do
  Next 15
- `middleware.ts` — `createServerClient` com refresh real de cookies +
  redirect logic

Middleware (`/middleware.ts` no root) delega tudo para `updateSession`,
que decide:
- Sem Supabase configurado → bypass (mock mode)
- Sem sessão e rota não-pública → redirect `/auth/login?redirectTo=...`
- Sessão ativa em `/auth/login` → redirect `/`

Rotas públicas: tudo que começa com `/auth/`.

### 8. Observability (`src/lib/observability.ts`)

Façade graceful sobre `@sentry/nextjs`:
- Sem DSN ou sem o pacote → degrada para `console.*` em dev, no-op em prod
- Com DSN → dynamic-import + `init` no `instrumentation.ts`

`captureException`, `captureMessage`, `identifyUser` são chamados em:
- `app/error.tsx` e `app/global-error.tsx` (boundaries)
- `useHydrateAppContext` (identify no login + capture na falha)

### 9. PWA (`app/manifest.ts` + `public/sw.js`)

- Manifest nativo do Next 15 — gera `/manifest.webmanifest` automaticamente
- Service worker registrado em produção via `<PWARegister />`
- Estratégias: navegação (network-first com fallback `/offline.html`),
  estáticos imutáveis (cache-first), imagens (stale-while-revalidate),
  cross-origin (network-only — Supabase nunca cacheado)

---

## Convenções de código

### IDs

`src/lib/ids.ts` exporta `newId()`:
- Usa `crypto.randomUUID()` quando disponível
- Fallback `crypto.getRandomValues()` para browsers antigos
- Last resort `Date.now()+Math.random()` em runtimes muito antigos / SSR

**Nunca** use `Date.now().toString()` direto — colide em bursts de
dispatches.

### Confirmação destrutiva

`useConfirm()` em `src/components/common/ConfirmProvider.tsx`. API
Promise-based, retorna `boolean`:

```ts
const ok = await confirm({
  title: "Excluir insumo",
  description: `Tem certeza que deseja excluir "${insumo.nome}"?`,
  destructive: true,
  confirmLabel: "Excluir",
});
if (ok) { ... }
```

**Nunca** use `window.confirm` — ele bloqueia o thread, não estiliza, e
não funciona bem em mobile.

### Toasts

Padrão **único**: `sonner` via `import { toast } from "sonner"`. Existe
um `useToast()` legado de shadcn que ainda é usado em alguns modais —
está OK, mas em código novo prefira `sonner`.

### Validação de formulários

`react-hook-form` + `zodResolver`. Schemas em `src/types/forms.ts`.
Validações específicas (CPF, CNPJ, telefone, moeda BR) em
`src/utils/validation.ts`.

### Estilização

Tailwind + shadcn/ui. Componentes shadcn em `src/components/ui/` — não
edite à toa, eles seguem a convenção upstream.

---

## Fluxos principais

### Criar um insumo

```
[InsumoModal] → [InsumoFormSteps stepper 3 etapas]
   1. Nome + descrição
   2. Categoria + unidade
   3. Fornecedores (opcional, pelo menos 1 recomendado)
        → [InsumoSupplierModal] valida precoComDesconto <= precoBruto
   ↓ Submit
[AppContext.addInsumo(insumoLocal)] (UUID já gerado)
   ↓ persist optimistic
[svc.createInsumo → Supabase] inserts in `insumos`
   ↓ trigger
[recalc_insumo_custo] re-deriva custo_por_unidade do fornecedor escolhido
```

### Importar vendas

```
[AnaliseVendas page] → [VendasImportModalSimples]
   ↓ Drop CSV
[AnaliseVendasService.processarArquivoVendas]
   - parseCSV → CsvRow[]
   - detectarColunasVendas → mapeia data/produto/quantidade/valor
   - para cada linha:
     • match com cardápio (por SKU ou nome similar)
     • calcula divergência, lucro, margem
     • classifica status (ok/divergencia/prejuizo)
   - retorna ResumoImportacao
   ↓ usuário confirma
[AppContext.addVendasRegistradas + initImportacao]
   ↓ persist
[svc.insertVendasRegistradas + svc.upsertImportacao]
   ↓ trigger BEFORE INSERT
[vendas_backfill] preenche preço/custo zerado a partir do cardápio
```

### Reconciliar produto sem match

```
[ProdutosSemMatchCard] agrupa not_found por produtoErpId
   ↓ usuário escolhe ItemCardapio do select
[AppContext.resolveProdutoMatch(vendaId, itemCardapioId)]
   ↓ persist (cada venda do bucket)
[svc.updateVendaProdutoMatch] update apenas dos campos permitidos
   ↓ trigger
[vendas_lock_snapshot] permite porque só item_cardapio_id e status_match mudaram
```
