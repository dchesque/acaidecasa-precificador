export interface CustoOperacional {
  id: string;
  mes: number; // 1-12
  ano: number;
  valor: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardGestaoMetricas {
  receita: number;
  cpv: number; // Custo dos Produtos Vendidos
  lucroBruto: number;
  custoOperacional: number;
  lucroLiquido: number;
  margemLiquida: number; // Percentage
  pontoEquilibrio: number;
  taxaAbsorcao: number; // Percentage
  ticketMedioNecessario: number;
}

export interface PeriodoDashboard {
  inicio: Date;
  fim: Date;
}

export interface DashboardGestaoEstado {
  periodo: PeriodoDashboard;
  metricas?: DashboardGestaoMetricas;
  loading: boolean;
  alertas: AlertaFinanceiro[];
}

export interface AlertaFinanceiro {
  id: string;
  tipo: 'margem_baixa' | 'custo_alto' | 'lucro_negativo' | 'sem_dados';
  titulo: string;
  descricao: string;
  severidade: 'info' | 'warning' | 'error';
  createdAt: Date;
}

export interface EvolucaoMensal {
  mes: string;
  ano: number;
  receita: number;
  cpv: number;
  lucroBruto: number;
  custoOperacional: number;
  lucroLiquido: number;
  margemLiquida: number;
}

export interface ComparacaoMensal {
  atual: {
    mes: string;
    ano: number;
    metricas: DashboardGestaoMetricas;
  };
  anterior: {
    mes: string;
    ano: number;
    metricas: DashboardGestaoMetricas;
  };
  anoAnterior: {
    mes: string;
    ano: number;
    metricas: DashboardGestaoMetricas;
  };
}

export interface ExportDashboardData {
  periodo: PeriodoDashboard;
  metricas: DashboardGestaoMetricas;
  evolucaoMensal: EvolucaoMensal[];
  resumoMensal: ResumoMensalItem[];
}

export interface ResumoMensalItem {
  mes: string;
  ano: number;
  receita: number;
  cpv: number;
  lucroBruto: number;
  custoOperacional: number;
  lucroLiquido: number;
  margemLiquida: number;
}

export interface FiltrosFinanceiros {
  periodo: PeriodoDashboard;
  incluirProjecoes?: boolean;
  agruparPor?: 'mes' | 'trimestre' | 'ano';
}