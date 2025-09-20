export interface ImportacaoVendas {
  id: string;
  nomeArquivo: string;
  dataImportacao: Date;
  periodoInicio: Date;
  periodoFim: Date;
  totalRegistros: number;
  totalImportados: number;
  totalDuplicados: number;
  totalSemMatch: number;
  status: 'processando' | 'concluido' | 'erro';
  erro?: string;
}

export interface VendaRegistrada {
  id: string;
  importacaoId: string;
  vendaErpId: string; // ID único no ERP
  dataVenda: Date;
  produtoErpId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitarioVendido: number;
  precoTotalVendido: number;
  itemCardapioId?: string;
  itemCardapioNome?: string;
  statusMatch: 'matched' | 'not_found' | 'manual';
  custoCalculado: number;
  precoCardapio: number;
  lucroBrutoReal: number;
  lucroBrutoEsperado: number;
  margemReal: number;
  margemEsperada: number;
  divergenciaValor: number;
  divergenciaPercentual: number;
  statusAnalise: 'ok' | 'divergencia' | 'prejuizo';
  vendedor?: string;
  observacoes?: string;
}

export interface VendasSystemInfo {
  primeiraVenda: Date | null;
  ultimaVenda: Date | null;
  ultimaImportacao: Date | null;
  totalVendasRegistradas: number;
  totalProdutosDiferentes: number;
  totalImportacoes: number;
}

export interface DashboardVendas {
  faturamentoReal: number;
  faturamentoEsperado: number;
  lucroBrutoReal: number;
  lucroBrutoEsperado: number;
  margemMediaReal: number;
  margemMediaEsperada: number;
  totalDivergencias: number;
  totalPrejuizos: number;
  produtoMaisVendido: {
    nome: string;
    quantidade: number;
    valor: number;
  };
  periodoAnalisado: {
    inicio: Date;
    fim: Date;
  };
}

export interface FiltrosVendas {
  periodo: {
    inicio: Date | null;
    fim: Date | null;
  };
  produto: string;
  statusAnalise: 'todos' | 'ok' | 'divergencia' | 'prejuizo';
  statusMatch: 'todos' | 'matched' | 'not_found' | 'manual';
  vendedor: string;
  orderBy: 'data' | 'valor' | 'divergencia' | 'margem';
  orderDirection: 'asc' | 'desc';
}

export interface VendasState {
  importacoes: ImportacaoVendas[];
  vendasRegistradas: VendaRegistrada[];
  systemInfo: VendasSystemInfo;
  filtros: FiltrosVendas;
  dashboardData?: DashboardVendas;
  loading: boolean;
  error: string | null;
}

export interface ProdutoSemMatch {
  produtoErpId: string;
  produtoNome: string;
  ocorrencias: number;
  valorTotal: number;
  sugestaoMatch?: string;
}

export interface ResumoImportacao {
  arquivo: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  totalRegistros: number;
  registrosNovos: number;
  registrosDuplicados: number;
  produtosSemMatch: ProdutoSemMatch[];
  valorTotalNovo: number;
}

export interface VendaDetalhada extends VendaRegistrada {
  ingredientes?: {
    nome: string;
    quantidade: number;
    unidade: string;
    custo: number;
  }[];
  historicoDivergencias?: {
    data: Date;
    divergencia: number;
    observacao?: string;
  }[];
}

export type StatusVenda = 'ok' | 'divergencia' | 'prejuizo';
export type StatusMatch = 'matched' | 'not_found' | 'manual';
export type StatusImportacao = 'processando' | 'concluido' | 'erro';