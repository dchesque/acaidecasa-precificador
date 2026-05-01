/**
 * Supabase service layer.
 *
 * Each function performs a single CRUD operation and returns the domain
 * type (camelCase) — Supabase row mapping happens in `services/mappers.ts`.
 *
 * Conventions:
 *   - All `list*` functions filter by the authenticated user implicitly via RLS
 *     (no manual `.eq("user_id", ...)` needed, but adding it doesn't hurt).
 *   - All `create*`/`update*` functions return the persisted row.
 *   - Errors throw `SupabaseError` so call sites can show a toast.
 */

import { getSupabase } from "@/lib/supabase/client";
import {
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
import { CustoOperacional, CustoItem } from "@/types/custos-operacionais";
import { ImportacaoVendas, VendaRegistrada } from "@/types/analise-vendas";
import {
  mapCardapioRow,
  mapCategoriaRow,
  mapCombinadoComplementoRow,
  mapCombinadoRow,
  mapConfiguracaoRow,
  mapCopoBaseInsumoRow,
  mapCopoBaseRow,
  mapCustoItemRow,
  mapCustoOperacionalRow,
  mapFornecedorRow,
  mapImportacaoRow,
  mapInsumoFornecedorRow,
  mapInsumoRow,
  mapReceitaIngredienteRow,
  mapReceitaRow,
  mapUnidadeRow,
  mapVendaRegistradaRow,
  toCardapioInsert,
  toCategoriaInsert,
  toCombinadoInsert,
  toConfiguracaoUpsert,
  toCopoBaseInsert,
  toFornecedorInsert,
  toImportacaoInsert,
  toInsumoFornecedorInsert,
  toInsumoInsert,
  toReceitaInsert,
} from "@/services/mappers";
import { requireUserId, SupabaseError } from "./_helpers";

const throwIf = (error: unknown, msg: string): never => {
  throw new SupabaseError(msg, error);
};

// ============================================================================
// CATEGORIAS
// ============================================================================
export const listCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await getSupabase().from("categorias").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar categorias");
  return (data ?? []).map(mapCategoriaRow);
};

export const createCategoria = async (c: Partial<Categoria>): Promise<Categoria> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("categorias")
    .insert(toCategoriaInsert(c, userId))
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao criar categoria");
  return mapCategoriaRow(data!);
};

export const updateCategoria = async (id: string, c: Partial<Categoria>): Promise<Categoria> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("categorias")
    .update(toCategoriaInsert(c, userId))
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao atualizar categoria");
  return mapCategoriaRow(data!);
};

export const deleteCategoria = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("categorias").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir categoria");
};

// ============================================================================
// UNIDADES DE MEDIDA
// ============================================================================
export const listUnidadesMedida = async (): Promise<UnidadeMedida[]> => {
  const { data, error } = await getSupabase()
    .from("unidades_medida")
    .select("*")
    .order("nome");
  if (error) throwIf(error, "Falha ao listar unidades");
  return (data ?? []).map(mapUnidadeRow);
};

// ============================================================================
// FORNECEDORES
// ============================================================================
export const listFornecedores = async (): Promise<Fornecedor[]> => {
  const { data, error } = await getSupabase().from("fornecedores").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar fornecedores");
  return (data ?? []).map(mapFornecedorRow);
};

export const createFornecedor = async (f: Partial<Fornecedor>): Promise<Fornecedor> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("fornecedores")
    .insert(toFornecedorInsert(f, userId))
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao criar fornecedor");
  return mapFornecedorRow(data!);
};

export const updateFornecedor = async (
  id: string,
  f: Partial<Fornecedor>
): Promise<Fornecedor> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("fornecedores")
    .update(toFornecedorInsert(f, userId))
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao atualizar fornecedor");
  return mapFornecedorRow(data!);
};

export const deleteFornecedor = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("fornecedores").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir fornecedor");
};

// ============================================================================
// INSUMOS + INSUMO_FORNECEDORES
// ============================================================================
export const listInsumos = async (): Promise<Insumo[]> => {
  const { data, error } = await getSupabase().from("insumos").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar insumos");
  return (data ?? []).map(mapInsumoRow);
};

export const createInsumo = async (i: Partial<Insumo>): Promise<Insumo> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("insumos")
    .insert(toInsumoInsert(i, userId))
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao criar insumo");
  return mapInsumoRow(data!);
};

export const updateInsumo = async (id: string, i: Partial<Insumo>): Promise<Insumo> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("insumos")
    .update(toInsumoInsert(i, userId))
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao atualizar insumo");
  return mapInsumoRow(data!);
};

export const deleteInsumo = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("insumos").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir insumo");
};

export const listInsumoFornecedores = async (): Promise<InsumoFornecedor[]> => {
  const { data, error } = await getSupabase().from("insumo_fornecedores").select("*");
  if (error) throwIf(error, "Falha ao listar insumo-fornecedores");
  return (data ?? []).map(mapInsumoFornecedorRow);
};

export const upsertInsumoFornecedor = async (
  inf: Partial<InsumoFornecedor>
): Promise<InsumoFornecedor> => {
  const userId = await requireUserId();
  const payload = toInsumoFornecedorInsert(inf, userId);
  const query = inf.id
    ? getSupabase().from("insumo_fornecedores").update(payload).eq("id", inf.id)
    : getSupabase().from("insumo_fornecedores").insert(payload);
  const { data, error } = await query.select().single();
  if (error || !data) throwIf(error, "Falha ao salvar fornecedor do insumo");
  return mapInsumoFornecedorRow(data!);
};

export const deleteInsumoFornecedor = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("insumo_fornecedores").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir fornecedor do insumo");
};

// ============================================================================
// RECEITAS + RECEITA_INGREDIENTES
// ============================================================================
export const listReceitas = async (): Promise<Receita[]> => {
  const { data, error } = await getSupabase().from("receitas").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar receitas");
  return (data ?? []).map(mapReceitaRow);
};

export const listReceitaIngredientes = async (): Promise<ReceitaIngrediente[]> => {
  const { data, error } = await getSupabase().from("receita_ingredientes").select("*");
  if (error) throwIf(error, "Falha ao listar ingredientes de receita");
  return (data ?? []).map(mapReceitaIngredienteRow);
};

export const saveReceitaWithIngredientes = async (
  receita: Partial<Receita>,
  ingredientes: Partial<ReceitaIngrediente>[]
): Promise<Receita> => {
  const userId = await requireUserId();
  const supabase = getSupabase();

  const payload = toReceitaInsert(receita, userId);
  const { data: row, error } = receita.id
    ? await supabase.from("receitas").update(payload).eq("id", receita.id).select().single()
    : await supabase.from("receitas").insert(payload).select().single();

  if (error || !row) throwIf(error, "Falha ao salvar receita");

  // Replace ingredientes en bloc — simpler than diff'ing.
  await supabase.from("receita_ingredientes").delete().eq("receita_id", row!.id);
  if (ingredientes.length > 0) {
    const { error: ingError } = await supabase.from("receita_ingredientes").insert(
      ingredientes.map((ing) => ({
        user_id: userId,
        receita_id: row!.id,
        insumo_id: ing.insumoId ?? "",
        quantidade: ing.quantidade ?? 0,
        custo: ing.custo ?? 0,
      }))
    );
    if (ingError) throwIf(ingError, "Falha ao salvar ingredientes da receita");
  }

  return mapReceitaRow(row!);
};

export const deleteReceita = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("receitas").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir receita");
};

// ============================================================================
// COPOS BASE + COPO_BASE_INSUMOS
// ============================================================================
export const listCoposBase = async (): Promise<CopoBase[]> => {
  const { data, error } = await getSupabase().from("copos_base").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar copos base");
  return (data ?? []).map(mapCopoBaseRow);
};

export const listCopoBaseInsumos = async (): Promise<CopoBaseInsumo[]> => {
  const { data, error } = await getSupabase().from("copo_base_insumos").select("*");
  if (error) throwIf(error, "Falha ao listar insumos de copo");
  return (data ?? []).map(mapCopoBaseInsumoRow);
};

export const saveCopoBaseWithInsumos = async (
  copoBase: Partial<CopoBase>,
  insumos: Partial<CopoBaseInsumo>[]
): Promise<CopoBase> => {
  const userId = await requireUserId();
  const supabase = getSupabase();

  const payload = toCopoBaseInsert(copoBase, userId);
  const { data: row, error } = copoBase.id
    ? await supabase.from("copos_base").update(payload).eq("id", copoBase.id).select().single()
    : await supabase.from("copos_base").insert(payload).select().single();

  if (error || !row) throwIf(error, "Falha ao salvar copo base");

  await supabase.from("copo_base_insumos").delete().eq("copo_base_id", row!.id);
  if (insumos.length > 0) {
    const { error: insError } = await supabase.from("copo_base_insumos").insert(
      insumos.map((ins) => ({
        user_id: userId,
        copo_base_id: row!.id,
        insumo_id: ins.insumoId ?? "",
        quantidade: ins.quantidade ?? 0,
        custo: ins.custo ?? 0,
      }))
    );
    if (insError) throwIf(insError, "Falha ao salvar insumos do copo base");
  }

  return mapCopoBaseRow(row!);
};

export const deleteCopoBase = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("copos_base").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir copo base");
};

// ============================================================================
// COMBINADOS + COMBINADO_COMPLEMENTOS
// ============================================================================
export const listCombinados = async (): Promise<Combinado[]> => {
  const { data, error } = await getSupabase().from("combinados").select("*").order("nome");
  if (error) throwIf(error, "Falha ao listar combinados");
  return (data ?? []).map(mapCombinadoRow);
};

export const listCombinadoComplementos = async (): Promise<CombinadoComplemento[]> => {
  const { data, error } = await getSupabase().from("combinado_complementos").select("*");
  if (error) throwIf(error, "Falha ao listar complementos");
  return (data ?? []).map(mapCombinadoComplementoRow);
};

export const saveCombinadoWithComplementos = async (
  combinado: Partial<Combinado>,
  complementos: Partial<CombinadoComplemento>[]
): Promise<Combinado> => {
  const userId = await requireUserId();
  const supabase = getSupabase();

  const payload = toCombinadoInsert(combinado, userId);
  const { data: row, error } = combinado.id
    ? await supabase.from("combinados").update(payload).eq("id", combinado.id).select().single()
    : await supabase.from("combinados").insert(payload).select().single();

  if (error || !row) throwIf(error, "Falha ao salvar combinado");

  await supabase.from("combinado_complementos").delete().eq("combinado_id", row!.id);
  if (complementos.length > 0) {
    const { error: compError } = await supabase.from("combinado_complementos").insert(
      complementos.map((comp) => ({
        user_id: userId,
        combinado_id: row!.id,
        tipo: comp.tipo!,
        insumo_id: comp.tipo === "INSUMO" ? comp.insumoId ?? null : null,
        receita_id: comp.tipo === "RECEITA" ? comp.receitaId ?? null : null,
        quantidade: comp.quantidade ?? 0,
        custo: comp.custo ?? 0,
        preco_venda: comp.precoVenda ?? null,
        item_cardapio_id: comp.itemCardapioId ?? null,
      }))
    );
    if (compError) throwIf(compError, "Falha ao salvar complementos");
  }

  return mapCombinadoRow(row!);
};

export const deleteCombinado = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("combinados").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir combinado");
};

// ============================================================================
// CARDAPIO
// ============================================================================
export const listCardapio = async (): Promise<ItemCardapio[]> => {
  const { data, error } = await getSupabase().from("cardapio").select("*").order("ordem");
  if (error) throwIf(error, "Falha ao listar cardápio");
  return (data ?? []).map(mapCardapioRow);
};

export const upsertCardapio = async (item: Partial<ItemCardapio>): Promise<ItemCardapio> => {
  const userId = await requireUserId();
  const payload = toCardapioInsert(item, userId);
  const query = item.id
    ? getSupabase().from("cardapio").update(payload).eq("id", item.id)
    : getSupabase().from("cardapio").insert(payload);
  const { data, error } = await query.select().single();
  if (error || !data) throwIf(error, "Falha ao salvar item do cardápio");
  return mapCardapioRow(data!);
};

export const deleteCardapio = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("cardapio").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir item do cardápio");
};

// ============================================================================
// CONFIGURACAO
// ============================================================================
export const getConfiguracao = async (): Promise<Configuracao | null> => {
  const { data, error } = await getSupabase()
    .from("configuracao")
    .select("*")
    .maybeSingle();
  if (error) throwIf(error, "Falha ao buscar configuração");
  return data ? mapConfiguracaoRow(data) : null;
};

export const upsertConfiguracao = async (
  c: Partial<Configuracao>
): Promise<Configuracao> => {
  const userId = await requireUserId();
  const { data, error } = await getSupabase()
    .from("configuracao")
    .upsert(toConfiguracaoUpsert(c, userId), { onConflict: "user_id" })
    .select()
    .single();
  if (error || !data) throwIf(error, "Falha ao salvar configuração");
  return mapConfiguracaoRow(data!);
};

// ============================================================================
// CUSTOS OPERACIONAIS
// ============================================================================
export const listCustosOperacionais = async (): Promise<CustoOperacional[]> => {
  const supabase = getSupabase();
  const { data: custos, error: cErr } = await supabase
    .from("custos_operacionais")
    .select("*")
    .order("mes_referencia", { ascending: false });
  if (cErr) throwIf(cErr, "Falha ao listar custos operacionais");

  const { data: itens, error: iErr } = await supabase.from("custo_itens").select("*");
  if (iErr) throwIf(iErr, "Falha ao listar itens de custo");

  const itensByCusto = new Map<string, CustoItem[]>();
  (itens ?? []).forEach((row) => {
    const list = itensByCusto.get(row.custo_operacional_id) ?? [];
    list.push(mapCustoItemRow(row));
    itensByCusto.set(row.custo_operacional_id, list);
  });

  return (custos ?? []).map((c) =>
    mapCustoOperacionalRow(c, (itensByCusto.get(c.id) ?? []).sort((a, b) => a.ordem - b.ordem))
  );
};

export const saveCustoOperacional = async (
  custo: Partial<CustoOperacional>
): Promise<CustoOperacional> => {
  const userId = await requireUserId();
  const supabase = getSupabase();

  const payload = {
    user_id: userId,
    mes_referencia: custo.mesReferencia ?? "",
    tipo: custo.tipo ?? "RAPIDO",
    valor_total: custo.valorTotal ?? 0,
    observacoes: custo.observacoes ?? null,
  };

  const { data: row, error } = custo.id
    ? await supabase.from("custos_operacionais").update(payload).eq("id", custo.id).select().single()
    : await supabase
        .from("custos_operacionais")
        .upsert(payload, { onConflict: "user_id,mes_referencia" })
        .select()
        .single();
  if (error || !row) throwIf(error, "Falha ao salvar custo operacional");

  await supabase.from("custo_itens").delete().eq("custo_operacional_id", row!.id);
  const itens = custo.itens ?? [];
  if (itens.length > 0) {
    const { error: iErr } = await supabase.from("custo_itens").insert(
      itens.map((item, idx) => ({
        user_id: userId,
        custo_operacional_id: row!.id,
        categoria: item.categoria,
        descricao: item.descricao ?? null,
        valor: item.valor,
        ordem: item.ordem ?? idx,
      }))
    );
    if (iErr) throwIf(iErr, "Falha ao salvar itens de custo");
  }

  return mapCustoOperacionalRow(row!, itens);
};

export const deleteCustoOperacional = async (id: string): Promise<void> => {
  const { error } = await getSupabase().from("custos_operacionais").delete().eq("id", id);
  if (error) throwIf(error, "Falha ao excluir custo operacional");
};

// ============================================================================
// VENDAS — IMPORTACOES (header)
// ============================================================================
export const listImportacoes = async (): Promise<ImportacaoVendas[]> => {
  const { data, error } = await getSupabase()
    .from("vendas_importacoes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throwIf(error, "Falha ao listar importações");
  return (data ?? []).map(mapImportacaoRow);
};

export const upsertImportacao = async (
  imp: Partial<ImportacaoVendas>,
  mesReferencia: string
): Promise<ImportacaoVendas> => {
  const userId = await requireUserId();
  const payload = toImportacaoInsert(imp, userId, mesReferencia);
  const query = imp.id
    ? getSupabase().from("vendas_importacoes").update(payload).eq("id", imp.id)
    : getSupabase().from("vendas_importacoes").insert(payload);
  const { data, error } = await query.select().single();
  if (error || !data) throwIf(error, "Falha ao salvar importação");
  return mapImportacaoRow(data!);
};

// ============================================================================
// VENDAS — REGISTRADAS
// ============================================================================
export const listVendasRegistradas = async (): Promise<VendaRegistrada[]> => {
  const { data, error } = await getSupabase()
    .from("vendas_registradas")
    .select("*")
    .order("data_venda", { ascending: false });
  if (error) throwIf(error, "Falha ao listar vendas");
  return (data ?? []).map(mapVendaRegistradaRow);
};

export const insertVendasRegistradas = async (
  vendas: VendaRegistrada[]
): Promise<void> => {
  if (vendas.length === 0) return;
  const userId = await requireUserId();

  const { error } = await getSupabase()
    .from("vendas_registradas")
    .insert(
      vendas.map((v) => ({
        user_id: userId,
        importacao_id: v.importacaoId || null,
        venda_erp_id: v.vendaErpId,
        data_venda: v.dataVenda.toISOString(),
        produto_erp_id: v.produtoErpId || null,
        produto_nome: v.produtoNome,
        item_cardapio_id: v.itemCardapioId || null,
        item_cardapio_nome: v.itemCardapioNome || null,
        quantidade: v.quantidade,
        preco_unitario_vendido: v.precoUnitarioVendido,
        preco_total_vendido: v.precoTotalVendido,
        preco_cardapio: v.precoCardapio,
        custo_calculado: v.custoCalculado,
        divergencia_valor: v.divergenciaValor,
        divergencia_percentual: v.divergenciaPercentual,
        lucro_bruto_real: v.lucroBrutoReal,
        lucro_bruto_esperado: v.lucroBrutoEsperado,
        margem_real: v.margemReal,
        margem_esperada: v.margemEsperada,
        status_match: v.statusMatch,
        status_analise: v.statusAnalise,
        vendedor: v.vendedor ?? null,
      }))
    );
  if (error) throwIf(error, "Falha ao gravar vendas");
};

export const updateVendaProdutoMatch = async (
  vendaId: string,
  itemCardapioId: string
): Promise<void> => {
  const { error } = await getSupabase()
    .from("vendas_registradas")
    .update({ item_cardapio_id: itemCardapioId, status_match: "manual" })
    .eq("id", vendaId);
  if (error) throwIf(error, "Falha ao vincular produto");
};
