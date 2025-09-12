// Mock data for development (prepared for Supabase migration)
import { 
  Configuracao, 
  Categoria, 
  UnidadeMedida, 
  Fornecedor, 
  Insumo,
  InsumoFornecedor,
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
    nome: 'Açaí e Polpas',
    descricao: 'Açaí, cupuaçu e demais polpas de frutas',
    cor: '#8b5cf6',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Frutas Frescas',
    descricao: 'Banana, morango, kiwi e frutas frescas',
    cor: '#22c55e',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Cereais e Granolas',
    descricao: 'Granola, aveia, cereais e fibras',
    cor: '#d97706',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Castanhas e Oleaginosas',
    descricao: 'Castanha-do-pará, amendoim, nozes',
    cor: '#92400e',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    nome: 'Doces e Adoçantes',
    descricao: 'Mel, leite condensado, açúcar, xaropes',
    cor: '#ec4899',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    nome: 'Lácteos',
    descricao: 'Leite, leite em pó, iogurte',
    cor: '#3b82f6',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    nome: 'Embalagens',
    descricao: 'Copos, tampas, colheres e sacolas',
    cor: '#6b7280',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    nome: 'Outros Complementos',
    descricao: 'Coco ralado, chocolate, biscoitos',
    cor: '#10b981',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Units of Measure
export const mockUnidadesMedida: UnidadeMedida[] = [
  {
    id: '1',
    nome: 'Grama',
    sigla: 'g',
    tipo: 'PESO',
    fatorConversao: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Mililitro',
    sigla: 'ml',
    tipo: 'VOLUME',
    fatorConversao: 1,
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
];

// Suppliers
export const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    nome: 'Açaí do Norte Ltda',
    contato: 'João Silva',
    telefone: '(91) 99999-9999',
    email: 'contato@acaidonorte.com.br',
    endereco: 'Rua das Palmeiras, 123 - Belém/PA',
    cnpj: '12.345.678/0001-90',
    prazoEntrega: 2,
    pedidoMinimo: 500,
    avaliacao: 4.5,
    observacoes: 'Especialista em açaí premium, entrega sempre no prazo',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Distribuidora Frutas & Polpas',
    contato: 'Maria Santos',
    telefone: '(11) 88888-8888',
    email: 'vendas@frutaspolpas.com.br',
    endereco: 'Av. Central, 456 - São Paulo/SP',
    cnpj: '98.765.432/0001-10',
    prazoEntrega: 1,
    pedidoMinimo: 200,
    avaliacao: 4.2,
    observacoes: 'Ótima variedade de frutas frescas e polpas',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    nome: 'Casa das Granolas',
    contato: 'Pedro Almeida',
    telefone: '(11) 77777-7777',
    email: 'pedidos@casadasgranolas.com.br',
    endereco: 'Rua dos Cereais, 789 - São Paulo/SP',
    cnpj: '11.222.333/0001-44',
    prazoEntrega: 3,
    pedidoMinimo: 100,
    avaliacao: 4.8,
    observacoes: 'Granolas artesanais e ingredientes premium',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Castanhas do Brasil',
    contato: 'Ana Costa',
    telefone: '(27) 66666-6666',
    email: 'vendas@castanhasdobrasil.com.br',
    endereco: 'Av. das Castanheiras, 321 - Vitória/ES',
    cnpj: '22.333.444/0001-55',
    prazoEntrega: 4,
    pedidoMinimo: 150,
    avaliacao: 4.4,
    observacoes: 'Castanhas selecionadas e oleaginosas de qualidade',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    nome: 'Embalagens Sustentáveis SP',
    contato: 'Roberto Lima',
    telefone: '(11) 55555-5555',
    email: 'contato@embalagenssp.com.br',
    endereco: 'Rua Industrial, 654 - São Paulo/SP',
    cnpj: '33.444.555/0001-66',
    prazoEntrega: 2,
    pedidoMinimo: 1000,
    avaliacao: 4.0,
    observacoes: 'Copos e embalagens eco-friendly',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    nome: 'Doces & Mel Distribuidora',
    contato: 'Fernanda Rocha',
    telefone: '(19) 44444-4444',
    email: 'vendas@docesmel.com.br',
    endereco: 'Estrada do Mel, 987 - Campinas/SP',
    cnpj: '44.555.666/0001-77',
    prazoEntrega: 1,
    pedidoMinimo: 80,
    avaliacao: 4.6,
    observacoes: 'Mel puro, leite condensado e adoçantes naturais',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    nome: 'Laticínios Vale Verde',
    contato: 'Marcos Pereira',
    telefone: '(15) 33333-3333',
    email: 'pedidos@valeverde.com.br',
    endereco: 'Fazenda Santa Rita, KM 45 - Sorocaba/SP',
    cnpj: '55.666.777/0001-88',
    prazoEntrega: 1,
    pedidoMinimo: 120,
    avaliacao: 4.3,
    observacoes: 'Leite fresco e derivados lácteos de fazenda',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    nome: 'Ceasa Frutas Selecionadas',
    contato: 'Luciana Martins',
    telefone: '(11) 22222-2222',
    email: 'luciana@ceasafrutas.com.br',
    endereco: 'Terminal de Frutas CEASA, Box 42 - São Paulo/SP',
    cnpj: '66.777.888/0001-99',
    prazoEntrega: 1,
    pedidoMinimo: 50,
    avaliacao: 3.9,
    observacoes: 'Frutas frescas direto do CEASA, preços competitivos',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Insumo-Fornecedor Relationships
export const mockInsumoFornecedores: InsumoFornecedor[] = [
  // Açaí Premium - Múltiplos fornecedores
  {
    id: '1',
    insumoId: '1',
    fornecedorId: '1', // Açaí do Norte (PADRÃO)
    precoBruto: 45.00,
    precoComDesconto: 40.00,
    quantidadeComprada: 10000, // 10kg = 10000g
    usarPrecoComDesconto: true,
    prazoEntrega: 2,
    observacoes: 'Fornecedor principal - qualidade premium',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    insumoId: '1',
    fornecedorId: '2', // Distribuidora Frutas & Polpas
    precoBruto: 48.00,
    precoComDesconto: 44.00,
    quantidadeComprada: 10000,
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    observacoes: 'Fornecedor alternativo - entrega rápida',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Cupuaçu - Um fornecedor
  {
    id: '3',
    insumoId: '2',
    fornecedorId: '2', // Distribuidora Frutas & Polpas (PADRÃO)
    precoBruto: 28.00,
    quantidadeComprada: 5000,
    usarPrecoComDesconto: false,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Banana - Múltiplos fornecedores
  {
    id: '4',
    insumoId: '3',
    fornecedorId: '8', // CEASA (PADRÃO)
    precoBruto: 6.50,
    precoComDesconto: 5.80,
    quantidadeComprada: 15000,
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    observacoes: 'Fornecedor principal - preço competitivo',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    insumoId: '3',
    fornecedorId: '2', // Distribuidora Frutas & Polpas
    precoBruto: 7.20,
    precoComDesconto: 6.50,
    quantidadeComprada: 15000,
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    observacoes: 'Fornecedor alternativo',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Morango - Um fornecedor
  {
    id: '6',
    insumoId: '4',
    fornecedorId: '8', // CEASA (PADRÃO)
    precoBruto: 18.00,
    quantidadeComprada: 8000, // 8 kg = 8000 g
    usarPrecoComDesconto: false,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Kiwi - Um fornecedor
  {
    id: '7',
    insumoId: '5',
    fornecedorId: '2', // Distribuidora Frutas & Polpas (PADRÃO)
    precoBruto: 24.00,
    precoComDesconto: 22.00,
    quantidadeComprada: 3000, // 3 kg = 3000 g
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Granola - Um fornecedor
  {
    id: '8',
    insumoId: '6',
    fornecedorId: '3', // Casa das Granolas (PADRÃO)
    precoBruto: 12.50,
    precoComDesconto: 11.00,
    quantidadeComprada: 1000,
    usarPrecoComDesconto: true,
    prazoEntrega: 3,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Aveia - Um fornecedor
  {
    id: '9',
    insumoId: '7',
    fornecedorId: '3', // Casa das Granolas (PADRÃO)
    precoBruto: 12.50,
    quantidadeComprada: 20000, // 20 kg = 20000 g
    usarPrecoComDesconto: false,
    prazoEntrega: 3,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Castanha-do-Pará - Um fornecedor
  {
    id: '10',
    insumoId: '8',
    fornecedorId: '4', // Castanhas do Brasil (PADRÃO)
    precoBruto: 85.00,
    precoComDesconto: 78.00,
    quantidadeComprada: 5000, // 5 kg = 5000 g
    usarPrecoComDesconto: true,
    prazoEntrega: 4,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Amendoim - Um fornecedor
  {
    id: '11',
    insumoId: '9',
    fornecedorId: '4', // Castanhas do Brasil (PADRÃO)
    precoBruto: 18.00,
    quantidadeComprada: 10000, // 10 kg = 10000 g
    usarPrecoComDesconto: false,
    prazoEntrega: 4,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Mel - Um fornecedor
  {
    id: '12',
    insumoId: '10',
    fornecedorId: '6', // Doces & Mel (PADRÃO)
    precoBruto: 32.00,
    precoComDesconto: 28.00,
    quantidadeComprada: 12000, // 12 kg = 12000 g
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Leite Condensado - Um fornecedor
  {
    id: '13',
    insumoId: '11',
    fornecedorId: '6', // Doces & Mel (PADRÃO)
    precoBruto: 4.50,
    precoComDesconto: 4.20,
    quantidadeComprada: 24, // 24 latas
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Leite Integral - Um fornecedor
  {
    id: '14',
    insumoId: '12',
    fornecedorId: '7', // Laticínios Vale Verde (PADRÃO)
    precoBruto: 4.80,
    precoComDesconto: 4.50,
    quantidadeComprada: 20000, // 20 L = 20000 ml
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Iogurte - Um fornecedor
  {
    id: '15',
    insumoId: '13',
    fornecedorId: '7', // Laticínios Vale Verde (PADRÃO)
    precoBruto: 3.20,
    quantidadeComprada: 48, // 48 potes
    usarPrecoComDesconto: false,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Copo Biodegradável - Um fornecedor
  {
    id: '16',
    insumoId: '14',
    fornecedorId: '5', // Embalagens Sustentáveis (PADRÃO)
    precoBruto: 0.85,
    precoComDesconto: 0.75,
    quantidadeComprada: 1000,
    usarPrecoComDesconto: true,
    prazoEntrega: 2,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Colher de Madeira - Um fornecedor
  {
    id: '17',
    insumoId: '15',
    fornecedorId: '5', // Embalagens Sustentáveis (PADRÃO)
    precoBruto: 0.12,
    quantidadeComprada: 2000,
    usarPrecoComDesconto: false,
    prazoEntrega: 2,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Coco Ralado - Um fornecedor
  {
    id: '18',
    insumoId: '16',
    fornecedorId: '3', // Casa das Granolas (PADRÃO)
    precoBruto: 22.00,
    precoComDesconto: 20.00,
    quantidadeComprada: 8000, // 8 kg = 8000 g
    usarPrecoComDesconto: true,
    prazoEntrega: 3,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Chocolate Granulado - Um fornecedor
  {
    id: '19',
    insumoId: '17',
    fornecedorId: '6', // Doces & Mel (PADRÃO)
    precoBruto: 28.00,
    quantidadeComprada: 6000, // 6 kg = 6000 g
    usarPrecoComDesconto: false,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Biscoito Wafer - Um fornecedor
  {
    id: '20',
    insumoId: '18',
    fornecedorId: '2', // Distribuidora Frutas & Polpas (PADRÃO)
    precoBruto: 15.00,
    precoComDesconto: 13.50,
    quantidadeComprada: 10000, // 10 kg = 10000 g
    usarPrecoComDesconto: true,
    prazoEntrega: 1,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Inputs  
export const mockInsumos: Insumo[] = [
  // Açaí e Polpas
  {
    id: '1',
    nome: 'Polpa de Açaí Premium',
    descricao: 'Polpa de açaí premium 10% sólidos',
    categoriaId: '1', // Açaí e Polpas
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '1', // Açaí do Norte (fornecedor usado para cálculo)
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nome: 'Polpa de Cupuaçu',
    descricao: 'Polpa de cupuaçu natural sem conservantes',
    categoriaId: '1',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '2', // Distribuidora Frutas & Polpas
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Frutas Frescas
  {
    id: '3',
    nome: 'Banana Prata',
    descricao: 'Banana prata fresca selecionada',
    categoriaId: '2', // Frutas Frescas
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '8', // CEASA (fornecedor usado para cálculo)
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    nome: 'Morango',
    descricao: 'Morango fresco nacional',
    categoriaId: '2',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '8', // CEASA
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    nome: 'Kiwi',
    descricao: 'Kiwi importado premium',
    categoriaId: '2',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '2', // Distribuidora Frutas & Polpas
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Cereais e Granolas
  {
    id: '6',
    nome: 'Granola Premium',
    descricao: 'Granola artesanal com mel e frutas secas',
    categoriaId: '3', // Cereais e Granolas
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '3', // Casa das Granolas
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    nome: 'Aveia em Flocos',
    descricao: 'Aveia em flocos finos integral',
    categoriaId: '3',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '3', // Casa das Granolas
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Castanhas e Oleaginosas
  {
    id: '8',
    nome: 'Castanha-do-Pará',
    descricao: 'Castanha-do-pará descascada premium',
    categoriaId: '4', // Castanhas e Oleaginosas
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '4', // Castanhas do Brasil
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    nome: 'Amendoim Torrado',
    descricao: 'Amendoim torrado sem sal',
    categoriaId: '4',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '4', // Castanhas do Brasil
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Doces e Adoçantes
  {
    id: '10',
    nome: 'Mel Puro de Flores',
    descricao: 'Mel de flores silvestre premium',
    categoriaId: '5', // Doces e Adoçantes
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '6', // Doces & Mel
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    nome: 'Leite Condensado',
    descricao: 'Leite condensado tradicional lata 395g',
    categoriaId: '5',
    unidadeMedidaId: '3', // un
    fornecedorCalculoId: '6', // Doces & Mel
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Lácteos
  {
    id: '12',
    nome: 'Leite Integral',
    descricao: 'Leite integral fresco da fazenda',
    categoriaId: '6', // Lácteos
    unidadeMedidaId: '2', // ml
    fornecedorCalculoId: '7', // Laticínios Vale Verde
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    nome: 'Iogurte Natural',
    descricao: 'Iogurte natural sem açúcar 170g',
    categoriaId: '6',
    unidadeMedidaId: '3', // un
    fornecedorCalculoId: '7', // Laticínios Vale Verde
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Embalagens
  {
    id: '14',
    nome: 'Copo Biodegradável 300ml',
    descricao: 'Copo de papel biodegradável com tampa',
    categoriaId: '7', // Embalagens
    unidadeMedidaId: '3', // un
    fornecedorCalculoId: '5', // Embalagens Sustentáveis
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '15',
    nome: 'Colher de Madeira',
    descricao: 'Colher de madeira sustentável',
    categoriaId: '7',
    unidadeMedidaId: '3', // un
    fornecedorCalculoId: '5', // Embalagens Sustentáveis
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Outros Complementos
  {
    id: '16',
    nome: 'Coco Ralado Desidratado',
    descricao: 'Coco ralado desidratado sem açúcar',
    categoriaId: '8', // Outros Complementos
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '3', // Casa das Granolas
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '17',
    nome: 'Chocolate Granulado',
    descricao: 'Chocolate granulado meio amargo',
    categoriaId: '8',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '6', // Doces & Mel
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '18',
    nome: 'Biscoito Wafer Triturado',
    descricao: 'Biscoito wafer de baunilha triturado',
    categoriaId: '8',
    unidadeMedidaId: '1', // g
    fornecedorCalculoId: '2', // Distribuidora Frutas & Polpas
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
  // Remove references to old pricing system properties
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