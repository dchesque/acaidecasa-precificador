import {
  PeriodoImportacao,
  PeriodoMes,
  StatusPeriodo,
  ValidacaoPeriodo
} from '@/types/periodo';
import { CustoOperacional } from '@/types/custos-operacionais';
import { VendaRegistrada } from '@/types/analise-vendas';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Gera os últimos 12 meses a partir do mês atual
 */
export const gerarUltimos12Meses = (): PeriodoMes[] => {
  const meses: PeriodoMes[] = [];
  const hoje = new Date();

  for (let i = 11; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = data.getFullYear();
    const mes = data.getMonth();

    const proximoMes = new Date(ano, mes + 1, 0);
    const diasTotais = proximoMes.getDate();

    meses.push({
      mesReferencia: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      ano,
      mes: mes + 1,
      nome: MESES[mes],
      nomeCompleto: `${MESES[mes]}/${ano}`,
      dataInicio: new Date(ano, mes, 1),
      dataFim: new Date(ano, mes, diasTotais, 23, 59, 59),
      diasTotais
    });
  }

  return meses;
};

/**
 * Cria um período de importação baseado em um mês específico
 */
export const criarPeriodoMesCompleto = (mesReferencia: string): PeriodoImportacao => {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const dataInicio = new Date(ano, mes - 1, 1);
  const diasTotais = new Date(ano, mes, 0).getDate();
  const dataFim = new Date(ano, mes - 1, diasTotais, 23, 59, 59);

  return {
    tipo: 'MES_COMPLETO',
    mesReferencia,
    ano,
    mes,
    dataInicio,
    dataFim,
    status: 'EM_ANDAMENTO',
    diasTotais,
    diasImportados: 0
  };
};

/**
 * Cria um período customizado
 */
export const criarPeriodoCustomizado = (dataInicio: Date, dataFim: Date): PeriodoImportacao => {
  const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
  const diasTotais = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const mesInicio = dataInicio.getMonth() + 1;
  const anoInicio = dataInicio.getFullYear();
  const mesReferencia = `${anoInicio}-${String(mesInicio).padStart(2, '0')}`;

  return {
    tipo: 'PERIODO_CUSTOM',
    mesReferencia,
    ano: anoInicio,
    mes: mesInicio,
    dataInicio,
    dataFim,
    status: 'EM_ANDAMENTO',
    diasTotais,
    diasImportados: 0
  };
};

/**
 * Valida se duas datas estão dentro do período
 */
export const dataEstaNoPeriodo = (data: Date, periodo: PeriodoImportacao): boolean => {
  return data >= periodo.dataInicio && data <= periodo.dataFim;
};

/**
 * Calcula quantos dias únicos existem nas vendas de um período
 */
export const calcularDiasComVendas = (vendas: VendaRegistrada[], periodo: PeriodoImportacao): number => {
  const diasUnicos = new Set(
    vendas
      .filter(venda => dataEstaNoPeriodo(venda.dataVenda, periodo))
      .map(venda => venda.dataVenda.toDateString())
  );

  return diasUnicos.size;
};

/**
 * Valida a consistência entre períodos de vendas e custos
 */
export const validarConsistenciaPeriodo = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[],
  periodoVendas: PeriodoImportacao,
  periodoCustos?: PeriodoImportacao
): ValidacaoPeriodo => {
  const inconsistencias: string[] = [];
  const avisos: string[] = [];
  const sugestoes: string[] = [];

  // Se não há período de custos definido
  if (!periodoCustos) {
    avisos.push('Período de custos não definido');
    sugestoes.push('Defina um período de custos operacionais para análise completa');
  }

  // Verifica se os períodos coincidem
  if (periodoCustos && periodoVendas.mesReferencia !== periodoCustos.mesReferencia) {
    inconsistencias.push('Períodos de vendas e custos não coincidem');
    sugestoes.push(`Use o mesmo período (${periodoVendas.mesReferencia}) para vendas e custos`);
  }

  // Verifica se há dados suficientes
  const diasComVendas = calcularDiasComVendas(vendas, periodoVendas);
  if (diasComVendas < periodoVendas.diasTotais * 0.5) {
    avisos.push('Dados de vendas incompletos para o período');
  }

  // Verifica categorias de custos
  if (periodoCustos) {
    const custosNoPeriodo = custos.filter(custo =>
      custo.periodoImportacao.mesReferencia === periodoCustos.mesReferencia
    );

    if (custosNoPeriodo.length === 0) {
      avisos.push('Nenhum custo operacional registrado para o período');
      sugestoes.push('Adicione custos operacionais para análise de margem precisa');
    }

    const categoriasEssenciais = ['ALUGUEL', 'ENERGIA', 'AGUA', 'SALARIOS'];
    const categoriasPresentes = [...new Set(custosNoPeriodo.map(c => c.categoria))];
    const categoriasFaltantes = categoriasEssenciais.filter(cat =>
      !categoriasPresentes.includes(cat as any)
    );

    if (categoriasFaltantes.length > 0) {
      avisos.push(`Categorias de custos faltantes: ${categoriasFaltantes.join(', ')}`);
    }
  }

  let nivel: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS';
  if (inconsistencias.length > 0) nivel = 'ERROR';
  else if (avisos.length > 0) nivel = 'WARNING';

  return {
    valido: inconsistencias.length === 0,
    inconsistencias,
    avisos,
    sugestoes,
    nivel
  };
};

/**
 * Obtém o status de um período específico
 */
export const obterStatusPeriodo = (
  periodo: string,
  vendas: VendaRegistrada[],
  custos: CustoOperacional[]
): StatusPeriodo => {
  const vendasDoPeriodo = vendas.filter(venda => {
    const mesVenda = `${venda.dataVenda.getFullYear()}-${String(venda.dataVenda.getMonth() + 1).padStart(2, '0')}`;
    return mesVenda === periodo;
  });

  const custosDoPeriodo = custos.filter(custo =>
    custo.periodoImportacao && custo.periodoImportacao.mesReferencia === periodo
  );

  const [ano, mes] = periodo.split('-').map(Number);
  const totalDias = new Date(ano, mes, 0).getDate();
  const diasVendas = calcularDiasComVendas(vendasDoPeriodo, criarPeriodoMesCompleto(periodo));

  const categoriasComCustos = [...new Set(custosDoPeriodo.map(c => c.categoria))];
  const totalCategorias = 8; // Total de categorias possíveis

  let vendasStatus: 'COMPLETO' | 'PARCIAL' | 'VAZIO' = 'VAZIO';
  if (diasVendas > 0) {
    vendasStatus = diasVendas >= totalDias * 0.8 ? 'COMPLETO' : 'PARCIAL';
  }

  let custosStatus: 'COMPLETO' | 'PARCIAL' | 'VAZIO' = 'VAZIO';
  if (categoriasComCustos.length > 0) {
    custosStatus = categoriasComCustos.length >= 4 ? 'COMPLETO' : 'PARCIAL';
  }

  return {
    periodo,
    possuiVendas: vendasDoPeriodo.length > 0,
    possuiCustos: custosDoPeriodo.length > 0,
    vendasStatus,
    custosStatus,
    consistente: vendasStatus !== 'VAZIO' && custosStatus !== 'VAZIO',
    diasVendas,
    totalDias,
    categoriasComCustos,
    totalCategorias
  };
};

/**
 * Formata período para exibição
 */
export const formatarPeriodoDisplay = (periodo: PeriodoImportacao): string => {
  if (periodo.tipo === 'MES_COMPLETO') {
    const mes = MESES[periodo.mes - 1];
    return `${mes}/${periodo.ano}`;
  }

  if (periodo.tipo === 'PERIODO_CUSTOM') {
    const inicio = periodo.dataInicio.toLocaleDateString('pt-BR');
    const fim = periodo.dataFim.toLocaleDateString('pt-BR');
    return `${inicio} - ${fim}`;
  }

  return periodo.mesReferencia;
};

/**
 * Verifica se um período está no passado, presente ou futuro
 */
export const classificarPeriodo = (periodo: PeriodoImportacao): 'PASSADO' | 'PRESENTE' | 'FUTURO' => {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  if (periodo.dataFim < inicioHoje) return 'PASSADO';
  if (periodo.dataInicio > fimHoje) return 'FUTURO';
  return 'PRESENTE';
};

/**
 * Gera sugestões de período baseado em dados existentes
 */
export const sugerirMelhorPeriodo = (
  vendas: VendaRegistrada[],
  custos: CustoOperacional[]
): PeriodoImportacao => {
  if (vendas.length === 0) {
    // Se não há vendas, sugere o mês passado
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);
    const mesRef = `${mesPassado.getFullYear()}-${String(mesPassado.getMonth() + 1).padStart(2, '0')}`;
    return criarPeriodoMesCompleto(mesRef);
  }

  // Encontra o mês com mais vendas recente
  const vendasPorMes = vendas.reduce((acc, venda) => {
    const mesRef = `${venda.dataVenda.getFullYear()}-${String(venda.dataVenda.getMonth() + 1).padStart(2, '0')}`;
    acc[mesRef] = (acc[mesRef] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mesesOrdenados = Object.entries(vendasPorMes)
    .sort(([a], [b]) => b.localeCompare(a)) // Mais recente primeiro
    .sort(([, a], [, b]) => b - a); // Mais vendas primeiro

  const melhorMes = mesesOrdenados[0]?.[0];

  if (melhorMes) {
    return criarPeriodoMesCompleto(melhorMes);
  }

  // Fallback para mês atual
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  return criarPeriodoMesCompleto(mesAtual);
};