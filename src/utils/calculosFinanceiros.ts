export const calcularLucroLiquido = (
  lucroBruto: number,
  custoOperacional: number
): number => {
  return lucroBruto - custoOperacional;
};

export const calcularMargemLiquida = (
  lucroLiquido: number,
  receita: number
): number => {
  if (receita <= 0) return 0;
  return (lucroLiquido / receita) * 100;
};

export const calcularPontoEquilibrio = (
  custoOperacional: number,
  margemBrutaMedia: number
): number => {
  if (margemBrutaMedia <= 0) return 0;
  return custoOperacional / (margemBrutaMedia / 100);
};

export const calcularTaxaAbsorcao = (
  custoOperacional: number,
  receita: number
): number => {
  if (receita <= 0) return 0;
  return (custoOperacional / receita) * 100;
};

export const calcularTicketMedioNecessario = (
  custoOperacional: number,
  margemBrutaMedia: number,
  quantidadeVendasMedio: number
): number => {
  if (margemBrutaMedia <= 0 || quantidadeVendasMedio <= 0) return 0;
  const receitaNecessaria = custoOperacional / (margemBrutaMedia / 100);
  return receitaNecessaria / quantidadeVendasMedio;
};

export const calcularVariacaoPercentual = (
  valorAtual: number,
  valorAnterior: number
): number => {
  if (valorAnterior === 0) return valorAtual > 0 ? 100 : 0;
  return ((valorAtual - valorAnterior) / valorAnterior) * 100;
};

export const calcularMediaMovel = (
  valores: number[],
  janela: number = 3
): number[] => {
  if (valores.length < janela) return valores;

  const medias: number[] = [];
  for (let i = janela - 1; i < valores.length; i++) {
    const slice = valores.slice(i - janela + 1, i + 1);
    const media = slice.reduce((sum, val) => sum + val, 0) / janela;
    medias.push(media);
  }

  return medias;
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarPercentual = (valor: number, casasDecimais: number = 1): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(valor / 100);
};

export const formatarNumero = (valor: number, casasDecimais: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(valor);
};

export const obterNomeMes = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || '';
};

export const obterNomeMesAbreviado = (mes: number): string => {
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return meses[mes - 1] || '';
};

export const gerarCoresGrafico = (quantidade: number): string[] => {
  const coresBase = [
    '#8B5CF6', // purple-500
    '#06B6D4', // cyan-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#6366F1', // indigo-500
    '#EC4899', // pink-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#8B5A2B', // brown-500
  ];

  if (quantidade <= coresBase.length) {
    return coresBase.slice(0, quantidade);
  }

  // Se precisar de mais cores, gerar tons variados
  const cores: string[] = [...coresBase];
  const coresExtras = quantidade - coresBase.length;

  for (let i = 0; i < coresExtras; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    cores.push(`hsl(${hue}, 70%, 60%)`);
  }

  return cores;
};

export const calcularMediaPonderada = (
  valores: Array<{ valor: number; peso: number }>
): number => {
  if (valores.length === 0) return 0;

  const somaPonderada = valores.reduce((sum, item) => sum + (item.valor * item.peso), 0);
  const somaPesos = valores.reduce((sum, item) => sum + item.peso, 0);

  if (somaPesos === 0) return 0;
  return somaPonderada / somaPesos;
};

export const determinarTendencia = (valores: number[]): 'crescimento' | 'queda' | 'estavel' => {
  if (valores.length < 2) return 'estavel';

  const metadeInicial = valores.slice(0, Math.ceil(valores.length / 2));
  const metadeFinal = valores.slice(Math.floor(valores.length / 2));

  const mediaInicial = metadeInicial.reduce((sum, val) => sum + val, 0) / metadeInicial.length;
  const mediaFinal = metadeFinal.reduce((sum, val) => sum + val, 0) / metadeFinal.length;

  const diferenca = ((mediaFinal - mediaInicial) / mediaInicial) * 100;

  if (diferenca > 5) return 'crescimento';
  if (diferenca < -5) return 'queda';
  return 'estavel';
};

export const calcularProjecao = (
  valoresHistoricos: number[],
  periodosProjetados: number = 1
): number[] => {
  if (valoresHistoricos.length < 2) {
    return Array(periodosProjetados).fill(valoresHistoricos[0] || 0);
  }

  // Calcular tendência linear simples
  const n = valoresHistoricos.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = valoresHistoricos;

  const somaX = x.reduce((sum, val) => sum + val, 0);
  const somaY = y.reduce((sum, val) => sum + val, 0);
  const somaXY = x.reduce((sum, val, i) => sum + (val * y[i]), 0);
  const somaX2 = x.reduce((sum, val) => sum + (val * val), 0);

  const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
  const intercepto = (somaY - inclinacao * somaX) / n;

  const projecoes: number[] = [];
  for (let i = 1; i <= periodosProjetados; i++) {
    const valorProjetado = intercepto + inclinacao * (n + i);
    projecoes.push(Math.max(0, valorProjetado)); // Não permitir valores negativos
  }

  return projecoes;
};

export const identificarOutliers = (valores: number[]): number[] => {
  if (valores.length < 4) return [];

  const sorted = [...valores].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return valores.filter(valor => valor < lowerBound || valor > upperBound);
};

export const calcularCoeficienteVariacao = (valores: number[]): number => {
  if (valores.length === 0) return 0;

  const media = valores.reduce((sum, val) => sum + val, 0) / valores.length;
  if (media === 0) return 0;

  const variancia = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
  const desvioPadrao = Math.sqrt(variancia);

  return (desvioPadrao / media) * 100;
};