export interface PeriodoImportacao {
  tipo: 'MES_COMPLETO' | 'PERIODO_CUSTOM' | 'MES_PARCIAL';
  mesReferencia: string; // formato "YYYY-MM"
  ano: number;
  mes: number;
  dataInicio: Date;
  dataFim: Date;
  status: 'COMPLETO' | 'PARCIAL' | 'EM_ANDAMENTO';
  diasTotais: number;
  diasImportados: number;
}

export interface PeriodoMes {
  mesReferencia: string;
  ano: number;
  mes: number;
  nome: string; // "Janeiro", "Fevereiro", etc.
  nomeCompleto: string; // "Janeiro/2024"
  dataInicio: Date;
  dataFim: Date;
  diasTotais: number;
}

export interface StatusPeriodo {
  periodo: string; // "YYYY-MM"
  possuiVendas: boolean;
  possuiCustos: boolean;
  vendasStatus: 'COMPLETO' | 'PARCIAL' | 'VAZIO';
  custosStatus: 'COMPLETO' | 'PARCIAL' | 'VAZIO';
  consistente: boolean;
  diasVendas: number;
  totalDias: number;
  categoriasComCustos: string[];
  totalCategorias: number;
}

export interface ValidacaoPeriodo {
  valido: boolean;
  inconsistencias: string[];
  avisos: string[];
  sugestoes: string[];
  nivel: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface PeriodoSelectorProps {
  onPeriodSelect: (periodo: PeriodoImportacao) => void;
  tipo: 'vendas' | 'custos';
  periodoAtual?: PeriodoImportacao;
  showAdvancedMode?: boolean;
  disabled?: boolean;
}