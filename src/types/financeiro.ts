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
  tipo: 'warning' | 'danger' | 'info' | 'success';
  titulo: string;
  descricao: string;
  acao?: {
    label: string;
    link?: string;
    onClick?: () => void;
  };
  createdAt: Date;
}

export interface MetricaComparativa {
  melhorMes: {
    periodo: string;
    valor: number;
    tipo: 'receita' | 'lucro' | 'margem';
  };
  piorMes: {
    periodo: string;
    valor: number;
    tipo: 'receita' | 'lucro' | 'margem';
  };
  tendencia: 'crescimento' | 'queda' | 'estavel';
  projecaoProximoMes: number;
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