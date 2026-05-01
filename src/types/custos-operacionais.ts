import { PeriodoImportacao } from './periodo';

// ============================================================================
// TIPOS PRINCIPAIS - SISTEMA DUAL DE LANÇAMENTO
// ============================================================================

export type TipoCusto = 'RAPIDO' | 'DETALHADO';

// Categorias simplificadas (4 principais)
export type CategoriaCustoSimples =
  | 'ALUGUEL'
  | 'CONTAS'    // Energia, água, telefone, internet
  | 'PESSOAL'   // Salários e encargos
  | 'OUTROS';   // Marketing, manutenção, etc.

// ============================================================================
// CUSTO OPERACIONAL - ESTRUTURA DUAL
// ============================================================================

export interface CustoItem {
  id: string;
  categoria: CategoriaCustoSimples;
  descricao: string;
  valor: number;
  ordem: number;
}

export interface CustoOperacional {
  id: string;
  mesReferencia: string; // "2024-11" (formato YYYY-MM)
  tipo: TipoCusto;

  // AMBOS os modos
  valorTotal: number; // Calculado automaticamente no detalhado
  createdAt: Date;
  updatedAt: Date;

  // Apenas RAPIDO
  observacoes?: string;

  // Apenas DETALHADO
  itens?: CustoItem[];
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CustoOperacionalRapidoInput {
  mesReferencia: string;
  valorTotal: number;
  observacoes?: string;
}

export interface CustoItemInput {
  categoria: CategoriaCustoSimples;
  descricao: string;
  valor: number;
}

export interface CustoOperacionalDetalhadoInput {
  mesReferencia: string;
  itens: CustoItemInput[];
}

// ============================================================================
// TIPOS DE CONVERSÃO
// ============================================================================

export interface ConversaoRapidoParaDetalhado {
  custoOriginal: CustoOperacional;
  itensSugeridos: CustoItemInput[];
}

export interface ConsolidacaoDetalhadoParaRapido {
  custoOriginal: CustoOperacional;
  observacoesGeradas: string;
}

// ============================================================================
// RESUMOS E ANÁLISES
// ============================================================================

export interface ResumoCustosMes {
  mesReferencia: string;
  tipo: TipoCusto;
  valorTotal: number;
  quantidadeCustos: number; // 1 para rápido, length de itens para detalhado

  // Apenas para detalhado
  custosPorCategoria?: Record<CategoriaCustoSimples, number>;
  categoriasComCustos?: CategoriaCustoSimples[];

  // Integração com vendas
  percentualReceita?: number;
  faturamentoMes?: number;
  impactoLucro: number; // Sempre negativo
}

export interface EvolucaoCustos {
  mesReferencia: string;
  mesNome: string; // "Nov/24"
  total: number;
  tipo: TipoCusto;

  // Para gráfico stacked (apenas detalhado)
  porCategoria?: Record<CategoriaCustoSimples, number>;
}

// ============================================================================
// MODAL PROPS
// ============================================================================

export interface LancamentoRapidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (input: CustoOperacionalRapidoInput) => void;
  custoExistente?: CustoOperacional; // Para edição
  mesesDisponiveis: string[];
}

export interface LancamentoDetalhadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (input: CustoOperacionalDetalhadoInput) => void;
  custoExistente?: CustoOperacional; // Para edição/adição
  mesesDisponiveis: string[];
}

export interface ConversaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  custo: CustoOperacional;
  onConfirm: (
    novoTipo: TipoCusto,
    data: CustoOperacionalRapidoInput | CustoOperacionalDetalhadoInput
  ) => void;
}

// ============================================================================
// LABELS E ÍCONES
// ============================================================================

export const CATEGORIAS_CUSTO_SIMPLES_LABELS: Record<CategoriaCustoSimples, string> = {
  ALUGUEL: 'Aluguel',
  CONTAS: 'Contas',
  PESSOAL: 'Pessoal',
  OUTROS: 'Outros'
};

export const CATEGORIAS_CUSTO_SIMPLES_ICONS: Record<CategoriaCustoSimples, string> = {
  ALUGUEL: '🏠',
  CONTAS: '⚡',
  PESSOAL: '👥',
  OUTROS: '📦'
};

export const CATEGORIAS_CUSTO_SIMPLES_COLORS: Record<CategoriaCustoSimples, string> = {
  ALUGUEL: 'bg-blue-50 text-blue-700 border-blue-200',
  CONTAS: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PESSOAL: 'bg-green-50 text-green-700 border-green-200',
  OUTROS: 'bg-gray-50 text-gray-700 border-gray-200'
};

// ============================================================================
// TIPOS LEGADOS (MANTER COMPATIBILIDADE)
// ============================================================================

// Mantendo tipos antigos para não quebrar código existente
export type CategoriaCusto =
  | 'ALUGUEL'
  | 'ENERGIA'
  | 'AGUA'
  | 'SALARIOS'
  | 'MARKETING'
  | 'INSUMOS_EXTRAS'
  | 'MANUTENCAO'
  | 'OUTROS';

export interface CustoOperacionalLegado {
  id: string;
  periodoImportacao: PeriodoImportacao;
  categoria: CategoriaCusto;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustoOperacionalInput {
  categoria: CategoriaCusto;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  observacoes?: string;
}

export const CATEGORIAS_CUSTO_LABELS: Record<CategoriaCusto, string> = {
  ALUGUEL: 'Aluguel',
  ENERGIA: 'Energia Elétrica',
  AGUA: 'Água',
  SALARIOS: 'Salários e Encargos',
  MARKETING: 'Marketing e Publicidade',
  INSUMOS_EXTRAS: 'Insumos Extras',
  MANUTENCAO: 'Manutenção e Reparos',
  OUTROS: 'Outros'
};

export const CATEGORIAS_CUSTO_ICONS: Record<CategoriaCusto, string> = {
  ALUGUEL: '🏠',
  ENERGIA: '⚡',
  AGUA: '💧',
  SALARIOS: '👥',
  MARKETING: '📢',
  INSUMOS_EXTRAS: '📦',
  MANUTENCAO: '🔧',
  OUTROS: '📋'
};

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export const isCustoRapido = (custo: CustoOperacional): boolean => {
  return custo.tipo === 'RAPIDO';
};

export const isCustoDetalhado = (custo: CustoOperacional): boolean => {
  return custo.tipo === 'DETALHADO';
};

export const hasItens = (custo: CustoOperacional): custo is CustoOperacional & { itens: CustoItem[] } => {
  return custo.tipo === 'DETALHADO' && Array.isArray(custo.itens) && custo.itens.length > 0;
};
