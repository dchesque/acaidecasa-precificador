# Regras de Precificação

Documento canônico que descreve, **em uma fonte só**, todas as fórmulas e
políticas que o sistema aplica para chegar ao preço sugerido de cada item.
Quando o código contradisser este documento, a referência é o código em
`src/utils/calculations.ts` e os testes em
`src/utils/__tests__/calculations.test.ts`.

---

## 1. Cadeia de cálculo (visão geral)

```
Insumo
  custoPorUnidade = preço_fornecedor / quantidade_comprada
       │   ── usa precoComDesconto se usarPrecoComDesconto = true
       │   ── senão usa precoBruto
       ▼
Receita
  custoTotal     = Σ (custoPorUnidade × quantidade_no_ingrediente)
  custoPorGrama  = custoTotal / receita.rendimento
       ▼
Copo Base
  custoBase      = custoPorGrama(insumoBase) × quantidadeBase
  custoEmbalagem = configurável (default R$ 0,58)
  custoTotal     = custoBase + Σ custoInsumosExtras + custoEmbalagem
       ▼
Combinado
  custoCopoBase     = copoBase.custoTotal
  custoComplementos = Σ (custoUnitário × quantidade)         ← INSUMO ou RECEITA
  custoTotal        = soma dos dois
       ▼
Preço Sugerido     = roundIfConfigured( custo × markup × imposto )
       ▼
Margem (sobre venda) = (preço − custo) / preço × 100
Markup (sobre custo) = (preço − custo) / custo × 100
```

A propagação **é automática** no banco via triggers
(`supabase/migrations/0003_cascade_recalc.sql`):

| Mudou em… | Recalcula… |
|---|---|
| `insumo_fornecedores` | `insumo.custo_por_unidade` → cascata pra receitas/copos/combinados que usam |
| `insumos.custo_por_unidade` ou `fornecedor_calculo_id` | mesma cascata |
| `receita_ingredientes` | `receita.custo_total` + combinados que usam |
| `copo_base_insumos` | `copo_base.custo_total` + combinados que usam |
| `copos_base.insumo_base_id` ou `quantidade_base` | `copo_base.custo_total` + combinados |
| `combinado_complementos` | `combinado.custo_total` |

---

## 2. Custo do insumo por unidade

`calculations.ts:calcularCustoPorGrama`

1. Encontra a relação ativa em `insumoFornecedores` para
   `(insumo.id, insumo.fornecedorCalculoId)`.
2. Se `usarPrecoComDesconto === true` **e** `precoComDesconto > 0`, usa o
   desconto. Senão usa `precoBruto`.
3. Retorna `preço / quantidadeComprada`.
4. Se a relação não existe ou a quantidade é zero, **fallback** para
   `insumo.custoPorUnidade` se for número positivo; senão retorna **0**.

Apesar do nome histórico (`calcularCustoPorGrama`), o resultado é "custo por
unidade declarada do insumo" — pode ser g, ml ou unidade. A unidade vem de
`insumo.unidadeMedidaId`.

### Validação de fornecedor (Zod + DB)

- `precoComDesconto` deve ser `> 0` e `<= precoBruto`. O zero ou ausência
  significa "sem desconto" e é tratado como `undefined` no banco.
- Constraint SQL no schema (`0001_initial_schema.sql`):
  ```sql
  check (
    preco_com_desconto is null
    or (preco_com_desconto > 0 and preco_com_desconto <= preco_bruto)
  )
  ```

---

## 3. Custo da receita

`calculations.ts:calcularCustoReceita`

```
custoTotal = Σ (custoPorUnidade(ingrediente.insumo) × ingrediente.quantidade)
custoPorGrama = custoTotal / receita.rendimento
```

`rendimento` é declarado em **gramas** (ou ml para receitas líquidas).
`rendimento <= 0` → SQL `CHECK` rejeita o insert; no front, validation
pré-submit faz a mesma checagem.

Quando o custo de um insumo muda, o trigger
`recalc_receita(receita_id)` atualiza:

1. `receita_ingredientes.custo` linha por linha
2. `receita.custo_total` (soma)
3. `receita.custo_por_grama` (custo total ÷ rendimento)

---

## 4. Custo do copo base

`calculations.ts:calcularCustoCopoBase`

```
custoBase      = custoPorUnidade(insumoBase) × quantidadeBase
custoInsumos   = Σ (custoPorUnidade × quantidade) dos insumos extras
custoEmbalagem = override do chamador OU CUSTO_EMBALAGEM_PADRAO (R$ 0,58)
custoTotal     = custoBase + custoInsumos + custoEmbalagem
```

A embalagem é hard-coded no SQL trigger (`recalc_copo_base`) também em
**R$ 0,58** para manter as duas camadas alinhadas. Se você mudar, **mude
nas duas**:
- `src/utils/calculations.ts` → constante `CUSTO_EMBALAGEM_PADRAO`
- `supabase/migrations/0003_cascade_recalc.sql` → variável `v_packaging`

### Override por copo (futura feature)

A função `calcularCustoCopoBase` aceita um 4º parâmetro
`custoEmbalagemOverride`. O código atual não passa esse valor — quando o
módulo de **embalagens cadastráveis** entrar no roadmap, basta passar o
valor da embalagem selecionada por copo.

---

## 5. Custo do combinado

`calculations.ts:calcularCustoCombo`

```
custoCopoBase     = copoBase.custoTotal (já com embalagem)
custoComplementos = Σ (custoComplemento × quantidade)
custoTotal        = soma dos dois
```

Para cada complemento (`tipo: 'INSUMO' | 'RECEITA'`):
- `INSUMO`: `custoPorUnidade(insumo) × quantidade`
- `RECEITA`: `receita.custoPorGrama × quantidade`

A SQL constraint força que **exatamente um** dos campos `insumo_id` ou
`receita_id` esteja preenchido, conforme o `tipo`.

---

## 6. Preço sugerido

`calculations.ts:calcularPrecoSugerido`

```
1. Se custo <= 0 ou inválido → retorna 0
2. Se markupPadrao = 0 → retorna roundToCent(custo)
3. preço = custo × (1 + markupPadrao / 100)
4. Se incluirImpostos:
     aliquota = configuracao.aliquotaImposto ?? 10
     preço *= (1 + aliquota / 100)
5. Se arredondarPrecos = true:
     preço = Math.round(preço × 100) / 100   ← arredonda ao centavo
6. Retorna preço
```

### Decisões importantes

- **Ordem fixa**: markup primeiro, imposto depois, arredondamento por
  último. Mudar a ordem mudaria a base de cálculo do imposto.
- **Arredondamento ao centavo**, não ao real. A versão pré-Fase 0 usava
  `Math.ceil(preço)` que perdia até R$ 0,99 de margem por item.
- **Imposto opcional**: `aliquotaImposto` faz parte da `Configuracao`. Se
  não preenchido, default é 10% (compatível com o comportamento legado).
  Para deixar sem imposto, marque `incluirImpostos = false` (a alíquota
  é ignorada).

---

## 7. Margem vs Markup (terminologia)

| Termo | Fórmula | Quando usar |
|---|---|---|
| **Margem** | `(preço − custo) / preço × 100` | Análise sobre faturamento, "X% do que vendi é lucro" |
| **Markup** | `(preço − custo) / custo × 100` | Estratégia de precificação, "subo o custo em X%" |

Os dois são expostos por `calcularMargem` e `calcularMarkup`. A UI usa
**margem** em todo lugar exceto na configuração inicial do markup padrão
(que faz sentido como markup, pois é um multiplicador sobre o custo).

Edge cases:
- `calcularMargem` retorna 0 quando `preço <= 0` (sem divisão por zero)
- `calcularMarkup` retorna 0 quando `custo <= 0`

---

## 8. Preço de venda do combinado a partir do cardápio

`calculations.ts:calcularPrecoVendaCombinado`

Essa função **não** calcula custo — calcula o preço de venda esperado
**se** o cliente comprasse cada componente separado (copo base +
complementos) ao preço de cardápio.

```
precoCopoBase     = cardapio.precoAtual do copo base, ou null
precoComplementos = Σ (precoAtual × quantidade) dos complementos
precoVendaTotal   = (precoCopoBase ?? 0) + precoComplementos
```

Itens **não cadastrados** no cardápio retornam `null` em `precoCopoBase`,
e o resumo `verificarComboPrecoCompleto` retorna `false` — a UI exibe um
aviso "combo incompleto". Itens com preço **R$ 0,00** são tratados como
gratuitos válidos (regressão conhecida e corrigida em
`obterPrecoVendaItem`).

A função `calcularEconomiaCombinado(precoCombo, precoIndividual)` calcula
quanto o cliente economiza comprando o combo:

```
economia            = precoIndividual − precoCombo
porcentagemDesconto = economia / precoIndividual × 100   (0 se individual = 0)
temDesconto         = economia > 0
```

---

## 9. Análise de divergência de vendas

`vendasCalculations.ts:classificarVenda` /
`classificarSeveridadeDivergencia`

Ao importar uma planilha, cada linha vira uma `VendaRegistrada` com:

- `divergenciaValor = precoUnitarioVendido − precoCardapio`
- `divergenciaPercentual = divergenciaValor / precoCardapio × 100`
- `lucroBrutoReal = precoTotalVendido − custoCalculado`
- `margemReal = lucroBrutoReal / precoTotalVendido × 100`

Status (`statusAnalise`):

| Status | Quando |
|---|---|
| `prejuizo` | `margemReal < 0` |
| `divergencia` | `\|divergenciaPercentual\| > 5%` (e não é prejuízo) |
| `ok` | caso contrário |

Severidade granular (`classificarSeveridadeDivergencia`):

| Severidade | Faixa |
|---|---|
| `grave` | `\|div\| > 15%` |
| `leve` | `5% < \|div\| ≤ 15%` |
| `ok` | `\|div\| ≤ 5%` |

Os **limites são exportados** como
`LIMITE_DIVERGENCIA_LEVE` (5) e `LIMITE_DIVERGENCIA_GRAVE` (15) em
`vendasCalculations.ts`.

---

## 10. Imutabilidade do snapshot de venda

`supabase/migrations/0004_vendas_immutability.sql`

Uma `vendas_registradas.linha` é um fato histórico. Após inserir, o
trigger `vendas_lock_snapshot` bloqueia alteração nas colunas:

```
preco_cardapio, custo_calculado, lucro_*, margem_*, divergencia_*,
preco_total_vendido, preco_unitario_vendido, quantidade,
data_venda, venda_erp_id
```

**Apenas** estes campos podem ser alterados (fluxo de reconciliação
manual):

- `item_cardapio_id`
- `item_cardapio_nome`
- `status_match` (vai para `'manual'` ao vincular)
- `status_analise`
- `vendedor`

Resultado: relatórios históricos não mudam quando o cardápio é
atualizado depois.

### Backfill defensivo

O trigger `vendas_backfill` (BEFORE INSERT) preenche `preco_cardapio` e
`custo_calculado` a partir do cardápio atual quando o cliente envia 0,
desde que `item_cardapio_id` esteja set. Em seguida recomputa todos os
derivados. Isso evita corrupção se uma versão antiga do front esquecer
de calcular antes de salvar.

---

## 11. Períodos e datas

`periodoUtils.ts`

- **`criarPeriodoCustomizado(inicio, fim)`** usa `Date.UTC` para o cálculo
  de dias totais, evitando saltos de DST (a versão antiga somava 1 dia
  errado em fronteiras de timezone). O período `mesmo-dia → mesmo-dia`
  retorna `1`, não `2`.
- **`criarPeriodoMesCompleto("2024-02")`** usa o construtor `new Date(ano,
  mes, 0)` que retorna o último dia do mês — funciona corretamente para
  fevereiro bissexto (29) e não-bissexto (28).
- **Agrupamento por semana** (`vendasCalculations.calcularTendencia`):
  semana = `floor((diaDoMes − 1) / 7) + 1`. Dias 29-31 caem na semana 5
  (corrigido — antes caíam erroneamente na 4).

---

## 12. Variação percentual em comparativos

`calculosFinanceiros.ts:calcularVariacaoPercentual`

Usado para comparar mês atual vs anterior no Dashboard de Gestão.

```
se valorAnterior == 0:
  100 se valorAtual > 0
  −100 se valorAtual < 0
  0 se ambos 0
senão:
  (valorAtual − valorAnterior) / |valorAnterior| × 100
```

O `Math.abs(valorAnterior)` no denominador é **crítico** para que um
prejuízo menor seja mostrado como crescimento positivo, não como queda.
Exemplo: ir de −100 para −50 é **+50%** (prejuízo encolheu pela metade),
não −50%.

---

## 13. Tendência e projeção

`calculosFinanceiros.ts`

- **`determinarTendencia(valores)`** divide a série em duas metades, compara
  as médias, classifica em `crescimento` (>5% acima), `queda` (>5% abaixo)
  ou `estavel`. Tem guard contra `mediaInicial = 0` para não dividir por
  zero.
- **`calcularProjecao(historicos, períodos)`** faz regressão linear
  simples. Se o denominador da regressão é zero (todos os x iguais ou
  apenas 1 ponto), repete o último valor — nunca retorna `NaN`.
- **`identificarOutliers(valores)`** usa critério IQR × 1.5. Retorna
  array vazio se há menos de 4 amostras.

Todos os helpers retornam **0** em vez de `NaN`/`Infinity` quando um
denominador é zero. Cobertos por testes em
`calculosFinanceiros.test.ts`.
