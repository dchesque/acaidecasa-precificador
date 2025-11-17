import { CustoOperacional } from '@/types/custos-operacionais';

/**
 * Mocks de Custos Operacionais usando o sistema dual (Rápido/Detalhado)
 */

// Novembro 2024 - Lançamento Rápido
const custoNovembro2024: CustoOperacional = {
  id: 'custo-nov-2024',
  mesReferencia: '2024-11',
  tipo: 'RAPIDO',
  valorTotal: 12450.00,
  observacoes: 'Aluguel + contas + salários + outros custos',
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-01')
};

// Outubro 2024 - Lançamento Detalhado
const custoOutubro2024: CustoOperacional = {
  id: 'custo-out-2024',
  mesReferencia: '2024-10',
  tipo: 'DETALHADO',
  valorTotal: 11850.00,
  itens: [
    {
      id: 'item-1',
      categoria: 'ALUGUEL',
      descricao: 'Aluguel Loja Centro',
      valor: 3000.00,
      ordem: 1
    },
    {
      id: 'item-2',
      categoria: 'CONTAS',
      descricao: 'Energia Elétrica',
      valor: 850.00,
      ordem: 2
    },
    {
      id: 'item-3',
      categoria: 'CONTAS',
      descricao: 'Água',
      valor: 120.00,
      ordem: 3
    },
    {
      id: 'item-4',
      categoria: 'PESSOAL',
      descricao: 'Salários',
      valor: 7500.00,
      ordem: 4
    },
    {
      id: 'item-5',
      categoria: 'OUTROS',
      descricao: 'Manutenção Equipamentos',
      valor: 380.00,
      ordem: 5
    }
  ],
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date('2024-10-01')
};

// Setembro 2024 - Lançamento Rápido
const custoSetembro2024: CustoOperacional = {
  id: 'custo-set-2024',
  mesReferencia: '2024-09',
  tipo: 'RAPIDO',
  valorTotal: 11200.00,
  observacoes: 'Custos fixos mensais',
  createdAt: new Date('2024-09-01'),
  updatedAt: new Date('2024-09-01')
};

// Agosto 2024 - Lançamento Detalhado
const custoAgosto2024: CustoOperacional = {
  id: 'custo-ago-2024',
  mesReferencia: '2024-08',
  tipo: 'DETALHADO',
  valorTotal: 12100.00,
  itens: [
    {
      id: 'item-6',
      categoria: 'ALUGUEL',
      descricao: 'Aluguel',
      valor: 3000.00,
      ordem: 1
    },
    {
      id: 'item-7',
      categoria: 'CONTAS',
      descricao: 'Energia + Água + Internet',
      valor: 1050.00,
      ordem: 2
    },
    {
      id: 'item-8',
      categoria: 'PESSOAL',
      descricao: 'Folha de Pagamento',
      valor: 7800.00,
      ordem: 3
    },
    {
      id: 'item-9',
      categoria: 'OUTROS',
      descricao: 'Marketing Digital',
      valor: 250.00,
      ordem: 4
    }
  ],
  createdAt: new Date('2024-08-01'),
  updatedAt: new Date('2024-08-01')
};

// Julho 2024 - Lançamento Rápido
const custoJulho2024: CustoOperacional = {
  id: 'custo-jul-2024',
  mesReferencia: '2024-07',
  tipo: 'RAPIDO',
  valorTotal: 10900.00,
  observacoes: 'Custos operacionais julho',
  createdAt: new Date('2024-07-01'),
  updatedAt: new Date('2024-07-01')
};

// Junho 2024 - Lançamento Detalhado
const custoJunho2024: CustoOperacional = {
  id: 'custo-jun-2024',
  mesReferencia: '2024-06',
  tipo: 'DETALHADO',
  valorTotal: 11650.00,
  itens: [
    {
      id: 'item-10',
      categoria: 'ALUGUEL',
      descricao: 'Aluguel Loja',
      valor: 3000.00,
      ordem: 1
    },
    {
      id: 'item-11',
      categoria: 'CONTAS',
      descricao: 'Contas de Consumo',
      valor: 950.00,
      ordem: 2
    },
    {
      id: 'item-12',
      categoria: 'PESSOAL',
      descricao: 'Salários + Encargos',
      valor: 7200.00,
      ordem: 3
    },
    {
      id: 'item-13',
      categoria: 'OUTROS',
      descricao: 'Diversos',
      valor: 500.00,
      ordem: 4
    }
  ],
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01')
};

export const mockCustosOperacionaisDual: CustoOperacional[] = [
  custoNovembro2024,
  custoOutubro2024,
  custoSetembro2024,
  custoAgosto2024,
  custoJulho2024,
  custoJunho2024
];

export default mockCustosOperacionaisDual;
