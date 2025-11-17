import { VendaRegistrada } from '@/types/analise-vendas';
import { CustoOperacional } from '@/types/custos-operacionais';

export interface DashboardGestaoData {
  mesReferencia: string;

  // Métricas principais
  receita: number;
  cpv: number;
  lucroBruto: number;
  custoOperacional: number;
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;

  // Comparação
  mesAnterior: {
    lucroLiquido: number;
    margemLiquida: number;
    receita: number;
  };
  variacao: {
    lucroLiquido: number; // percentual
    margemLiquida: number; // pontos percentuais
    receita: number; // percentual
  };

  // Análises
  status: 'saudavel' | 'atencao' | 'critico';
  tendencia: 'crescendo' | 'estavel' | 'caindo';
  pontoEquilibrio: number;
  percentualMeta?: number;

  // Breakdown
  top3Produtos: Array<{nome: string; quantidade: number; valor: number}>;
  top3Custos?: Array<{categoria: string; descricao: string; valor: number}>;

  // Dados brutos
  totalVendas: number;
}

export const filtrarVendasPorMes = (vendas: VendaRegistrada[], mesReferencia: string): VendaRegistrada[] => {
  const [ano, mes] = mesReferencia.split('-');
  return vendas.filter(venda => {
    const dataVenda = new Date(venda.dataVenda);
    return (
      dataVenda.getFullYear() === parseInt(ano) &&
      dataVenda.getMonth() + 1 === parseInt(mes)
    );
  });
};

export const buscarCustoPorMes = (custos: CustoOperacional[], mesReferencia: string): number => {
  return custos
    .filter(custo => custo.mesReferencia === mesReferencia)
    .reduce((total, custo) => total + custo.valorTotal, 0);
};

export const calcularReceita = (vendas: VendaRegistrada[]): number => {
  return vendas.reduce((sum, v) => sum + v.precoTotalVendido, 0);
};

export const calcularCPV = (vendas: VendaRegistrada[]): number => {
  return vendas.reduce((sum, v) => sum + v.custoCalculado, 0);
};

export const calcularTop3Produtos = (vendas: VendaRegistrada[]): Array<{nome: string; quantidade: number; valor: number}> => {
  const produtosMap = new Map<string, {quantidade: number; valor: number}>();

  vendas.forEach(venda => {
    const key = venda.produtoNome;
    const existente = produtosMap.get(key);

    if (existente) {
      existente.quantidade += venda.quantidade;
      existente.valor += venda.precoTotalVendido;
    } else {
      produtosMap.set(key, {
        quantidade: venda.quantidade,
        valor: venda.precoTotalVendido
      });
    }
  });

  return Array.from(produtosMap.entries())
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 3);
};

export const obterMesAnterior = (mesReferencia: string): string => {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const data = new Date(ano, mes - 1, 1);
  data.setMonth(data.getMonth() - 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
};

export const analisarTendencia = (valores: number[]): 'crescendo' | 'estavel' | 'caindo' => {
  if (valores.length < 2) return 'estavel';

  const crescimentos: number[] = [];
  for (let i = 1; i < valores.length; i++) {
    if (valores[i - 1] === 0) continue;
    const cresc = ((valores[i] - valores[i - 1]) / valores[i - 1]) * 100;
    crescimentos.push(cresc);
  }

  if (crescimentos.length === 0) return 'estavel';

  const mediaCresc = crescimentos.reduce((a, b) => a + b, 0) / crescimentos.length;

  if (mediaCresc > 2) return 'crescendo';
  if (mediaCresc < -2) return 'caindo';
  return 'estavel';
};

export const calcularCrescimentoMedio = (valores: number[]): number => {
  if (valores.length < 2) return 0;

  const crescimentos: number[] = [];
  for (let i = 1; i < valores.length; i++) {
    if (valores[i - 1] === 0) continue;
    const cresc = ((valores[i] - valores[i - 1]) / valores[i - 1]);
    crescimentos.push(cresc);
  }

  if (crescimentos.length === 0) return 0;

  return crescimentos.reduce((a, b) => a + b, 0) / crescimentos.length;
};

export const obterUltimos3Meses = (mesReferencia: string): string[] => {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const meses: string[] = [];

  for (let i = 2; i >= 0; i--) {
    const data = new Date(ano, mes - 1, 1);
    data.setMonth(data.getMonth() - i);
    meses.push(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  }

  return meses;
};

export const calcularDashboardGestao = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[],
  mesReferencia: string,
  meta?: number
): DashboardGestaoData => {
  // Filtrar vendas do mês
  const vendasMes = filtrarVendasPorMes(vendas, mesReferencia);

  // Calcular métricas principais
  const receita = calcularReceita(vendasMes);
  const cpv = calcularCPV(vendasMes);
  const lucroBruto = receita - cpv;
  const custoOperacional = buscarCustoPorMes(custos, mesReferencia);
  const lucroLiquido = lucroBruto - custoOperacional;
  const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0;
  const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0;

  // Calcular comparação com mês anterior
  const mesAnt = obterMesAnterior(mesReferencia);
  const vendasMesAnt = filtrarVendasPorMes(vendas, mesAnt);
  const receitaAnt = calcularReceita(vendasMesAnt);
  const cpvAnt = calcularCPV(vendasMesAnt);
  const lucroBrutoAnt = receitaAnt - cpvAnt;
  const custoOperacionalAnt = buscarCustoPorMes(custos, mesAnt);
  const lucroLiquidoAnt = lucroBrutoAnt - custoOperacionalAnt;
  const margemLiquidaAnt = receitaAnt > 0 ? (lucroLiquidoAnt / receitaAnt) * 100 : 0;

  // Calcular variações
  const variacaoLucro = lucroLiquidoAnt !== 0 ? ((lucroLiquido - lucroLiquidoAnt) / Math.abs(lucroLiquidoAnt)) * 100 : 0;
  const variacaoMargem = margemLiquida - margemLiquidaAnt;
  const variacaoReceita = receitaAnt !== 0 ? ((receita - receitaAnt) / receitaAnt) * 100 : 0;

  // Determinar status
  const status =
    margemLiquida > 20 ? 'saudavel' :
    margemLiquida > 10 ? 'atencao' :
    'critico';

  // Calcular tendência
  const ultimos3Meses = obterUltimos3Meses(mesReferencia);
  const lucros = ultimos3Meses.map(m => {
    const v = filtrarVendasPorMes(vendas, m);
    const r = calcularReceita(v);
    const c = calcularCPV(v);
    const co = buscarCustoPorMes(custos, m);
    return r - c - co;
  });
  const tendencia = analisarTendencia(lucros);

  // Calcular ponto de equilíbrio
  const pontoEquilibrio = margemBruta > 0 ? custoOperacional / (margemBruta / 100) : 0;

  // Calcular top 3 produtos
  const top3Produtos = calcularTop3Produtos(vendasMes);

  // Calcular percentual da meta
  const percentualMeta = meta && meta > 0 ? (receita / meta) * 100 : undefined;

  return {
    mesReferencia,
    receita,
    cpv,
    lucroBruto,
    custoOperacional,
    lucroLiquido,
    margemBruta,
    margemLiquida,
    mesAnterior: {
      lucroLiquido: lucroLiquidoAnt,
      margemLiquida: margemLiquidaAnt,
      receita: receitaAnt
    },
    variacao: {
      lucroLiquido: variacaoLucro,
      margemLiquida: variacaoMargem,
      receita: variacaoReceita
    },
    status,
    tendencia,
    pontoEquilibrio,
    percentualMeta,
    top3Produtos,
    totalVendas: vendasMes.length
  };
};

export const calcularProjecao = (historico: number[]): number => {
  if (historico.length === 0) return 0;

  const media = historico.reduce((a, b) => a + b, 0) / historico.length;
  const crescimento = calcularCrescimentoMedio(historico);
  return media * (1 + crescimento);
};

export const simularMeta = (
  receitaAtual: number,
  totalVendas: number,
  metaReceita: number,
  margemLiquida: number
): {
  vendasNecessarias: number;
  aumentoVendas: number;
  percentualAumento: number;
  lucroProjetado: number;
} => {
  const ticketMedio = totalVendas > 0 ? receitaAtual / totalVendas : 0;
  const vendasNecessarias = ticketMedio > 0 ? Math.ceil(metaReceita / ticketMedio) : 0;
  const aumentoVendas = vendasNecessarias - totalVendas;
  const percentualAumento = totalVendas > 0 ? (aumentoVendas / totalVendas) * 100 : 0;
  const lucroProjetado = (metaReceita * margemLiquida) / 100;

  return {
    vendasNecessarias,
    aumentoVendas,
    percentualAumento,
    lucroProjetado
  };
};
