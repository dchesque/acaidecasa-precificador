// Database types based on Prisma schema (without stock control)
export interface Configuracao {
  id: string;
  markupPadrao: number;
  incluirImpostos: boolean;
  // Tax percentage (0-100) applied when `incluirImpostos === true`. Defaults to 10 when omitted.
  aliquotaImposto?: number;
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
  contato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cnpj?: string;
  prazoEntrega?: number;
  pedidoMinimo?: number;
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Linked insumos
  insumos?: InsumoFornecedor[];
}

export interface InsumoFornecedor {
  id: string;
  insumoId: string;
  insumo?: Insumo;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  precoBruto: number; // Gross price for this supplier
  precoComDesconto?: number; // Discounted price for this supplier
  quantidadeComprada: number; // Quantity purchased from this supplier
  usarPrecoComDesconto: boolean; // Toggle for which price to use for this supplier
  prazoEntrega?: number; // Specific delivery time for this supplier-insumo combo
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
  // Multiple suppliers relationship
  fornecedores?: InsumoFornecedor[];
  fornecedorCalculoId: string; // ID of the supplier used for cost calculation
  fornecedorCalculo?: Fornecedor; // The supplier used for cost calculation
  custoPorUnidade?: number; // Calculated cost per unit (based on selected supplier)
  custoPorGrama?: number; // Derived cost per gram for calculations
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

export interface CopoBaseInsumo {
  id: string;
  copoBaseId: string;
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
  custoInsumos: number;
  custoTotal: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  insumos?: CopoBaseInsumo[];
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
  precoCardapio?: number;
  precoVendaTotal: number; // Soma dos preços de venda dos componentes
  precoVendaSugerido: number; // Baseado nos preços individuais do cardápio
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
  precoVenda?: number; // Preço de venda do item no cardápio
  itemCardapioId?: string; // Referência ao item do cardápio
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCardapio {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  tipo: 'COPO_BASE' | 'COMBINADO' | 'INSUMO' | 'RECEITA';
  copoBaseId?: string;
  copoBase?: CopoBase;
  combinadoId?: string;
  combinado?: Combinado;
  insumoId?: string;
  insumo?: Insumo;
  receitaId?: string;
  receita?: Receita;
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
