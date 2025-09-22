import { PeriodoImportacao } from './periodo';

export type CategoriaCusto =
  | 'ALUGUEL'
  | 'ENERGIA'
  | 'AGUA'
  | 'SALARIOS'
  | 'MARKETING'
  | 'INSUMOS_EXTRAS'
  | 'MANUTENCAO'
  | 'OUTROS';

export interface CustoOperacional {
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

export interface ResumoCustosMes {
  periodo: PeriodoImportacao;
  custos: CustoOperacional[];
  totalMes: number;
  totalPorCategoria: Record<CategoriaCusto, number>;
  categoriasComCustos: CategoriaCusto[];
  custosVencidos: CustoOperacional[];
  custosProximoVencimento: CustoOperacional[];
}

export interface CustosOperacionaisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (custos: CustoOperacionalInput[], periodo: PeriodoImportacao) => void;
  periodoInicial?: PeriodoImportacao;
  custosExistentes?: CustoOperacional[];
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