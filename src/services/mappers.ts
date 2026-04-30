/**
 * Bidirectional mappers between Supabase row shapes (snake_case) and the
 * domain types used throughout the app (camelCase).
 *
 * Centralizing conversion here keeps every service file thin and avoids
 * spreading naming-convention drift across the codebase.
 */

import type {
  Categoria,
  Combinado,
  CombinadoComplemento,
  Configuracao,
  CopoBase,
  CopoBaseInsumo,
  Fornecedor,
  Insumo,
  InsumoFornecedor,
  ItemCardapio,
  Receita,
  ReceitaIngrediente,
  UnidadeMedida,
} from "@/types/database";
import type { CustoOperacional, CustoItem } from "@/types/custos-operacionais";
import type { VendaRegistrada } from "@/types/analise-vendas";
import type { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];

const toDate = (value: string | Date | null | undefined): Date =>
  value instanceof Date ? value : value ? new Date(value) : new Date();

const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

// ---------- Categoria -------------------------------------------------------
export const mapCategoriaRow = (row: Tables["categorias"]["Row"]): Categoria => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  cor: row.cor ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toCategoriaInsert = (
  c: Partial<Categoria>,
  userId: string
): Tables["categorias"]["Insert"] => ({
  ...(c.id ? { id: c.id } : {}),
  user_id: userId,
  nome: c.nome ?? "",
  descricao: c.descricao ?? null,
  cor: c.cor ?? null,
  ativo: c.ativo ?? true,
});

// ---------- UnidadeMedida ---------------------------------------------------
export const mapUnidadeRow = (row: Tables["unidades_medida"]["Row"]): UnidadeMedida => ({
  id: row.id,
  nome: row.nome,
  sigla: row.sigla,
  tipo: row.tipo,
  fatorConversao: num(row.fator_conversao, 1),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

// ---------- Fornecedor ------------------------------------------------------
export const mapFornecedorRow = (row: Tables["fornecedores"]["Row"]): Fornecedor => ({
  id: row.id,
  nome: row.nome,
  contato: row.contato ?? undefined,
  telefone: row.telefone ?? undefined,
  email: row.email ?? undefined,
  endereco: row.endereco ?? undefined,
  cnpj: row.cnpj ?? undefined,
  prazoEntrega: row.prazo_entrega ?? undefined,
  pedidoMinimo: row.pedido_minimo ?? undefined,
  observacoes: row.observacoes ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toFornecedorInsert = (
  f: Partial<Fornecedor>,
  userId: string
): Tables["fornecedores"]["Insert"] => ({
  ...(f.id ? { id: f.id } : {}),
  user_id: userId,
  nome: f.nome ?? "",
  contato: f.contato ?? null,
  telefone: f.telefone ?? null,
  email: f.email ?? null,
  endereco: f.endereco ?? null,
  cnpj: f.cnpj ?? null,
  prazo_entrega: f.prazoEntrega ?? null,
  pedido_minimo: f.pedidoMinimo ?? null,
  observacoes: f.observacoes ?? null,
  ativo: f.ativo ?? true,
});

// ---------- Insumo ----------------------------------------------------------
export const mapInsumoRow = (row: Tables["insumos"]["Row"]): Insumo => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  categoriaId: row.categoria_id ?? "",
  unidadeMedidaId: row.unidade_medida_id ?? "",
  fornecedorCalculoId: row.fornecedor_calculo_id ?? "",
  custoPorUnidade: row.custo_por_unidade ?? undefined,
  custoPorGrama: row.custo_por_grama ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toInsumoInsert = (
  i: Partial<Insumo>,
  userId: string
): Tables["insumos"]["Insert"] => ({
  ...(i.id ? { id: i.id } : {}),
  user_id: userId,
  nome: i.nome ?? "",
  descricao: i.descricao ?? null,
  categoria_id: i.categoriaId || null,
  unidade_medida_id: i.unidadeMedidaId || null,
  fornecedor_calculo_id: i.fornecedorCalculoId || null,
  custo_por_unidade: i.custoPorUnidade ?? null,
  custo_por_grama: i.custoPorGrama ?? null,
  ativo: i.ativo ?? true,
});

// ---------- InsumoFornecedor -----------------------------------------------
export const mapInsumoFornecedorRow = (
  row: Tables["insumo_fornecedores"]["Row"]
): InsumoFornecedor => ({
  id: row.id,
  insumoId: row.insumo_id,
  fornecedorId: row.fornecedor_id,
  precoBruto: num(row.preco_bruto),
  precoComDesconto: row.preco_com_desconto ?? undefined,
  quantidadeComprada: num(row.quantidade_comprada, 1),
  usarPrecoComDesconto: row.usar_preco_com_desconto,
  prazoEntrega: row.prazo_entrega ?? undefined,
  observacoes: row.observacoes ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toInsumoFornecedorInsert = (
  inf: Partial<InsumoFornecedor>,
  userId: string
): Tables["insumo_fornecedores"]["Insert"] => ({
  user_id: userId,
  insumo_id: inf.insumoId ?? "",
  fornecedor_id: inf.fornecedorId ?? "",
  preco_bruto: inf.precoBruto ?? 0,
  preco_com_desconto: inf.precoComDesconto ?? null,
  quantidade_comprada: inf.quantidadeComprada ?? 1,
  usar_preco_com_desconto: inf.usarPrecoComDesconto ?? false,
  prazo_entrega: inf.prazoEntrega ?? null,
  observacoes: inf.observacoes ?? null,
  ativo: inf.ativo ?? true,
});

// ---------- Receita ---------------------------------------------------------
export const mapReceitaRow = (row: Tables["receitas"]["Row"]): Receita => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  categoriaId: row.categoria_id ?? "",
  rendimento: num(row.rendimento),
  custoPorGrama: num(row.custo_por_grama),
  custoTotal: num(row.custo_total),
  tempoPreparo: row.tempo_preparo ?? undefined,
  instrucoes: row.instrucoes ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toReceitaInsert = (
  r: Partial<Receita>,
  userId: string
): Tables["receitas"]["Insert"] => ({
  ...(r.id ? { id: r.id } : {}),
  user_id: userId,
  nome: r.nome ?? "",
  descricao: r.descricao ?? null,
  categoria_id: r.categoriaId || null,
  rendimento: r.rendimento ?? 1,
  custo_por_grama: r.custoPorGrama ?? 0,
  custo_total: r.custoTotal ?? 0,
  tempo_preparo: r.tempoPreparo ?? null,
  instrucoes: r.instrucoes ?? null,
  ativo: r.ativo ?? true,
});

export const mapReceitaIngredienteRow = (
  row: Tables["receita_ingredientes"]["Row"]
): ReceitaIngrediente => ({
  id: row.id,
  receitaId: row.receita_id,
  insumoId: row.insumo_id,
  quantidade: num(row.quantidade),
  custo: num(row.custo),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

// ---------- CopoBase --------------------------------------------------------
export const mapCopoBaseRow = (row: Tables["copos_base"]["Row"]): CopoBase => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  categoriaId: row.categoria_id ?? "",
  insumoBaseId: row.insumo_base_id ?? "",
  quantidadeBase: num(row.quantidade_base),
  custoBase: num(row.custo_base),
  custoInsumos: num(row.custo_insumos),
  custoTotal: num(row.custo_total),
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toCopoBaseInsert = (
  c: Partial<CopoBase>,
  userId: string
): Tables["copos_base"]["Insert"] => ({
  ...(c.id ? { id: c.id } : {}),
  user_id: userId,
  nome: c.nome ?? "",
  descricao: c.descricao ?? null,
  categoria_id: c.categoriaId || null,
  insumo_base_id: c.insumoBaseId || null,
  quantidade_base: c.quantidadeBase ?? 0,
  custo_base: c.custoBase ?? 0,
  custo_insumos: c.custoInsumos ?? 0,
  custo_total: c.custoTotal ?? 0,
  ativo: c.ativo ?? true,
});

export const mapCopoBaseInsumoRow = (
  row: Tables["copo_base_insumos"]["Row"]
): CopoBaseInsumo => ({
  id: row.id,
  copoBaseId: row.copo_base_id,
  insumoId: row.insumo_id,
  quantidade: num(row.quantidade),
  custo: num(row.custo),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

// ---------- Combinado ------------------------------------------------------
export const mapCombinadoRow = (row: Tables["combinados"]["Row"]): Combinado => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  categoriaId: row.categoria_id ?? "",
  copoBaseId: row.copo_base_id ?? "",
  custoCopoBase: num(row.custo_copo_base),
  custoComplementos: num(row.custo_complementos),
  custoTotal: num(row.custo_total),
  precoSugerido: num(row.preco_sugerido),
  precoCardapio: row.preco_cardapio ?? undefined,
  precoVendaTotal: num(row.preco_venda_total),
  precoVendaSugerido: num(row.preco_venda_sugerido),
  margem: num(row.margem),
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toCombinadoInsert = (
  c: Partial<Combinado>,
  userId: string
): Tables["combinados"]["Insert"] => ({
  ...(c.id ? { id: c.id } : {}),
  user_id: userId,
  nome: c.nome ?? "",
  descricao: c.descricao ?? null,
  categoria_id: c.categoriaId || null,
  copo_base_id: c.copoBaseId || null,
  custo_copo_base: c.custoCopoBase ?? 0,
  custo_complementos: c.custoComplementos ?? 0,
  custo_total: c.custoTotal ?? 0,
  preco_sugerido: c.precoSugerido ?? 0,
  preco_cardapio: c.precoCardapio ?? null,
  preco_venda_total: c.precoVendaTotal ?? 0,
  preco_venda_sugerido: c.precoVendaSugerido ?? 0,
  margem: c.margem ?? 0,
  ativo: c.ativo ?? true,
});

export const mapCombinadoComplementoRow = (
  row: Tables["combinado_complementos"]["Row"]
): CombinadoComplemento => ({
  id: row.id,
  combinadoId: row.combinado_id,
  tipo: row.tipo,
  insumoId: row.insumo_id ?? undefined,
  receitaId: row.receita_id ?? undefined,
  quantidade: num(row.quantidade),
  custo: num(row.custo),
  precoVenda: row.preco_venda ?? undefined,
  itemCardapioId: row.item_cardapio_id ?? undefined,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

// ---------- Cardapio --------------------------------------------------------
export const mapCardapioRow = (row: Tables["cardapio"]["Row"]): ItemCardapio => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao ?? undefined,
  categoriaId: row.categoria_id ?? "",
  tipo: row.tipo,
  copoBaseId: row.copo_base_id ?? undefined,
  combinadoId: row.combinado_id ?? undefined,
  insumoId: row.insumo_id ?? undefined,
  receitaId: row.receita_id ?? undefined,
  custoAtual: num(row.custo_atual),
  precoAtual: num(row.preco_atual),
  margemAtual: num(row.margem_atual),
  precoNovo: row.preco_novo ?? undefined,
  margemNova: row.margem_nova ?? undefined,
  ativo: row.ativo,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toCardapioInsert = (
  c: Partial<ItemCardapio>,
  userId: string
): Tables["cardapio"]["Insert"] => ({
  ...(c.id ? { id: c.id } : {}),
  user_id: userId,
  nome: c.nome ?? "",
  descricao: c.descricao ?? null,
  categoria_id: c.categoriaId || null,
  tipo: c.tipo ?? "COPO_BASE",
  copo_base_id: c.copoBaseId ?? null,
  combinado_id: c.combinadoId ?? null,
  insumo_id: c.insumoId ?? null,
  receita_id: c.receitaId ?? null,
  custo_atual: c.custoAtual ?? 0,
  preco_atual: c.precoAtual ?? 0,
  margem_atual: c.margemAtual ?? 0,
  preco_novo: c.precoNovo ?? null,
  margem_nova: c.margemNova ?? null,
  ativo: c.ativo ?? true,
});

// ---------- Configuracao ----------------------------------------------------
export const mapConfiguracaoRow = (
  row: Tables["configuracao"]["Row"]
): Configuracao => ({
  id: row.id,
  markupPadrao: num(row.markup_padrao, 30),
  incluirImpostos: row.incluir_impostos,
  aliquotaImposto: row.aliquota_imposto ?? undefined,
  arredondarPrecos: row.arredondar_precos,
  custoFixoMensal: num(row.custo_fixo_mensal),
  custoEnergia: num(row.custo_energia),
  custoMaoObra: num(row.custo_mao_obra),
  taxaCartao: num(row.taxa_cartao),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const toConfiguracaoUpsert = (
  c: Partial<Configuracao>,
  userId: string
): Tables["configuracao"]["Insert"] => ({
  user_id: userId,
  markup_padrao: c.markupPadrao ?? 30,
  incluir_impostos: c.incluirImpostos ?? false,
  aliquota_imposto: c.aliquotaImposto ?? null,
  arredondar_precos: c.arredondarPrecos ?? false,
  custo_fixo_mensal: c.custoFixoMensal ?? 0,
  custo_energia: c.custoEnergia ?? 0,
  custo_mao_obra: c.custoMaoObra ?? 0,
  taxa_cartao: c.taxaCartao ?? 0,
});

// ---------- CustoOperacional -----------------------------------------------
export const mapCustoOperacionalRow = (
  row: Tables["custos_operacionais"]["Row"],
  itens: CustoItem[] = []
): CustoOperacional => ({
  id: row.id,
  mesReferencia: row.mes_referencia,
  tipo: row.tipo,
  valorTotal: num(row.valor_total),
  itens: row.tipo === "DETALHADO" ? itens : undefined,
  observacoes: row.observacoes ?? undefined,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export const mapCustoItemRow = (
  row: Tables["custo_itens"]["Row"]
): CustoItem => ({
  id: row.id,
  categoria: row.categoria,
  descricao: row.descricao ?? "",
  valor: num(row.valor),
  ordem: row.ordem,
});

// ---------- VendaRegistrada -------------------------------------------------
export const mapVendaRegistradaRow = (
  row: Tables["vendas_registradas"]["Row"]
): VendaRegistrada => ({
  id: row.id,
  importacaoId: row.importacao_id ?? "",
  vendaErpId: row.venda_erp_id,
  dataVenda: toDate(row.data_venda),
  produtoErpId: row.produto_erp_id ?? "",
  produtoNome: row.produto_nome,
  itemCardapioId: row.item_cardapio_id ?? "",
  itemCardapioNome: row.item_cardapio_nome ?? "",
  quantidade: num(row.quantidade, 1),
  precoUnitarioVendido: num(row.preco_unitario_vendido),
  precoTotalVendido: num(row.preco_total_vendido),
  precoCardapio: num(row.preco_cardapio),
  custoCalculado: num(row.custo_calculado),
  divergenciaValor: num(row.divergencia_valor),
  divergenciaPercentual: num(row.divergencia_percentual),
  lucroBrutoReal: num(row.lucro_bruto_real),
  lucroBrutoEsperado: num(row.lucro_bruto_esperado),
  margemReal: num(row.margem_real),
  margemEsperada: num(row.margem_esperada),
  statusMatch: row.status_match,
  statusAnalise: row.status_analise,
  vendedor: row.vendedor ?? undefined,
});
