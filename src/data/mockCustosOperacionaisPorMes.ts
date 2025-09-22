import { CustoOperacional, ResumoCustosMes, CategoriaCusto } from '@/types/custos-operacionais';
import { PeriodoImportacao } from '@/types/periodo';
import { criarPeriodoMesCompleto } from '@/utils/periodoUtils';

// Template base de custos mensais típicos para uma açaiteria
const custosPadrao = {
  ALUGUEL: 3500.00,
  ENERGIA: 850.00,
  AGUA: 120.00,
  SALARIOS: 4200.00,
  MARKETING: 680.00,
  INSUMOS_EXTRAS: 320.00,
  MANUTENCAO: 180.00,
  OUTROS: 150.00
};

// Função para gerar custos com pequenas variações
const gerarCustosDoMes = (periodo: PeriodoImportacao, variacao: number = 0.1): CustoOperacional[] => {
  const custos: CustoOperacional[] = [];
  const dataBase = new Date();

  Object.entries(custosPadrao).forEach(([categoria, valorBase]) => {
    // Aplicar variação aleatória
    const variacao_valor = (Math.random() - 0.5) * 2 * variacao;
    const valor = valorBase * (1 + variacao_valor);

    // Definir datas de vencimento típicas para cada categoria
    let diaVencimento = 5; // Padrão
    switch (categoria as CategoriaCusto) {
      case 'ALUGUEL':
        diaVencimento = 5;
        break;
      case 'ENERGIA':
        diaVencimento = 10;
        break;
      case 'AGUA':
        diaVencimento = 15;
        break;
      case 'SALARIOS':
        diaVencimento = 25;
        break;
      case 'MARKETING':
        diaVencimento = 20;
        break;
      case 'INSUMOS_EXTRAS':
        diaVencimento = 12;
        break;
      case 'MANUTENCAO':
        diaVencimento = 18;
        break;
      case 'OUTROS':
        diaVencimento = 8;
        break;
    }

    const dataVencimento = new Date(periodo.ano, periodo.mes - 1, diaVencimento);
    const dataPagamento = new Date(dataVencimento);
    dataPagamento.setDate(dataPagamento.getDate() + Math.floor(Math.random() * 5)); // Pago até 5 dias após vencimento

    const descricoes: Record<CategoriaCusto, string> = {
      ALUGUEL: 'Aluguel da loja - Rua das Palmeiras, 123',
      ENERGIA: 'Conta de energia elétrica - CELPE',
      AGUA: 'Conta de água - COMPESA',
      SALARIOS: 'Folha de pagamento + encargos',
      MARKETING: 'Publicidade digital e materiais gráficos',
      INSUMOS_EXTRAS: 'Embalagens, canudos, colheres descartáveis',
      MANUTENCAO: 'Manutenção de equipamentos e limpeza',
      OUTROS: 'Despesas diversas'
    };

    custos.push({
      id: `custo-${periodo.mesReferencia}-${categoria.toLowerCase()}`,
      periodoImportacao: periodo,
      categoria: categoria as CategoriaCusto,
      descricao: descricoes[categoria as CategoriaCusto],
      valor: Math.round(valor * 100) / 100, // Arredondar para 2 casas decimais
      dataVencimento,
      dataPagamento,
      createdAt: dataBase,
      updatedAt: dataBase
    });
  });

  return custos;
};

// Dados estruturados por mês
export const mockCustosOperacionaisPorMes = {
  "2024-01": (() => {
    const periodo = criarPeriodoMesCompleto("2024-01");
    const custos = gerarCustosDoMes(periodo, 0.05); // Variação de 5%
    const totalMes = custos.reduce((acc, c) => acc + c.valor, 0);
    const totalPorCategoria = custos.reduce((acc, custo) => {
      acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
      return acc;
    }, {} as Record<CategoriaCusto, number>);

    const resumo: ResumoCustosMes = {
      periodo,
      custos,
      totalMes,
      totalPorCategoria,
      categoriasComCustos: custos.map(c => c.categoria),
      custosVencidos: [],
      custosProximoVencimento: custos.filter(c => {
        const diff = c.dataVencimento.getTime() - new Date().getTime();
        const diasParaVencimento = diff / (1000 * 60 * 60 * 24);
        return diasParaVencimento <= 7 && diasParaVencimento > 0;
      })
    };

    return resumo;
  })(),

  "2024-02": (() => {
    const periodo = criarPeriodoMesCompleto("2024-02");
    const custos = gerarCustosDoMes(periodo, 0.08); // Variação de 8%
    const totalMes = custos.reduce((acc, c) => acc + c.valor, 0);
    const totalPorCategoria = custos.reduce((acc, custo) => {
      acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
      return acc;
    }, {} as Record<CategoriaCusto, number>);

    const resumo: ResumoCustosMes = {
      periodo,
      custos,
      totalMes,
      totalPorCategoria,
      categoriasComCustos: custos.map(c => c.categoria),
      custosVencidos: [],
      custosProximoVencimento: custos.filter(c => {
        const diff = c.dataVencimento.getTime() - new Date().getTime();
        const diasParaVencimento = diff / (1000 * 60 * 60 * 24);
        return diasParaVencimento <= 7 && diasParaVencimento > 0;
      })
    };

    return resumo;
  })(),

  "2024-03": (() => {
    const periodo = criarPeriodoMesCompleto("2024-03");
    const custos = gerarCustosDoMes(periodo, 0.12); // Variação de 12%

    // Adicionar custo extra de manutenção para março
    custos.push({
      id: `custo-${periodo.mesReferencia}-manutencao-extra`,
      periodoImportacao: periodo,
      categoria: 'MANUTENCAO',
      descricao: 'Manutenção preventiva do freezer',
      valor: 450.00,
      dataVencimento: new Date(periodo.ano, periodo.mes - 1, 22),
      dataPagamento: new Date(periodo.ano, periodo.mes - 1, 22),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const totalMes = custos.reduce((acc, c) => acc + c.valor, 0);
    const totalPorCategoria = custos.reduce((acc, custo) => {
      acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
      return acc;
    }, {} as Record<CategoriaCusto, number>);

    const resumo: ResumoCustosMes = {
      periodo,
      custos,
      totalMes,
      totalPorCategoria,
      categoriasComCustos: [...new Set(custos.map(c => c.categoria))],
      custosVencidos: [],
      custosProximoVencimento: custos.filter(c => {
        const diff = c.dataVencimento.getTime() - new Date().getTime();
        const diasParaVencimento = diff / (1000 * 60 * 60 * 24);
        return diasParaVencimento <= 7 && diasParaVencimento > 0;
      })
    };

    return resumo;
  })()
};

// Exportar todos os custos de todos os meses
export const todosCustosMock = Object.values(mockCustosOperacionaisPorMes).flatMap(mes => mes.custos);

// Função para obter custos de um mês específico
export const obterCustosDoMes = (mesReferencia: string) => {
  return mockCustosOperacionaisPorMes[mesReferencia as keyof typeof mockCustosOperacionaisPorMes];
};

// Função para obter resumo consolidado de custos
export const obterResumoConsolidadoCustos = () => {
  const todosOsResumos = Object.values(mockCustosOperacionaisPorMes);

  const totalGeral = todosOsResumos.reduce((acc, resumo) => acc + resumo.totalMes, 0);
  const mediaPerCategoria = {} as Record<CategoriaCusto, number>;

  // Calcular média por categoria
  Object.keys(custosPadrao).forEach(categoria => {
    const cat = categoria as CategoriaCusto;
    const totais = todosOsResumos.map(resumo => resumo.totalPorCategoria[cat] || 0);
    mediaPerCategoria[cat] = totais.reduce((acc, val) => acc + val, 0) / totais.length;
  });

  return {
    totalMeses: todosOsResumos.length,
    custoTotalConsolidado: totalGeral,
    custoPorMesMedio: totalGeral / todosOsResumos.length,
    mediaPerCategoria,
    categoriaMaisCaraMedia: Object.entries(mediaPerCategoria)
      .sort(([,a], [,b]) => b - a)[0],
    evolucaoMensal: todosOsResumos.map(resumo => ({
      mes: resumo.periodo.mesReferencia,
      total: resumo.totalMes,
      principal: Object.entries(resumo.totalPorCategoria)
        .sort(([,a], [,b]) => b - a)[0]
    }))
  };
};

// Função para simular adição de custos
export const simularAdicionarCustos = (
  mesReferencia: string,
  novosCustos: Omit<CustoOperacional, 'id' | 'periodoImportacao' | 'createdAt' | 'updatedAt'>[]
): ResumoCustosMes => {
  const resumoAtual = obterCustosDoMes(mesReferencia);

  if (!resumoAtual) {
    throw new Error(`Mês ${mesReferencia} não encontrado`);
  }

  const custosCompletos: CustoOperacional[] = novosCustos.map((custo, index) => ({
    ...custo,
    id: `custo-${mesReferencia}-custom-${index}`,
    periodoImportacao: resumoAtual.periodo,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const custosAtualizados = [...resumoAtual.custos, ...custosCompletos];
  const totalMes = custosAtualizados.reduce((acc, c) => acc + c.valor, 0);
  const totalPorCategoria = custosAtualizados.reduce((acc, custo) => {
    acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
    return acc;
  }, {} as Record<CategoriaCusto, number>);

  return {
    ...resumoAtual,
    custos: custosAtualizados,
    totalMes,
    totalPorCategoria,
    categoriasComCustos: [...new Set(custosAtualizados.map(c => c.categoria))]
  };
};