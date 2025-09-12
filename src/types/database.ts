// Database types based on Prisma schema (without stock control)
export interface Configuracao {
  id: string;
  markupPadrao: number;
  incluirImpostos: boolean;
  arredondarPrecos: boolean;
  custoFixoMensal: number;
  custoEnergia: number;
  custoMaoObra: number;
  taxaCartao: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnidadeMedida {
  id: string;
  nome: string;
  sigla: string;
  tipo: 'PESO' | 'VOLUME' | 'UNIDADE';
  fatorConversao: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fornecedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
  prazoEntrega: number;
  pedidoMinimo: number;
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Insumo {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  unidadeMedidaId: string;
  unidadeMedida?: UnidadeMedida;
  fornecedorPrincipalId: string;
  fornecedorPrincipal?: Fornecedor;
  fornecedorAlternativoId?: string;
  fornecedorAlternativo?: Fornecedor;
  precoPrincipal: number;
  precoAlternativo?: number;
  custoPorGrama?: number;
  custoPorUnidade?: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  historicoPrecos?: HistoricoPreco[];
}


export interface Receita {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  rendimento: number; // em gramas
  custoPorGrama: number;
  custoTotal: number;
  tempoPreparo?: number;
  instrucoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  ingredientes?: ReceitaIngrediente[];
}

export interface ReceitaIngrediente {
  id: string;
  receitaId: string;
  receita?: Receita;
  insumoId: string;
  insumo?: Insumo;
  quantidade: number;
  custo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CopoBase {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  insumoBaseId: string;
  insumoBase?: Insumo;
  quantidadeBase: number;
  custoBase: number;
  custoEmbalagens: number;
  custoTotal: number;
  precoSugerido: number;
  margem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface Combinado {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  copoBaseId: string;
  copoBase?: CopoBase;
  custoCopoBase: number;
  custoComplementos: number;
  custoTotal: number;
  precoSugerido: number;
  margem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  complementos?: CombinadoComplemento[];
}

export interface CombinadoComplemento {
  id: string;
  combinadoId: string;
  combinado?: Combinado;
  tipo: 'INSUMO' | 'RECEITA';
  insumoId?: string;
  insumo?: Insumo;
  receitaId?: string;
  receita?: Receita;
  quantidade: number;
  custo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCardapio {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  tipo: 'COPO_BASE' | 'COMBINADO';
  copoBaseId?: string;
  copoBase?: CopoBase;
  combinadoId?: string;
  combinado?: Combinado;
  custoAtual: number;
  precoAtual: number;
  margemAtual: number;
  precoNovo?: number;
  margemNova?: number;
  sku?: string;
  codigoErp?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricoPreco {
  id: string;
  tipo: 'INSUMO';
  itemId: string;
  precoAnterior: number;
  precoNovo: number;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  motivo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alerta {
  id: string;
  tipo: 'PREJUIZO' | 'MARGEM_BAIXA' | 'PRECO_ALTERADO';
  titulo: string;
  descricao: string;
  itemId: string;
  itemNome: string;
  valor?: number;
  lido: boolean;
  createdAt: Date;
  updatedAt: Date;
}