# Glossário do Domínio

Definições curtas das entidades e termos do app. Use isso pra alinhar
linguagem com pessoas de produto / atendimento.

---

## Entidades

### Categoria
**Classificação livre** que o operador define para agrupar visualmente
insumos, receitas, copos, combinados ou itens do cardápio. Tem `nome`,
`cor` (hex) e `ativo`. Cada `Categoria` pertence a um `user_id` (RLS).

### Unidade de medida
Unidade em que um insumo é vendido pelo fornecedor: `g`, `kg`, `ml`, `l`,
`un`, etc. Tem `tipo` (`PESO` | `VOLUME` | `UNIDADE`) e `fatorConversao`
(ex.: 1 kg = 1000 g). Todo novo usuário começa com 5 unidades padrão
seedadas pelo trigger `seed_user_defaults`.

### Fornecedor
Empresa ou pessoa que fornece insumos. Tem nome, CNPJ, contato, prazo de
entrega, pedido mínimo. Pode estar `ativo` ou inativo (sem deletar). Um
fornecedor inativo não aparece como opção em formulários de novo insumo.

### Insumo
**Matéria-prima** comprada de fornecedores. Pode ser polpa de açaí,
banana, granola, copo descartável, colher, etc. Tem:
- Categoria (livre)
- Unidade de medida (`g`, `kg`, etc.)
- Fornecedor de cálculo (`fornecedorCalculoId`) — qual fornecedor é usado
  para derivar o `custoPorUnidade`
- Lista de relações `InsumoFornecedor` com **vários fornecedores** e
  **preços diferentes** para o mesmo insumo (cotação, comparativo)

### InsumoFornecedor
Tabela de junção que armazena, **por insumo + fornecedor**:
- `precoBruto` (preço integral)
- `precoComDesconto` (opcional, valida `> 0` e `<= precoBruto`)
- `usarPrecoComDesconto` (qual usar no cálculo)
- `quantidadeComprada` (quanto vem na embalagem do fornecedor)
- `prazoEntrega` específico desse fornecedor
- `ativo` (pode desativar sem perder histórico)

### Receita
**Produção interna** que transforma vários insumos em um produto
intermediário (creme de açaí, mousse de morango, granola caseira). Tem:
- `rendimento` em gramas/ml — quanto a receita produz no total
- `ingredientes` (lista de `ReceitaIngrediente`)
- `custoPorGrama` (calculado: custo total ÷ rendimento)
- `tempoPreparo`, `instrucoes` (informativo, não entra em cálculo)

### ReceitaIngrediente
Linha que diz "esta receita usa X gramas/ml/un do insumo Y". Tem
`quantidade` (na unidade do insumo) e `custo` calculado.

### Copo Base
**Tamanho de copo** com a base já montada — copo de 300 ml, copo de 500
ml, etc. Tem:
- Insumo base (`insumoBaseId`) — geralmente o açaí em si
- `quantidadeBase` em gramas/ml
- Insumos extras opcionais (frutas inclusas, gelo, etc.)
- Custo da embalagem (R$ 0,58 padrão, configurável)
- `custoTotal` = base + extras + embalagem

### Combinado
**Produto pré-montado** vendido com nome próprio: "Açaí da Casa", "Combo
Família", "Açaí Tropical". Tem:
- Copo base de referência (`copoBaseId`)
- Lista de complementos (`CombinadoComplemento`)
- Cálculos automáticos: custo total, preço sugerido, margem
- Preço cardápio opcional (real preço de venda)

### CombinadoComplemento
Item adicional de um combinado. Pode ser **`tipo: 'INSUMO'`** (granola,
calda, fruta picada) ou **`tipo: 'RECEITA'`** (creme caseiro, mousse).
A constraint SQL exige que **exatamente um** dos campos `insumoId` ou
`receitaId` esteja preenchido conforme o tipo.

### Item do Cardápio (`ItemCardapio`)
**Linha do cardápio público** com nome, descrição, categoria, e
**preço atual** que o cliente vê. Pode apontar para um copo base,
combinado, insumo solto (toppings vendidos avulsos) ou receita pronta.

Tem:
- `tipo`: `COPO_BASE` | `COMBINADO` | `INSUMO` | `RECEITA`
- `precoAtual` (o preço cobrado hoje)
- `custoAtual` (snapshot do custo no momento)
- `margemAtual` (calculada)
- `precoNovo` + `margemNova` (slot pra simulação de novos preços)
- `ordem` (para drag-drop no cardápio)

### Configuração
Linha única por usuário com **políticas globais de precificação**:
- `markupPadrao` — % aplicado por padrão sobre o custo
- `incluirImpostos` + `aliquotaImposto` — se aplica imposto e qual
- `arredondarPrecos` — arredondar ao centavo após o cálculo
- `custoFixoMensal`, `custoEnergia`, `custoMaoObra`, `taxaCartao` — campos
  informativos para análise de saúde financeira

### Custo Operacional
**Despesa fixa mensal** do negócio: aluguel, energia, água, salários,
internet, contador, marketing. Tem dois "tipos":
- `RAPIDO` — único valor agregado (`valorTotal`)
- `DETALHADO` — quebrado em vários `CustoItem` por categoria

Permite migrar de Rápido → Detalhado sem perder histórico (modal
`ConversaoRapidoParaDetalhado`).

### Importação de Vendas
Cabeçalho de uma operação de upload de planilha. Guarda nome do arquivo,
mês de referência, totais (registros / importados / duplicados / sem
match) e status (`PROCESSANDO` | `CONCLUIDA` | `FALHA`).

### Venda Registrada
**Linha do ERP** importada. Cada venda tem:
- ID único do ERP (`vendaErpId`) — usado para detectar duplicatas
- Snapshot de preço, quantidade, valor total, data
- Match com `itemCardapioId` (status `matched` | `not_found` | `manual`)
- Snapshot de `precoCardapio` e `custoCalculado` no momento da venda
- Cálculos derivados: divergência, lucro real, margem real, status de
  análise (`ok` | `divergencia` | `prejuizo`)

**Imutável após inserção** (trigger `vendas_lock_snapshot`) — só permite
mudar `item_cardapio_id`, `item_cardapio_nome`, `status_match`,
`status_analise` e `vendedor` (fluxo de reconciliação manual).

---

## Termos de processo

### Match (matching de produtos)
Quando importamos vendas, cada linha tenta achar correspondente no
cardápio. Estratégia:
1. SKU/código exato (`produtoErpId == itemCardapio.codigo`)
2. Nome similar (case-insensitive, stripped)
3. Se não acha → `statusMatch = 'not_found'`

A vinculação manual (via `<ProdutosSemMatchCard />`) muda para
`statusMatch = 'manual'`.

### Divergência
Diferença entre o preço **vendido** (do ERP) e o preço **cardápio**.
Pode ser positiva (cliente pagou mais — taxa de entrega? promoção
revertida?) ou negativa (desconto manual no caixa).

| Severidade | Faixa de divergência |
|---|---|
| `ok` | até 5% |
| `leve` | 5% a 15% |
| `grave` | acima de 15% |

### Prejuízo
Status especial: a margem real **da própria venda** ficou negativa.
Sobrescreve qualquer `divergencia`.

### Modo Demo / Mock Mode
App rodando sem `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
configuradas. Estado vive em memória, dados de exemplo são pré-populados,
nada persiste. Banner amarelo no topo deixa esse estado claro.

### Hidratação (`useHydrateAppContext`)
Após o login, o app dispara 13 queries em paralelo para popular o
AppContext com **todos os dados do usuário** de uma vez. Implementado
no `<HydrationGate />` no `app/providers.tsx`.

### Cascata de recálculo
Quando o custo de um insumo muda, o banco propaga automaticamente:
1. Recalcula `insumos.custo_por_unidade`
2. Recalcula `receita_ingredientes` que usam → `receitas`
3. Recalcula `copo_base_insumos` que usam → `copos_base`
4. Recalcula `combinados` que dependem dos copos/receitas afetados

Tudo dentro de uma transação. Implementado nos triggers de
`0003_cascade_recalc.sql`.

### Imutabilidade do snapshot
Política de que **vendas registradas são fatos históricos** e não podem
mudar de valor depois. Implementada via trigger
`vendas_lock_snapshot`.

---

## Atalhos de tipo

- **`g/ml/un`** — sigla da unidade do insumo
- **`R$`** — Real brasileiro, sempre formatado com `Intl.NumberFormat`
  pt-BR (`R$ 12,50` — vírgula decimal)
- **`%`** — sempre formatado com vírgula também (`12,5%`)
- **`mesReferencia`** — formato `YYYY-MM` (string), ex.: `"2024-03"`
