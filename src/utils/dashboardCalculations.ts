import { VendaRegistrada } from '@/types/analise-vendas';
import { CustoOperacional } from '@/types/financeiro';
import { ItemCardapio, Alerta } from '@/types/database';
import { PeriodoImportacao } from '@/types/periodo';
import {
  calcularVariacaoPercentual,
  formatarMoeda,
  formatarPercentual,
  obterNomeMes
} from './calculosFinanceiros';

// ===========================
// TIPOS LOCAIS
// ===========================

export interface SaudeFinanceira {
  lucroLiquido: number;
  margemLiquida: number;
  faturamento: number;
  cpv: number;
  custosOperacionais: number;
  meta: number;
  percentualMeta: number;
  comparacaoMesAnterior: {
    lucroLiquido: number;
    margemLiquida: number;
    faturamento: number;
  };
}

export interface DadosEvolucao {
  periodo: string;
  receita: number;
  lucroLiquido: number;
  custoTotal: number;
}

export interface TopProduto {
  id: string;
  nome: string;
  quantidade: number;
  valorTotal: number;
  percentualDoMax: number;
}

export interface ProdutoMargem {
  id: string;
  nome: string;
  margem: number;
  preco: number;
  custo: number;
  isPremium?: boolean;
}

export interface AlertaCritico {
  id: string;
  tipo: 'PREJUIZO' | 'SEM_VENDAS' | 'AUMENTO_CUSTO' | 'NAO_ENCONTRADO' | 'MARGEM_BAIXA';
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
  titulo: string;
  descricao: string;
  quantidade: number;
  link?: string;
  acao?: string;
  dados?: any;
}

// ===========================
// CÁLCULO DE SAÚDE FINANCEIRA
// ===========================

export const calcularSaudeFinanceira = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[],
  periodoAtual: PeriodoImportacao,
  meta?: number
): SaudeFinanceira => {
  // Vendas do período atual
  const vendasAtual = vendas.filter(v =>
    v.dataVenda >= periodoAtual.dataInicio && v.dataVenda <= periodoAtual.dataFim
  );

  const faturamento = vendasAtual.reduce((acc, v) => acc + v.precoTotalVendido, 0);
  const cpv = vendasAtual.reduce((acc, v) => acc + v.custoCalculado, 0);

  // Custos operacionais do período
  const custosOp = custos
    .filter(c => {
      if (!c.periodoImportacao) return false;
      return c.periodoImportacao.mesReferencia === periodoAtual.mesReferencia;
    })
    .reduce((acc, c) => acc + c.valor, 0);

  const lucroLiquido = faturamento - cpv - custosOp;
  const margemLiquida = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;

  // Meta: usar fornecida ou calcular média dos últimos 3 meses
  let metaCalculada = meta || 40000;

  if (!meta && vendas.length > 0) {
    const ultimos3Meses = calcularMediaUltimos3Meses(vendas, periodoAtual);
    if (ultimos3Meses > 0) {
      metaCalculada = ultimos3Meses;
    }
  }

  const percentualMeta = metaCalculada > 0 ? (faturamento / metaCalculada) * 100 : 0;

  // Comparação com mês anterior
  const periodoAnterior = obterPeriodoAnterior(periodoAtual);
  const vendasAnterior = vendas.filter(v =>
    v.dataVenda >= periodoAnterior.dataInicio && v.dataVenda <= periodoAnterior.dataFim
  );

  const faturamentoAnterior = vendasAnterior.reduce((acc, v) => acc + v.precoTotalVendido, 0);
  const cpvAnterior = vendasAnterior.reduce((acc, v) => acc + v.custoCalculado, 0);
  const custosOpAnterior = custos
    .filter(c => {
      if (!c.periodoImportacao) return false;
      return c.periodoImportacao.mesReferencia === periodoAnterior.mesReferencia;
    })
    .reduce((acc, c) => acc + c.valor, 0);

  const lucroLiquidoAnterior = faturamentoAnterior - cpvAnterior - custosOpAnterior;
  const margemLiquidaAnterior = faturamentoAnterior > 0
    ? (lucroLiquidoAnterior / faturamentoAnterior) * 100
    : 0;

  return {
    lucroLiquido,
    margemLiquida,
    faturamento,
    cpv,
    custosOperacionais: custosOp,
    meta: metaCalculada,
    percentualMeta,
    comparacaoMesAnterior: {
      lucroLiquido: calcularVariacaoPercentual(lucroLiquido, lucroLiquidoAnterior),
      margemLiquida: calcularVariacaoPercentual(margemLiquida, margemLiquidaAnterior),
      faturamento: calcularVariacaoPercentual(faturamento, faturamentoAnterior),
    }
  };
};

// ===========================
// EVOLUÇÃO FINANCEIRA
// ===========================

export const calcularEvolucaoFinanceira = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[],
  periodo: '6M' | '3M' | '30D' | '7D'
): DadosEvolucao[] => {
  const hoje = new Date();
  let dataInicio: Date;
  let agrupamento: 'dia' | 'mes' = 'mes';

  switch (periodo) {
    case '7D':
      dataInicio = new Date(hoje);
      dataInicio.setDate(hoje.getDate() - 7);
      agrupamento = 'dia';
      break;
    case '30D':
      dataInicio = new Date(hoje);
      dataInicio.setDate(hoje.getDate() - 30);
      agrupamento = 'dia';
      break;
    case '3M':
      dataInicio = new Date(hoje);
      dataInicio.setMonth(hoje.getMonth() - 3);
      agrupamento = 'mes';
      break;
    case '6M':
    default:
      dataInicio = new Date(hoje);
      dataInicio.setMonth(hoje.getMonth() - 6);
      agrupamento = 'mes';
      break;
  }

  const vendasPeriodo = vendas.filter(v => v.dataVenda >= dataInicio);

  if (agrupamento === 'mes') {
    return agruparPorMes(vendasPeriodo, custos);
  } else {
    return agruparPorDia(vendasPeriodo, custos, dataInicio, hoje);
  }
};

const agruparPorMes = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[]
): DadosEvolucao[] => {
  const grupos: Record<string, DadosEvolucao> = {};

  vendas.forEach(venda => {
    const mesRef = `${venda.dataVenda.getFullYear()}-${String(venda.dataVenda.getMonth() + 1).padStart(2, '0')}`;

    if (!grupos[mesRef]) {
      grupos[mesRef] = {
        periodo: mesRef,
        receita: 0,
        lucroLiquido: 0,
        custoTotal: 0
      };
    }

    grupos[mesRef].receita += venda.precoTotalVendido;
  });

  // Adicionar custos e calcular lucro
  Object.keys(grupos).forEach(mesRef => {
    const cpv = vendas
      .filter(v => {
        const vMes = `${v.dataVenda.getFullYear()}-${String(v.dataVenda.getMonth() + 1).padStart(2, '0')}`;
        return vMes === mesRef;
      })
      .reduce((acc, v) => acc + v.custoCalculado, 0);

    const custosOp = custos
      .filter(c => c.periodoImportacao?.mesReferencia === mesRef)
      .reduce((acc, c) => acc + c.valor, 0);

    grupos[mesRef].custoTotal = cpv + custosOp;
    grupos[mesRef].lucroLiquido = grupos[mesRef].receita - grupos[mesRef].custoTotal;
  });

  return Object.values(grupos).sort((a, b) => a.periodo.localeCompare(b.periodo));
};

const agruparPorDia = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[],
  dataInicio: Date,
  dataFim: Date
): DadosEvolucao[] => {
  const grupos: Record<string, DadosEvolucao> = {};

  // Inicializar todos os dias do período
  const diaAtual = new Date(dataInicio);
  while (diaAtual <= dataFim) {
    const diaStr = diaAtual.toISOString().split('T')[0];
    grupos[diaStr] = {
      periodo: diaStr,
      receita: 0,
      lucroLiquido: 0,
      custoTotal: 0
    };
    diaAtual.setDate(diaAtual.getDate() + 1);
  }

  // Agregar vendas por dia
  vendas.forEach(venda => {
    const diaStr = venda.dataVenda.toISOString().split('T')[0];

    if (grupos[diaStr]) {
      grupos[diaStr].receita += venda.precoTotalVendido;
      grupos[diaStr].custoTotal += venda.custoCalculado;
    }
  });

  // Distribuir custos operacionais proporcionalmente pelos dias
  const totalDias = Object.keys(grupos).length;
  const custosPorDia = custos.reduce((acc, c) => acc + c.valor, 0) / Math.max(totalDias, 1);

  Object.keys(grupos).forEach(dia => {
    grupos[dia].custoTotal += custosPorDia;
    grupos[dia].lucroLiquido = grupos[dia].receita - grupos[dia].custoTotal;
  });

  return Object.values(grupos).sort((a, b) => a.periodo.localeCompare(b.periodo));
};

// ===========================
// TOP PRODUTOS
// ===========================

export const calcularTopProdutos = (
  vendas: VendaRegistrada[],
  periodo: number, // dias
  limite: number = 5,
  ordem: 'mais' | 'menos' = 'mais'
): TopProduto[] => {
  const hoje = new Date();
  const dataInicio = new Date(hoje);
  dataInicio.setDate(hoje.getDate() - periodo);

  const vendasPeriodo = vendas.filter(v => v.dataVenda >= dataInicio);

  const agrupado: Record<string, TopProduto> = {};

  vendasPeriodo.forEach(venda => {
    const key = venda.itemCardapioId || venda.produtoNome;

    if (!agrupado[key]) {
      agrupado[key] = {
        id: venda.itemCardapioId || venda.produtoErpId,
        nome: venda.itemCardapioNome || venda.produtoNome,
        quantidade: 0,
        valorTotal: 0,
        percentualDoMax: 0
      };
    }

    agrupado[key].quantidade += venda.quantidade;
    agrupado[key].valorTotal += venda.precoTotalVendido;
  });

  let produtos = Object.values(agrupado);

  if (ordem === 'mais') {
    produtos = produtos
      .filter(p => p.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade);
  } else {
    produtos = produtos
      .filter(p => p.quantidade > 0)
      .sort((a, b) => a.quantidade - b.quantidade);
  }

  produtos = produtos.slice(0, limite);

  // Calcular percentual do máximo
  const maxQuantidade = produtos[0]?.quantidade || 1;
  produtos.forEach(p => {
    p.percentualDoMax = (p.quantidade / maxQuantidade) * 100;
  });

  return produtos;
};

// ===========================
// PRODUTOS POR MARGEM
// ===========================

export const calcularProdutosComMargem = (
  cardapio: ItemCardapio[],
  tipo: 'maior' | 'menor',
  limite: number = 5
): ProdutoMargem[] => {
  const ativos = cardapio.filter(item => item.ativo);

  let produtos: ProdutoMargem[];

  if (tipo === 'maior') {
    produtos = ativos
      .sort((a, b) => b.margemAtual - a.margemAtual)
      .slice(0, limite)
      .map(item => ({
        id: item.id,
        nome: item.nome,
        margem: item.margemAtual,
        preco: item.precoAtual,
        custo: item.custoAtual,
        isPremium: item.margemAtual > 60
      }));
  } else {
    produtos = ativos
      .filter(item => item.margemAtual > 0) // Sem prejuízo
      .sort((a, b) => a.margemAtual - b.margemAtual)
      .slice(0, limite)
      .map(item => ({
        id: item.id,
        nome: item.nome,
        margem: item.margemAtual,
        preco: item.precoAtual,
        custo: item.custoAtual
      }));
  }

  return produtos;
};

// ===========================
// ALERTAS CRÍTICOS
// ===========================

export const gerarAlertas = (
  cardapio: ItemCardapio[],
  vendas: VendaRegistrada[],
  alertasExistentes: Alerta[]
): AlertaCritico[] => {
  const alertas: AlertaCritico[] = [];
  const hoje = new Date();
  const ultimos7Dias = new Date(hoje);
  ultimos7Dias.setDate(hoje.getDate() - 7);

  // 1. Produtos com prejuízo
  const produtosComPrejuizo = cardapio.filter(
    item => item.ativo && item.precoAtual < item.custoAtual
  );

  if (produtosComPrejuizo.length > 0) {
    alertas.push({
      id: 'alerta-prejuizo',
      tipo: 'PREJUIZO',
      severidade: 'critico',
      titulo: 'Produtos com Prejuízo',
      descricao: `${produtosComPrejuizo.length} ${produtosComPrejuizo.length === 1 ? 'item' : 'itens'} do cardápio ${produtosComPrejuizo.length === 1 ? 'está' : 'estão'} com prejuízo`,
      quantidade: produtosComPrejuizo.length,
      link: '/cardapio',
      acao: 'Ver produtos',
      dados: produtosComPrejuizo
    });
  }

  // 2. Produtos sem vendas nos últimos 7 dias
  const vendasRecentes = vendas.filter(v => v.dataVenda >= ultimos7Dias);
  const produtosVendidos = new Set(
    vendasRecentes
      .filter(v => v.itemCardapioId)
      .map(v => v.itemCardapioId)
  );

  const produtosSemVendas = cardapio.filter(
    item => item.ativo && !produtosVendidos.has(item.id)
  );

  if (produtosSemVendas.length > 0) {
    alertas.push({
      id: 'alerta-sem-vendas',
      tipo: 'SEM_VENDAS',
      severidade: 'medio',
      titulo: 'Produtos Sem Vendas',
      descricao: `${produtosSemVendas.length} ${produtosSemVendas.length === 1 ? 'produto' : 'produtos'} sem vendas nos últimos 7 dias`,
      quantidade: produtosSemVendas.length,
      link: '/cardapio',
      acao: 'Ver produtos',
      dados: produtosSemVendas
    });
  }

  // 3. Produtos não encontrados nas vendas
  const produtosNaoEncontrados = vendas.filter(v => v.statusMatch === 'not_found');
  const produtosUnicos = new Set(produtosNaoEncontrados.map(v => v.produtoErpId));

  if (produtosUnicos.size > 0) {
    alertas.push({
      id: 'alerta-nao-encontrado',
      tipo: 'NAO_ENCONTRADO',
      severidade: 'alto',
      titulo: 'Produtos Não Encontrados',
      descricao: `${produtosUnicos.size} ${produtosUnicos.size === 1 ? 'produto vendido' : 'produtos vendidos'} não ${produtosUnicos.size === 1 ? 'encontrado' : 'encontrados'} no cardápio`,
      quantidade: produtosUnicos.size,
      link: '/analise-vendas',
      acao: 'Resolver matches',
      dados: produtosNaoEncontrados
    });
  }

  // 4. Produtos com margem baixa (mas sem prejuízo)
  const produtosMargemBaixa = cardapio.filter(
    item => item.ativo && item.margemAtual > 0 && item.margemAtual < 30
  );

  if (produtosMargemBaixa.length > 0) {
    alertas.push({
      id: 'alerta-margem-baixa',
      tipo: 'MARGEM_BAIXA',
      severidade: 'medio',
      titulo: 'Margem Baixa',
      descricao: `${produtosMargemBaixa.length} ${produtosMargemBaixa.length === 1 ? 'item' : 'itens'} com margem abaixo de 30%`,
      quantidade: produtosMargemBaixa.length,
      link: '/cardapio',
      acao: 'Revisar preços',
      dados: produtosMargemBaixa
    });
  }

  // 5. Aumento de custo de insumo (baseado em alertas existentes)
  const alertasAumentoCusto = alertasExistentes.filter(
    a => a.tipo === 'PRECO_ALTERADO' && !a.lido
  );

  if (alertasAumentoCusto.length > 0) {
    alertas.push({
      id: 'alerta-aumento-custo',
      tipo: 'AUMENTO_CUSTO',
      severidade: 'alto',
      titulo: 'Aumento de Custos',
      descricao: `${alertasAumentoCusto.length} ${alertasAumentoCusto.length === 1 ? 'insumo teve' : 'insumos tiveram'} aumento de custo`,
      quantidade: alertasAumentoCusto.length,
      link: '/insumos',
      acao: 'Revisar insumos',
      dados: alertasAumentoCusto
    });
  }

  return alertas;
};

// ===========================
// FUNÇÕES AUXILIARES
// ===========================

const calcularMediaUltimos3Meses = (
  vendas: VendaRegistrada[],
  periodoAtual: PeriodoImportacao
): number => {
  const ultimos3Meses: number[] = [];

  for (let i = 1; i <= 3; i++) {
    const mes = new Date(periodoAtual.dataInicio);
    mes.setMonth(mes.getMonth() - i);

    const mesRef = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;
    const vendasMes = vendas.filter(v => {
      const vMes = `${v.dataVenda.getFullYear()}-${String(v.dataVenda.getMonth() + 1).padStart(2, '0')}`;
      return vMes === mesRef;
    });

    const faturamento = vendasMes.reduce((acc, v) => acc + v.precoTotalVendido, 0);
    ultimos3Meses.push(faturamento);
  }

  const soma = ultimos3Meses.reduce((acc, val) => acc + val, 0);
  return soma / 3;
};

const obterPeriodoAnterior = (periodo: PeriodoImportacao): PeriodoImportacao => {
  const mesAnterior = new Date(periodo.dataInicio);
  mesAnterior.setMonth(mesAnterior.getMonth() - 1);

  const ano = mesAnterior.getFullYear();
  const mes = mesAnterior.getMonth() + 1;
  const mesRef = `${ano}-${String(mes).padStart(2, '0')}`;

  const diasTotais = new Date(ano, mes, 0).getDate();
  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes - 1, diasTotais, 23, 59, 59);

  return {
    tipo: 'MES_COMPLETO',
    mesReferencia: mesRef,
    ano,
    mes,
    dataInicio,
    dataFim,
    status: 'CONCLUIDO',
    diasTotais,
    diasImportados: diasTotais
  };
};
