import { CustoOperacional } from '@/types/financeiro';

export const mockCustosOperacionais: CustoOperacional[] = [
  {
    id: '1',
    mes: 1,
    ano: 2025,
    valor: 25000,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 12.000, Energia: R$ 2.500, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200, Limpeza: R$ 200',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05')
  },
  {
    id: '2',
    mes: 12,
    ano: 2024,
    valor: 23500,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.000, Energia: R$ 2.200, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '3',
    mes: 11,
    ano: 2024,
    valor: 24200,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.500, Energia: R$ 2.400, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-11-03'),
    updatedAt: new Date('2024-11-03')
  },
  {
    id: '4',
    mes: 10,
    ano: 2024,
    valor: 23800,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.200, Energia: R$ 2.300, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-10-02'),
    updatedAt: new Date('2024-10-02')
  },
  {
    id: '5',
    mes: 9,
    ano: 2024,
    valor: 22900,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 10.500, Energia: R$ 2.100, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-09-04'),
    updatedAt: new Date('2024-09-04')
  },
  {
    id: '6',
    mes: 8,
    ano: 2024,
    valor: 24500,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 12.000, Energia: R$ 2.200, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-08-03'),
    updatedAt: new Date('2024-08-03')
  },
  {
    id: '7',
    mes: 7,
    ano: 2024,
    valor: 23700,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.200, Energia: R$ 2.200, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-07-02'),
    updatedAt: new Date('2024-07-02')
  },
  {
    id: '8',
    mes: 6,
    ano: 2024,
    valor: 24100,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.800, Energia: R$ 2.000, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-06-04'),
    updatedAt: new Date('2024-06-04')
  },
  {
    id: '9',
    mes: 5,
    ano: 2024,
    valor: 22800,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 10.500, Energia: R$ 2.000, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date('2024-05-02')
  },
  {
    id: '10',
    mes: 4,
    ano: 2024,
    valor: 23400,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.000, Energia: R$ 2.100, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-04-03'),
    updatedAt: new Date('2024-04-03')
  },
  {
    id: '11',
    mes: 3,
    ano: 2024,
    valor: 24000,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 11.500, Energia: R$ 2.200, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-03-04'),
    updatedAt: new Date('2024-03-04')
  },
  {
    id: '12',
    mes: 2,
    ano: 2024,
    valor: 22600,
    observacoes: 'Aluguel: R$ 8.000, Funcionários: R$ 10.200, Energia: R$ 2.100, Internet: R$ 300, Contabilidade: R$ 800, Licenças: R$ 1.200',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02')
  }
];

export const mockAlertasFinanceiros = [
  {
    id: 'alerta-1',
    tipo: 'margem_baixa' as const,
    titulo: 'Margem Líquida Baixa',
    descricao: 'A margem líquida do mês está abaixo de 10%. Considere revisar os custos operacionais.',
    severidade: 'warning' as const,
    createdAt: new Date()
  }
];