import {
  ImportacaoVendas,
  VendaRegistrada,
  ResumoImportacao
} from '@/types/analise-vendas';
import { PeriodoImportacao } from '@/types/periodo';
import { criarPeriodoMesCompleto } from '@/utils/periodoUtils';

// Produtos do cardápio para referência
const produtosCardapio = [
  { id: '1', nome: 'Açaí Tradicional 300ml', preco: 15.90, custo: 3.10, sku: 'ACAI-TRAD-300' },
  { id: '2', nome: 'Açaí Tradicional 500ml', preco: 20.90, custo: 5.20, sku: 'ACAI-TRAD-500' },
  { id: '3', nome: 'Açaí Tradicional 700ml', preco: 25.90, custo: 7.30, sku: 'ACAI-TRAD-700' },
  { id: '4', nome: 'Açaí Banana com Granola', preco: 18.90, custo: 4.15, sku: 'ACAI-BAN-GRA' },
  { id: '5', nome: 'Açaí Energy', preco: 22.90, custo: 5.80, sku: 'ACAI-ENRG' },
  { id: '6', nome: 'Cupuaçu Premium Gourmet', preco: 17.90, custo: 3.40, sku: 'CUP-PREM-GOUR' },
  { id: '7', nome: 'Granola Artesanal', preco: 3.50, custo: 0.75, sku: 'GRN-ART-30G' },
  { id: '8', nome: 'Banana Fatiada', preco: 2.50, custo: 0.56, sku: 'BAN-FAT-80G' },
  { id: '9', nome: 'Morango Fatiado', preco: 4.50, custo: 1.20, sku: 'MOR-FAT-60G' },
  { id: '10', nome: 'Mix de Frutas Vermelhas', preco: 6.50, custo: 1.45, sku: 'MIX-FRU-VER' }
];

// Função auxiliar para gerar vendas de um dia
const gerarVendasDia = (data: Date, periodo: PeriodoImportacao, baseSeed: number): VendaRegistrada[] => {
  const vendas: VendaRegistrada[] = [];
  const numVendas = Math.floor(Math.random() * 15) + 5; // 5-20 vendas por dia

  for (let i = 0; i < numVendas; i++) {
    const produto = produtosCardapio[Math.floor(Math.random() * produtosCardapio.length)];
    const quantidade = Math.floor(Math.random() * 3) + 1; // 1-3 unidades
    const precoVendido = produto.preco + (Math.random() - 0.5) * 2; // Pequena variação no preço
    const custoCalculado = produto.custo * quantidade;
    const precoTotal = precoVendido * quantidade;

    vendas.push({
      id: `venda-${baseSeed}-${i}`,
      importacaoId: `imp-${periodo.mesReferencia}`,
      vendaErpId: `ERP-${baseSeed}${i.toString().padStart(3, '0')}`,
      dataVenda: new Date(data.getTime() + Math.random() * 24 * 60 * 60 * 1000),
      produtoErpId: produto.sku,
      produtoNome: produto.nome,
      quantidade,
      precoUnitarioVendido: precoVendido,
      precoTotalVendido: precoTotal,
      itemCardapioId: produto.id,
      itemCardapioNome: produto.nome,
      statusMatch: 'matched',
      custoCalculado,
      precoCardapio: produto.preco,
      lucroBrutoReal: precoTotal - custoCalculado,
      lucroBrutoEsperado: (produto.preco * quantidade) - custoCalculado,
      margemReal: ((precoTotal - custoCalculado) / precoTotal) * 100,
      margemEsperada: ((produto.preco - produto.custo) / produto.preco) * 100,
      divergenciaValor: precoTotal - (produto.preco * quantidade),
      divergenciaPercentual: ((precoVendido - produto.preco) / produto.preco) * 100,
      statusAnalise: Math.abs(precoVendido - produto.preco) > produto.preco * 0.1 ? 'divergencia' : 'ok',
      vendedor: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'][Math.floor(Math.random() * 4)]
    });
  }

  return vendas;
};

// Função para gerar vendas de um mês completo
const gerarVendasMes = (periodo: PeriodoImportacao): VendaRegistrada[] => {
  const vendas: VendaRegistrada[] = [];
  const dataAtual = new Date(periodo.dataInicio);
  let baseSeed = parseInt(periodo.mesReferencia.replace('-', ''));

  while (dataAtual <= periodo.dataFim) {
    // Não gerar vendas para domingos (exemplo de loja fechada)
    if (dataAtual.getDay() !== 0) {
      vendas.push(...gerarVendasDia(dataAtual, periodo, baseSeed));
      baseSeed++;
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return vendas;
};

// Dados estruturados por mês
export const mockVendasPorMes = {
  "2024-01": (() => {
    const periodo = criarPeriodoMesCompleto("2024-01");
    const vendas = gerarVendasMes(periodo);
    const totalReceita = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
    const totalCusto = vendas.reduce((acc, v) => acc + v.custoCalculado, 0);

    return {
      periodo,
      vendas,
      importacao: {
        id: 'imp-2024-01',
        nomeArquivo: 'vendas_janeiro_2024.csv',
        dataImportacao: new Date('2024-02-01T10:30:00'),
        periodoInicio: periodo.dataInicio,
        periodoFim: periodo.dataFim,
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        totalImportados: vendas.length,
        totalDuplicados: 0,
        totalSemMatch: 0,
        status: 'concluido' as const
      },
      resumo: {
        arquivo: 'vendas_janeiro_2024.csv',
        periodo: {
          inicio: periodo.dataInicio,
          fim: periodo.dataFim
        },
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        registrosNovos: vendas.length,
        registrosDuplicados: 0,
        produtosSemMatch: [],
        valorTotalNovo: totalReceita
      },
      metricas: {
        totalReceita,
        totalCusto,
        lucroTotal: totalReceita - totalCusto,
        margemMedia: ((totalReceita - totalCusto) / totalReceita) * 100,
        ticketMedio: totalReceita / vendas.length,
        produtoMaisVendido: 'Açaí Tradicional 500ml'
      }
    };
  })(),

  "2024-02": (() => {
    const periodo = criarPeriodoMesCompleto("2024-02");
    const vendas = gerarVendasMes(periodo);
    const totalReceita = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
    const totalCusto = vendas.reduce((acc, v) => acc + v.custoCalculado, 0);

    return {
      periodo,
      vendas,
      importacao: {
        id: 'imp-2024-02',
        nomeArquivo: 'vendas_fevereiro_2024.csv',
        dataImportacao: new Date('2024-03-01T09:15:00'),
        periodoInicio: periodo.dataInicio,
        periodoFim: periodo.dataFim,
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        totalImportados: vendas.length,
        totalDuplicados: 0,
        totalSemMatch: 0,
        status: 'concluido' as const
      },
      resumo: {
        arquivo: 'vendas_fevereiro_2024.csv',
        periodo: {
          inicio: periodo.dataInicio,
          fim: periodo.dataFim
        },
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        registrosNovos: vendas.length,
        registrosDuplicados: 0,
        produtosSemMatch: [],
        valorTotalNovo: totalReceita
      },
      metricas: {
        totalReceita,
        totalCusto,
        lucroTotal: totalReceita - totalCusto,
        margemMedia: ((totalReceita - totalCusto) / totalReceita) * 100,
        ticketMedio: totalReceita / vendas.length,
        produtoMaisVendido: 'Açaí Tradicional 500ml'
      }
    };
  })(),

  "2024-03": (() => {
    const periodo = criarPeriodoMesCompleto("2024-03");
    const vendas = gerarVendasMes(periodo);
    const totalReceita = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
    const totalCusto = vendas.reduce((acc, v) => acc + v.custoCalculado, 0);

    return {
      periodo,
      vendas,
      importacao: {
        id: 'imp-2024-03',
        nomeArquivo: 'vendas_marco_2024.csv',
        dataImportacao: new Date('2024-04-01T11:20:00'),
        periodoInicio: periodo.dataInicio,
        periodoFim: periodo.dataFim,
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        totalImportados: vendas.length,
        totalDuplicados: 0,
        totalSemMatch: 0,
        status: 'concluido' as const
      },
      resumo: {
        arquivo: 'vendas_marco_2024.csv',
        periodo: {
          inicio: periodo.dataInicio,
          fim: periodo.dataFim
        },
        periodoImportacao: periodo,
        totalRegistros: vendas.length,
        registrosNovos: vendas.length,
        registrosDuplicados: 0,
        produtosSemMatch: [],
        valorTotalNovo: totalReceita
      },
      metricas: {
        totalReceita,
        totalCusto,
        lucroTotal: totalReceita - totalCusto,
        margemMedia: ((totalReceita - totalCusto) / totalReceita) * 100,
        ticketMedio: totalReceita / vendas.length,
        produtoMaisVendido: 'Açaí Energy'
      }
    };
  })()
};

// Exportar todas as vendas de todos os meses
export const todasVendasMock = Object.values(mockVendasPorMes).flatMap(mes => mes.vendas);

// Exportar todas as importações
export const todasImportacoesMock = Object.values(mockVendasPorMes).map(mes => mes.importacao);

// Função para obter vendas de um mês específico
export const obterVendasDoMes = (mesReferencia: string) => {
  return mockVendasPorMes[mesReferencia as keyof typeof mockVendasPorMes];
};

// Função para obter métricas consolidadas
export const obterMetricasConsolidadas = () => {
  const todosOsDados = Object.values(mockVendasPorMes);

  return {
    totalMeses: todosOsDados.length,
    receitaTotal: todosOsDados.reduce((acc, mes) => acc + mes.metricas.totalReceita, 0),
    custoTotal: todosOsDados.reduce((acc, mes) => acc + mes.metricas.totalCusto, 0),
    vendasTotais: todosOsDados.reduce((acc, mes) => acc + mes.vendas.length, 0),
    ticketMedioGeral: todosOsDados.reduce((acc, mes) => acc + mes.metricas.ticketMedio, 0) / todosOsDados.length
  };
};