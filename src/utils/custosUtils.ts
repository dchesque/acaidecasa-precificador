import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CustoOperacional,
  CustoItem,
  CustoItemInput,
  CategoriaCustoSimples,
  ResumoCustosMes,
  EvolucaoCustos,
  TipoCusto,
  CATEGORIAS_CUSTO_SIMPLES_LABELS
} from '@/types/custos-operacionais';
import { VendaRegistrada } from '@/types/analise-vendas';

// ============================================================================
// FORMATAÇÃO DE MÊS
// ============================================================================

/**
 * Formata mesReferencia "2024-11" para "Nov/24"
 */
export const formatarMesReferencia = (mesRef: string): string => {
  const [ano, mes] = mesRef.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesIndex = parseInt(mes) - 1;

  if (mesIndex < 0 || mesIndex > 11) {
    return mesRef; // Retorna original se inválido
  }

  return `${meses[mesIndex]}/${ano.substring(2)}`;
};

/**
 * Formata mesReferencia "2024-11" para "Novembro de 2024"
 */
export const formatarMesReferenciaCompleto = (mesRef: string): string => {
  const [ano, mes] = mesRef.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesIndex = parseInt(mes) - 1;

  if (mesIndex < 0 || mesIndex > 11) {
    return mesRef;
  }

  return `${meses[mesIndex]} de ${ano}`;
};

/**
 * Gera lista dos últimos N meses em formato "YYYY-MM"
 */
export const gerarUltimos12Meses = (): string[] => {
  const meses: string[] = [];
  const hoje = new Date();

  for (let i = 0; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesRef = format(data, 'yyyy-MM');
    meses.push(mesRef);
  }

  return meses;
};

/**
 * Converte mesReferencia para objeto Date (primeiro dia do mês)
 */
export const mesReferenciaParaData = (mesRef: string): Date => {
  const [ano, mes] = mesRef.split('-');
  return new Date(parseInt(ano), parseInt(mes) - 1, 1);
};

/**
 * Extrai mesReferencia de uma Data
 */
export const dataParaMesReferencia = (data: Date): string => {
  return format(data, 'yyyy-MM');
};

// ============================================================================
// CÁLCULOS DE CUSTOS
// ============================================================================

/**
 * Calcula o total de um custo (rápido ou detalhado)
 */
export const calcularTotalCusto = (custo: CustoOperacional): number => {
  if (custo.tipo === 'RAPIDO') {
    return custo.valorTotal;
  }

  return custo.itens?.reduce((acc, item) => acc + item.valor, 0) || 0;
};

/**
 * Calcula total de custos de uma lista
 */
export const calcularTotalCustos = (custos: CustoOperacional[]): number => {
  return custos.reduce((acc, custo) => acc + calcularTotalCusto(custo), 0);
};

/**
 * Agrupa custos detalhados por categoria
 */
export const agruparPorCategoria = (itens: CustoItem[]): Record<CategoriaCustoSimples, number> => {
  const agrupado = {
    ALUGUEL: 0,
    CONTAS: 0,
    PESSOAL: 0,
    OUTROS: 0
  } as Record<CategoriaCustoSimples, number>;

  itens.forEach(item => {
    agrupado[item.categoria] += item.valor;
  });

  return agrupado;
};

/**
 * Conta quantidade de custos (1 para rápido, length para detalhado)
 */
export const contarCustos = (custo: CustoOperacional): number => {
  if (custo.tipo === 'RAPIDO') {
    return 1;
  }

  return custo.itens?.length || 0;
};

// ============================================================================
// INTEGRAÇÃO COM VENDAS
// ============================================================================

/**
 * Calcula faturamento de um mês específico
 */
export const calcularFaturamentoMes = (
  mesReferencia: string,
  vendas: VendaRegistrada[]
): number => {
  return vendas
    .filter(venda => {
      const mesVenda = format(venda.dataVenda, 'yyyy-MM');
      return mesVenda === mesReferencia;
    })
    .reduce((acc, venda) => acc + venda.precoTotalVendido, 0);
};

/**
 * Calcula percentual dos custos em relação à receita
 */
export const calcularPercentualReceita = (
  totalCustos: number,
  faturamento: number
): number | null => {
  if (faturamento === 0) {
    return null;
  }

  return (totalCustos / faturamento) * 100;
};

/**
 * Calcula impacto no lucro (sempre negativo)
 */
export const calcularImpactoLucro = (totalCustos: number): number => {
  return -Math.abs(totalCustos);
};

// ============================================================================
// RESUMOS E ANÁLISES
// ============================================================================

/**
 * Gera resumo completo de custos de um mês
 */
export const gerarResumoCustosMes = (
  custo: CustoOperacional,
  vendas: VendaRegistrada[]
): ResumoCustosMes => {
  const total = calcularTotalCusto(custo);
  const faturamento = calcularFaturamentoMes(custo.mesReferencia, vendas);

  const percentual = calcularPercentualReceita(total, faturamento);

  const resumo: ResumoCustosMes = {
    mesReferencia: custo.mesReferencia,
    tipo: custo.tipo,
    valorTotal: total,
    quantidadeCustos: contarCustos(custo),
    percentualReceita: percentual !== null ? percentual : undefined,
    faturamentoMes: faturamento > 0 ? faturamento : undefined,
    impactoLucro: calcularImpactoLucro(total)
  };

  // Adicionar dados específicos de custos detalhados
  if (custo.tipo === 'DETALHADO' && custo.itens && custo.itens.length > 0) {
    resumo.custosPorCategoria = agruparPorCategoria(custo.itens);
    resumo.categoriasComCustos = custo.itens
      .map(item => item.categoria)
      .filter((cat, index, self) => self.indexOf(cat) === index);
  }

  return resumo;
};

/**
 * Gera dados de evolução mensal para gráficos
 */
export const gerarEvolucaoCustos = (
  custos: CustoOperacional[],
  mesesReferencia: string[]
): EvolucaoCustos[] => {
  return mesesReferencia.map(mesRef => {
    const custoDoMes = custos.find(c => c.mesReferencia === mesRef);

    const evolucao: EvolucaoCustos = {
      mesReferencia: mesRef,
      mesNome: formatarMesReferencia(mesRef),
      total: custoDoMes ? calcularTotalCusto(custoDoMes) : 0,
      tipo: custoDoMes?.tipo || 'RAPIDO'
    };

    // Adicionar breakdown por categoria se detalhado
    if (custoDoMes?.tipo === 'DETALHADO' && custoDoMes.itens) {
      evolucao.porCategoria = agruparPorCategoria(custoDoMes.itens);
    }

    return evolucao;
  });
};

// ============================================================================
// CONVERSÃO ENTRE MODOS
// ============================================================================

/**
 * Sugere divisão automática de custo rápido em categorias
 */
export const sugerirDivisaoCategorias = (
  valorTotal: number,
  observacoes?: string
): CustoItemInput[] => {
  // Análise simples de observações para sugerir melhor divisão
  const obs = (observacoes || '').toLowerCase();

  // Se menciona categorias específicas, dar mais peso
  const temAluguel = obs.includes('aluguel') || obs.includes('alug');
  const temContas = obs.includes('conta') || obs.includes('energia') || obs.includes('água') || obs.includes('internet');
  const temPessoal = obs.includes('salário') || obs.includes('salarios') || obs.includes('pessoal') || obs.includes('funcionário');

  let itens: CustoItemInput[] = [];

  if (temAluguel || temContas || temPessoal) {
    // Divisão inteligente baseada em menções
    const partes = [temAluguel, temContas, temPessoal].filter(Boolean).length;
    const valorPorParte = valorTotal / (partes + 1); // +1 para "Outros"

    if (temAluguel) {
      itens.push({
        categoria: 'ALUGUEL',
        descricao: 'Aluguel',
        valor: Math.round(valorPorParte * 100) / 100
      });
    }

    if (temContas) {
      itens.push({
        categoria: 'CONTAS',
        descricao: 'Contas',
        valor: Math.round(valorPorParte * 100) / 100
      });
    }

    if (temPessoal) {
      itens.push({
        categoria: 'PESSOAL',
        descricao: 'Pessoal',
        valor: Math.round(valorPorParte * 100) / 100
      });
    }

    // Calcular o resto para "Outros"
    const totalSugerido = itens.reduce((acc, item) => acc + item.valor, 0);
    const resto = valorTotal - totalSugerido;

    itens.push({
      categoria: 'OUTROS',
      descricao: 'Outros',
      valor: Math.round(resto * 100) / 100
    });
  } else {
    // Divisão padrão em 4 partes iguais
    const valorPorCategoria = valorTotal / 4;

    itens = [
      { categoria: 'ALUGUEL', descricao: 'Aluguel', valor: Math.round(valorPorCategoria * 100) / 100 },
      { categoria: 'CONTAS', descricao: 'Contas', valor: Math.round(valorPorCategoria * 100) / 100 },
      { categoria: 'PESSOAL', descricao: 'Pessoal', valor: Math.round(valorPorCategoria * 100) / 100 },
      { categoria: 'OUTROS', descricao: 'Outros', valor: Math.round(valorPorCategoria * 100) / 100 }
    ];

    // Ajustar último item para compensar arredondamentos
    const totalSugerido = itens.slice(0, 3).reduce((acc, item) => acc + item.valor, 0);
    itens[3].valor = Math.round((valorTotal - totalSugerido) * 100) / 100;
  }

  return itens;
};

/**
 * Gera observações automáticas ao consolidar detalhado → rápido
 */
export const gerarObservacoesConsolidacao = (itens: CustoItem[]): string => {
  const porCategoria = agruparPorCategoria(itens);

  const partes: string[] = [];

  Object.entries(porCategoria).forEach(([categoria, valor]) => {
    if (valor > 0) {
      const label = CATEGORIAS_CUSTO_SIMPLES_LABELS[categoria as CategoriaCustoSimples];
      partes.push(label.toLowerCase());
    }
  });

  if (partes.length === 0) {
    return `${itens.length} custos consolidados`;
  }

  if (partes.length === 1) {
    return `Custos de ${partes[0]}`;
  }

  if (partes.length === 2) {
    return `Custos de ${partes[0]} e ${partes[1]}`;
  }

  const ultimos = partes.slice(-2);
  const primeiros = partes.slice(0, -2);

  return `Custos de ${primeiros.join(', ')}, ${ultimos[0]} e ${ultimos[1]}`;
};

/**
 * Valida se soma de itens bate com total esperado
 */
export const validarSomaItens = (
  itens: CustoItemInput[],
  totalEsperado: number
): { valido: boolean; diferenca: number } => {
  const somaItens = itens.reduce((acc, item) => acc + item.valor, 0);
  const diferenca = Math.abs(somaItens - totalEsperado);

  // Tolerar diferença de até 0.01 (centavos) por causa de arredondamentos
  const valido = diferenca <= 0.01;

  return { valido, diferenca };
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================

/**
 * Valida se um valor é válido para custo
 */
export const validarValorCusto = (valor: number): { valido: boolean; erro?: string } => {
  if (isNaN(valor)) {
    return { valido: false, erro: 'Valor deve ser um número válido' };
  }

  if (valor <= 0) {
    return { valido: false, erro: 'Valor deve ser maior que zero' };
  }

  if (valor > 10000000) { // 10 milhões
    return { valido: false, erro: 'Valor parece muito alto. Verifique se está correto' };
  }

  return { valido: true };
};

/**
 * Valida descrição de custo
 */
export const validarDescricaoCusto = (descricao: string): { valido: boolean; erro?: string } => {
  const descricaoTrim = descricao.trim();

  if (descricaoTrim.length < 2) {
    return { valido: false, erro: 'Descrição deve ter pelo menos 2 caracteres' };
  }

  if (descricaoTrim.length > 100) {
    return { valido: false, erro: 'Descrição deve ter no máximo 100 caracteres' };
  }

  return { valido: true };
};

/**
 * Valida observações (opcional)
 */
export const validarObservacoes = (observacoes?: string): { valido: boolean; erro?: string } => {
  if (!observacoes || observacoes.trim().length === 0) {
    return { valido: true }; // Opcional, então vazio é válido
  }

  if (observacoes.length > 200) {
    return { valido: false, erro: 'Observações devem ter no máximo 200 caracteres' };
  }

  return { valido: true };
};

/**
 * Valida item de custo completo
 */
export const validarCustoItem = (item: CustoItemInput): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];

  const validacaoValor = validarValorCusto(item.valor);
  if (!validacaoValor.valido && validacaoValor.erro) {
    erros.push(validacaoValor.erro);
  }

  const validacaoDescricao = validarDescricaoCusto(item.descricao);
  if (!validacaoDescricao.valido && validacaoDescricao.erro) {
    erros.push(validacaoDescricao.erro);
  }

  if (!item.categoria) {
    erros.push('Categoria é obrigatória');
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

// ============================================================================
// HELPERS DE FORMATAÇÃO
// ============================================================================

/**
 * Formata valor em moeda brasileira
 */
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Formata percentual
 */
export const formatarPercentual = (valor: number, casasDecimais: number = 1): string => {
  return `${valor.toFixed(casasDecimais)}%`;
};

/**
 * Abrevia valor para gráficos (ex: 12450 -> "12.4k")
 */
export const abreviarValor = (valor: number): string => {
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1)}M`;
  }

  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}k`;
  }

  return valor.toFixed(0);
};

// ============================================================================
// HELPERS DE BUSCA/FILTRO
// ============================================================================

/**
 * Busca custo de um mês específico
 */
export const buscarCustoPorMes = (
  custos: CustoOperacional[],
  mesReferencia: string
): CustoOperacional | undefined => {
  return custos.find(c => c.mesReferencia === mesReferencia);
};

/**
 * Filtra custos por range de meses
 */
export const filtrarCustosPorRange = (
  custos: CustoOperacional[],
  mesInicio: string,
  mesFim: string
): CustoOperacional[] => {
  return custos.filter(c => c.mesReferencia >= mesInicio && c.mesReferencia <= mesFim);
};

/**
 * Ordena custos por mês (mais recente primeiro)
 */
export const ordenarCustosPorMes = (
  custos: CustoOperacional[],
  ordem: 'asc' | 'desc' = 'desc'
): CustoOperacional[] => {
  return [...custos].sort((a, b) => {
    if (ordem === 'desc') {
      return b.mesReferencia.localeCompare(a.mesReferencia);
    }
    return a.mesReferencia.localeCompare(b.mesReferencia);
  });
};
