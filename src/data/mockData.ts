// Mock data for development (prepared for Supabase migration)
import { 
  Configuracao, 
  Categoria, 
  UnidadeMedida, 
  Fornecedor, 
  Insumo, 
  Receita,
  ReceitaIngrediente,
  CopoBase,
  Combinado,
  CombinadoComplemento,
  ItemCardapio
} from '@/types/database';

// Configuration
export const mockConfiguracao: Configuracao = {
  id: '1',
  markupPadrao: 35,
  incluirImpostos: true,
  arredondarPrecos: true,
  custoFixoMensal: 5000,
  custoEnergia: 800,
  custoMaoObra: 3000,
  taxaCartao: 3.5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Categories
export const mockCategorias: Categoria[] = [
  {
    id: '1',
    nome: 'Frutas',
    descricao: 'Frutas frescas e polpas',
    cor: '#22c55e',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Açaí',
    descricao: 'Polpa de açaí',
    cor: '#8b5cf6',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Complementos',
    descricao: 'Granola, castanhas, etc.',
    cor: '#f59e0b',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Embalagens',
    descricao: 'Copos, tampas, colheres',
    cor: '#6b7280',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Units of Measure
export const mockUnidadesMedida: UnidadeMedida[] = [
  {
    id: '1',
    nome: 'Quilograma',
    sigla: 'kg',
    tipo: 'PESO',
    fatorConversao: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Grama',
    sigla: 'g',
    tipo: 'PESO',
    fatorConversao: 0.001,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Unidade',
    sigla: 'un',
    tipo: 'UNIDADE',
    fatorConversao: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Litro',
    sigla: 'L',
    tipo: 'VOLUME',
    fatorConversao: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Suppliers
export const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    nome: 'Açaí do Norte',
    contato: 'João Silva',
    telefone: '(11) 99999-9999',
    email: 'contato@acaidonorte.com.br',
    endereco: 'Rua das Palmeiras, 123 - São Paulo/SP',
    cnpj: '12.345.678/0001-90',
    prazoEntrega: 2,
    pedidoMinimo: 500,
    avaliacao: 4.5,
    observacoes: 'Fornecedor confiável, entrega sempre no prazo',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Distribuidora Frutas & Cia',
    contato: 'Maria Santos',
    telefone: '(11) 88888-8888',
    email: 'vendas@frutasecia.com.br',
    endereco: 'Av. Central, 456 - São Paulo/SP',
    cnpj: '98.765.432/0001-10',
    prazoEntrega: 1,
    pedidoMinimo: 200,
    avaliacao: 4.0,
    observacoes: 'Bons preços para complementos',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Embalagens Express',
    contato: 'Carlos Oliveira',
    telefone: '(11) 77777-7777',
    email: 'pedidos@embalagemexpress.com.br',
    endereco: 'Rua Industrial, 789 - São Paulo/SP',
    cnpj: '11.222.333/0001-44',
    prazoEntrega: 3,
    pedidoMinimo: 1000,
    avaliacao: 3.8,
    observacoes: 'Especializada em embalagens',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Inputs
export const mockInsumos: Insumo[] = [
  {
    id: '1',
    nome: 'Polpa de Açaí Premium',
    descricao: 'Polpa de açaí premium 10% sólidos',
    categoriaId: '2',
    unidadeMedidaId: '1',
    fornecedorPrincipalId: '1',
    precoPrincipal: 18.50,
    custoPorGrama: 0.0185,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Granola Tradicional',
    descricao: 'Granola tradicional com mel',
    categoriaId: '3',
    unidadeMedidaId: '1',
    fornecedorPrincipalId: '2',
    fornecedorAlternativoId: '1',
    precoPrincipal: 12.00,
    precoAlternativo: 13.50,
    custoPorGrama: 0.012,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Banana',
    descricao: 'Banana prata fresca',
    categoriaId: '1',
    unidadeMedidaId: '1',
    fornecedorPrincipalId: '2',
    precoPrincipal: 4.50,
    custoPorGrama: 0.0045,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Morango',
    descricao: 'Morango fresco selecionado',
    categoriaId: '1',
    unidadeMedidaId: '1',
    fornecedorPrincipalId: '2',
    precoPrincipal: 8.00,
    custoPorGrama: 0.008,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


// Recipe Ingredients
export const mockReceitaIngredientes: ReceitaIngrediente[] = [
  {
    id: '1',
    receitaId: '1',
    insumoId: '2', // Granola
    quantidade: 50,
    custo: 0.60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    receitaId: '2',
    insumoId: '3', // Banana
    quantidade: 100,
    custo: 0.45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    receitaId: '2',
    insumoId: '4', // Morango
    quantidade: 50,
    custo: 0.40,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Recipes
export const mockReceitas: Receita[] = [
  {
    id: '1',
    nome: 'Mix Granola',
    descricao: 'Mistura especial de granola',
    categoriaId: '3',
    rendimento: 50,
    custoPorGrama: 0.012,
    custoTotal: 0.60,
    tempoPreparo: 5,
    instrucoes: 'Misturar bem todos os ingredientes',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredientes: [mockReceitaIngredientes[0]],
  },
  {
    id: '2',
    nome: 'Mix Frutas Vermelhas',
    descricao: 'Mistura de banana e morango',
    categoriaId: '1',
    rendimento: 150,
    custoPorGrama: 0.0057,
    custoTotal: 0.85,
    tempoPreparo: 3,
    instrucoes: 'Cortar frutas em cubos pequenos',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredientes: [mockReceitaIngredientes[1], mockReceitaIngredientes[2]],
  },
];


// Base Cups
export const mockCoposBase: CopoBase[] = [
  {
    id: '1',
    nome: 'Açaí 500ml',
    descricao: 'Copo de açaí 500ml base',
    categoriaId: '2',
    insumoBaseId: '1', // Polpa de Açaí
    quantidadeBase: 300,
    custoBase: 5.55,
    custoEmbalagens: 0.58,
    custoTotal: 6.13,
    precoSugerido: 8.28,
    margem: 26.0,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Combo Complements
export const mockCombinadoComplementos: CombinadoComplemento[] = [
  {
    id: '1',
    combinadoId: '1',
    tipo: 'RECEITA',
    receitaId: '1', // Mix Granola
    quantidade: 50,
    custo: 0.60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    combinadoId: '1',
    tipo: 'RECEITA',
    receitaId: '2', // Mix Frutas
    quantidade: 100,
    custo: 0.57,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Combos
export const mockCombinados: Combinado[] = [
  {
    id: '1',
    nome: 'Açaí Completo 500ml',
    descricao: 'Açaí com granola e frutas vermelhas',
    categoriaId: '2',
    copoBaseId: '1',
    custoCopoBase: 6.13,
    custoComplementos: 1.17,
    custoTotal: 7.30,
    precoSugerido: 9.85,
    margem: 25.9,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    complementos: mockCombinadoComplementos,
  },
];

// Menu Items
export const mockCardapio: ItemCardapio[] = [
  {
    id: '1',
    nome: 'Açaí Simples 500ml',
    descricao: 'Açaí puro 500ml',
    categoriaId: '2',
    tipo: 'COPO_BASE',
    copoBaseId: '1',
    custoAtual: 6.13,
    precoAtual: 8.28,
    margemAtual: 26.0,
    sku: 'AC-500-SIM',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Açaí Completo 500ml',
    descricao: 'Açaí com granola e frutas vermelhas',
    categoriaId: '2',
    tipo: 'COMBINADO',
    combinadoId: '1',
    custoAtual: 7.30,
    precoAtual: 9.85,
    margemAtual: 25.9,
    sku: 'AC-500-COM',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Add references to mock data
mockInsumos.forEach(insumo => {
  insumo.categoria = mockCategorias.find(c => c.id === insumo.categoriaId);
  insumo.unidadeMedida = mockUnidadesMedida.find(u => u.id === insumo.unidadeMedidaId);
  insumo.fornecedorPrincipal = mockFornecedores.find(f => f.id === insumo.fornecedorPrincipalId);
  if (insumo.fornecedorAlternativoId) {
    insumo.fornecedorAlternativo = mockFornecedores.find(f => f.id === insumo.fornecedorAlternativoId);
  }
});

mockEmbalagens.forEach(embalagem => {
  embalagem.categoria = mockCategorias.find(c => c.id === embalagem.categoriaId);
  embalagem.fornecedorPrincipal = mockFornecedores.find(f => f.id === embalagem.fornecedorPrincipalId);
  if (embalagem.fornecedorAlternativoId) {
    embalagem.fornecedorAlternativo = mockFornecedores.find(f => f.id === embalagem.fornecedorAlternativoId);
  }
});

mockReceitas.forEach(receita => {
  receita.categoria = mockCategorias.find(c => c.id === receita.categoriaId);
});

mockCoposBase.forEach(copoBase => {
  copoBase.categoria = mockCategorias.find(c => c.id === copoBase.categoriaId);
  copoBase.insumoBase = mockInsumos.find(i => i.id === copoBase.insumoBaseId);
});

mockCombinados.forEach(combinado => {
  combinado.categoria = mockCategorias.find(c => c.id === combinado.categoriaId);
  combinado.copoBase = mockCoposBase.find(c => c.id === combinado.copoBaseId);
});

mockCardapio.forEach(item => {
  item.categoria = mockCategorias.find(c => c.id === item.categoriaId);
  if (item.copoBaseId) {
    item.copoBase = mockCoposBase.find(c => c.id === item.copoBaseId);
  }
  if (item.combinadoId) {
    item.combinado = mockCombinados.find(c => c.id === item.combinadoId);
  }
});