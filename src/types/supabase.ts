/**
 * Supabase database type definitions.
 *
 * These mirror the schema in `supabase/migrations/0001_initial_schema.sql`.
 * Keep them in sync when the SQL changes — or regenerate via:
 *   `supabase gen types typescript --project-id <id> > src/types/supabase.ts`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string; // Supabase serializes timestamptz as ISO string

type Row<TInsert> = TInsert & { id: string; created_at: Timestamp; updated_at: Timestamp };

interface ConfiguracaoInsert {
  id?: string;
  user_id: string;
  markup_padrao?: number;
  incluir_impostos?: boolean;
  aliquota_imposto?: number | null;
  arredondar_precos?: boolean;
  custo_fixo_mensal?: number;
  custo_energia?: number;
  custo_mao_obra?: number;
  taxa_cartao?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CategoriaInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  cor?: string | null;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface UnidadeMedidaInsert {
  id?: string;
  user_id: string;
  nome: string;
  sigla: string;
  tipo: "PESO" | "VOLUME" | "UNIDADE";
  fator_conversao?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface FornecedorInsert {
  id?: string;
  user_id: string;
  nome: string;
  contato?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cnpj?: string | null;
  prazo_entrega?: number | null;
  pedido_minimo?: number | null;
  observacoes?: string | null;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface InsumoInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  categoria_id?: string | null;
  unidade_medida_id?: string | null;
  fornecedor_calculo_id?: string | null;
  custo_por_unidade?: number | null;
  custo_por_grama?: number | null;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface InsumoFornecedorInsert {
  id?: string;
  user_id: string;
  insumo_id: string;
  fornecedor_id: string;
  preco_bruto: number;
  preco_com_desconto?: number | null;
  quantidade_comprada: number;
  usar_preco_com_desconto?: boolean;
  prazo_entrega?: number | null;
  observacoes?: string | null;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface ReceitaInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  categoria_id?: string | null;
  rendimento: number;
  custo_por_grama?: number;
  custo_total?: number;
  tempo_preparo?: number | null;
  instrucoes?: string | null;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface ReceitaIngredienteInsert {
  id?: string;
  user_id: string;
  receita_id: string;
  insumo_id: string;
  quantidade: number;
  custo?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CopoBaseInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  categoria_id?: string | null;
  insumo_base_id?: string | null;
  quantidade_base: number;
  custo_base?: number;
  custo_insumos?: number;
  custo_total?: number;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CopoBaseInsumoInsert {
  id?: string;
  user_id: string;
  copo_base_id: string;
  insumo_id: string;
  quantidade: number;
  custo?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CombinadoInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  categoria_id?: string | null;
  copo_base_id?: string | null;
  custo_copo_base?: number;
  custo_complementos?: number;
  custo_total?: number;
  preco_sugerido?: number;
  preco_cardapio?: number | null;
  preco_venda_total?: number;
  preco_venda_sugerido?: number;
  margem?: number;
  ativo?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CombinadoComplementoInsert {
  id?: string;
  user_id: string;
  combinado_id: string;
  tipo: "INSUMO" | "RECEITA";
  insumo_id?: string | null;
  receita_id?: string | null;
  quantidade: number;
  custo?: number;
  preco_venda?: number | null;
  item_cardapio_id?: string | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CardapioInsert {
  id?: string;
  user_id: string;
  nome: string;
  descricao?: string | null;
  categoria_id?: string | null;
  tipo: "COPO_BASE" | "COMBINADO" | "INSUMO" | "RECEITA";
  copo_base_id?: string | null;
  combinado_id?: string | null;
  insumo_id?: string | null;
  receita_id?: string | null;
  custo_atual?: number;
  preco_atual?: number;
  margem_atual?: number;
  preco_novo?: number | null;
  margem_nova?: number | null;
  ativo?: boolean;
  ordem?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CustoOperacionalInsert {
  id?: string;
  user_id: string;
  mes_referencia: string;
  tipo: "RAPIDO" | "DETALHADO";
  valor_total?: number;
  observacoes?: string | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface CustoItemInsert {
  id?: string;
  user_id: string;
  custo_operacional_id: string;
  categoria: string;
  descricao?: string | null;
  valor: number;
  ordem?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface VendaImportacaoInsert {
  id?: string;
  user_id: string;
  arquivo_nome: string;
  arquivo_hash?: string | null;
  mes_referencia: string;
  total_registros?: number;
  registros_importados?: number;
  registros_duplicados?: number;
  produtos_sem_match?: number;
  status?: "PROCESSANDO" | "CONCLUIDA" | "FALHA";
  erro?: string | null;
  created_at?: Timestamp;
}

interface VendaRegistradaInsert {
  id?: string;
  user_id: string;
  importacao_id?: string | null;
  venda_erp_id: string;
  data_venda: Timestamp;
  produto_erp_id?: string | null;
  produto_nome: string;
  item_cardapio_id?: string | null;
  item_cardapio_nome?: string | null;
  quantidade: number;
  preco_unitario_vendido: number;
  preco_total_vendido: number;
  preco_cardapio?: number;
  custo_calculado?: number;
  divergencia_valor?: number;
  divergencia_percentual?: number;
  lucro_bruto_real?: number;
  lucro_bruto_esperado?: number;
  margem_real?: number;
  margem_esperada?: number;
  status_match?: "matched" | "not_found" | "manual";
  status_analise?: "ok" | "divergencia" | "prejuizo";
  vendedor?: string | null;
  created_at?: Timestamp;
}

type TableDef<TInsert> = {
  Row: Row<Required<Omit<TInsert, "id" | "created_at" | "updated_at">>>;
  Insert: TInsert;
  Update: Partial<TInsert>;
};

export interface Database {
  public: {
    Tables: {
      configuracao: TableDef<ConfiguracaoInsert>;
      categorias: TableDef<CategoriaInsert>;
      unidades_medida: TableDef<UnidadeMedidaInsert>;
      fornecedores: TableDef<FornecedorInsert>;
      insumos: TableDef<InsumoInsert>;
      insumo_fornecedores: TableDef<InsumoFornecedorInsert>;
      receitas: TableDef<ReceitaInsert>;
      receita_ingredientes: TableDef<ReceitaIngredienteInsert>;
      copos_base: TableDef<CopoBaseInsert>;
      copo_base_insumos: TableDef<CopoBaseInsumoInsert>;
      combinados: TableDef<CombinadoInsert>;
      combinado_complementos: TableDef<CombinadoComplementoInsert>;
      cardapio: TableDef<CardapioInsert>;
      custos_operacionais: TableDef<CustoOperacionalInsert>;
      custo_itens: TableDef<CustoItemInsert>;
      vendas_importacoes: TableDef<VendaImportacaoInsert>;
      vendas_registradas: TableDef<VendaRegistradaInsert>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
