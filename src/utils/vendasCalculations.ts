import { VendaRegistrada, StatusVenda } from '../types/analise-vendas';

export const calcularDivergencia = (
  precoVendido: number,
  precoCardapio: number
): { valor: number; percentual: number } => {
  const valor = precoVendido - precoCardapio;
  const percentual = precoCardapio > 0
    ? ((valor / precoCardapio) * 100)
    : 0;

  return {
    valor: Number(valor.toFixed(2)),
    percentual: Number(percentual.toFixed(2))
  };
};

export const calcularLucro = (
  precoVendido: number,
  custo: number
): { lucroBruto: number; margem: number } => {
  const lucroBruto = precoVendido - custo;
  const margem = precoVendido > 0
    ? ((lucroBruto / precoVendido) * 100)
    : 0;

  return {
    lucroBruto: Number(lucroBruto.toFixed(2)),
    margem: Number(margem.toFixed(2))
  };
};

export const LIMITE_DIVERGENCIA_LEVE = 5;
export const LIMITE_DIVERGENCIA_GRAVE = 15;

export const classificarVenda = (
  divergenciaPercent: number,
  margem: number
): StatusVenda => {
  if (margem < 0) return 'prejuizo';
  const absoluto = Math.abs(divergenciaPercent);
  if (absoluto > LIMITE_DIVERGENCIA_LEVE) return 'divergencia';
  return 'ok';
};

// Granular classification — exposes the leve/grave distinction for UI badges/charts.
export type DivergenciaSeveridade = 'ok' | 'leve' | 'grave';

export const classificarSeveridadeDivergencia = (
  divergenciaPercent: number
): DivergenciaSeveridade => {
  const absoluto = Math.abs(divergenciaPercent);
  if (absoluto > LIMITE_DIVERGENCIA_GRAVE) return 'grave';
  if (absoluto > LIMITE_DIVERGENCIA_LEVE) return 'leve';
  return 'ok';
};

export const validarDuplicacao = (
  vendaErpId: string,
  vendasExistentes: VendaRegistrada[]
): boolean => {
  return vendasExistentes.some(v => v.vendaErpId === vendaErpId);
};

export const calcularEstatisticasVendas = (vendas: VendaRegistrada[]) => {
  if (vendas.length === 0) {
    return {
      faturamentoReal: 0,
      faturamentoEsperado: 0,
      lucroBrutoReal: 0,
      lucroBrutoEsperado: 0,
      margemMediaReal: 0,
      margemMediaEsperada: 0,
      totalDivergencias: 0,
      totalPrejuizos: 0
    };
  }

  const faturamentoReal = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
  const faturamentoEsperado = vendas.reduce((acc, v) => acc + (v.precoCardapio * v.quantidade), 0);
  const lucroBrutoReal = vendas.reduce((acc, v) => acc + v.lucroBrutoReal, 0);
  const lucroBrutoEsperado = vendas.reduce((acc, v) => acc + v.lucroBrutoEsperado, 0);

  const margemMediaReal = faturamentoReal > 0
    ? (lucroBrutoReal / faturamentoReal) * 100
    : 0;

  const margemMediaEsperada = faturamentoEsperado > 0
    ? (lucroBrutoEsperado / faturamentoEsperado) * 100
    : 0;

  const totalDivergencias = vendas.filter(v => v.statusAnalise === 'divergencia').length;
  const totalPrejuizos = vendas.filter(v => v.statusAnalise === 'prejuizo').length;

  return {
    faturamentoReal: Number(faturamentoReal.toFixed(2)),
    faturamentoEsperado: Number(faturamentoEsperado.toFixed(2)),
    lucroBrutoReal: Number(lucroBrutoReal.toFixed(2)),
    lucroBrutoEsperado: Number(lucroBrutoEsperado.toFixed(2)),
    margemMediaReal: Number(margemMediaReal.toFixed(2)),
    margemMediaEsperada: Number(margemMediaEsperada.toFixed(2)),
    totalDivergencias,
    totalPrejuizos
  };
};

export const agruparVendasPorProduto = (vendas: VendaRegistrada[]) => {
  const agrupado = vendas.reduce((acc, venda) => {
    const key = venda.itemCardapioId || venda.produtoNome;
    if (!acc[key]) {
      acc[key] = {
        nome: venda.itemCardapioNome || venda.produtoNome,
        quantidade: 0,
        valorTotal: 0,
        custoTotal: 0,
        divergenciaTotal: 0,
        ocorrencias: 0
      };
    }

    acc[key].quantidade += venda.quantidade;
    acc[key].valorTotal += venda.precoTotalVendido;
    acc[key].custoTotal += venda.custoCalculado;
    acc[key].divergenciaTotal += venda.divergenciaValor;
    acc[key].ocorrencias += 1;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(agrupado).sort((a, b) => b.valorTotal - a.valorTotal);
};

export const calcularTendencia = (vendas: VendaRegistrada[], periodo: 'dia' | 'semana' | 'mes' = 'dia') => {
  const agrupado = vendas.reduce((acc, venda) => {
    const data = new Date(venda.dataVenda);
    let key: string;

    switch (periodo) {
      case 'dia':
        key = data.toISOString().split('T')[0];
        break;
      case 'semana': {
        const semana = Math.floor((data.getDate() - 1) / 7) + 1;
        key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-S${semana}`;
        break;
      }
      case 'mes':
        key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!acc[key]) {
      acc[key] = {
        periodo: key,
        vendas: 0,
        valor: 0,
        lucro: 0,
        margem: 0
      };
    }

    acc[key].vendas += 1;
    acc[key].valor += venda.precoTotalVendido;
    acc[key].lucro += venda.lucroBrutoReal;

    return acc;
  }, {} as Record<string, any>);

  // Calcular margem média para cada período
  Object.values(agrupado).forEach((periodo: any) => {
    periodo.margem = periodo.valor > 0
      ? (periodo.lucro / periodo.valor) * 100
      : 0;
    periodo.margem = Number(periodo.margem.toFixed(2));
    periodo.valor = Number(periodo.valor.toFixed(2));
    periodo.lucro = Number(periodo.lucro.toFixed(2));
  });

  return Object.values(agrupado).sort((a: any, b: any) => a.periodo.localeCompare(b.periodo));
};

export const identificarProdutosSemMatch = (vendas: VendaRegistrada[]) => {
  const semMatch = vendas.filter(v => v.statusMatch === 'not_found');

  const agrupado = semMatch.reduce((acc, venda) => {
    if (!acc[venda.produtoErpId]) {
      acc[venda.produtoErpId] = {
        produtoErpId: venda.produtoErpId,
        produtoNome: venda.produtoNome,
        ocorrencias: 0,
        valorTotal: 0
      };
    }

    acc[venda.produtoErpId].ocorrencias += 1;
    acc[venda.produtoErpId].valorTotal += venda.precoTotalVendido;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(agrupado).sort((a, b) => b.ocorrencias - a.ocorrencias);
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarPercentual = (valor: number): string => {
  if (!Number.isFinite(valor)) return '0,0%';
  return `${valor.toFixed(1).replace('.', ',')}%`;
};

export const formatarData = (data: Date | string): string => {
  const d = typeof data === 'string' ? new Date(data) : data;
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = (d.getMonth() + 1).toString().padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

export const formatarDataHora = (data: Date | string): string => {
  const d = typeof data === 'string' ? new Date(data) : data;
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = (d.getMonth() + 1).toString().padStart(2, '0');
  const ano = d.getFullYear();
  const hora = d.getHours().toString().padStart(2, '0');
  const minuto = d.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
};

export const calcularHashArquivo = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const validarArquivoVendas = (file: File): { valido: boolean; erro?: string } => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const VALID_TYPES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (file.size > MAX_SIZE) {
    return { valido: false, erro: 'Arquivo muito grande. Máximo permitido: 5MB' };
  }

  if (!VALID_TYPES.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
    return { valido: false, erro: 'Formato de arquivo inválido. Use CSV, XLS ou XLSX' };
  }

  return { valido: true };
};

export const parseCSV = (text: string, delimiter: string = ','): any[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    data.push(row);
  }

  return data;
};

export const detectarColunasVendas = (data: any[]): {
  colunas: Record<string, string>;
  valido: boolean;
  erros: string[];
} => {
  if (!data || data.length === 0) {
    return { colunas: {}, valido: false, erros: ['Arquivo vazio'] };
  }

  const primeiraLinha = data[0];
  const colunas: Record<string, string> = {};
  const erros: string[] = [];

  // Mapear colunas conhecidas
  const mapeamentos = {
    data: ['data', 'date', 'data_venda', 'dt_venda', 'sale_date'],
    produto: ['produto', 'product', 'item', 'nome_produto', 'product_name'],
    produtoId: ['id', 'sku', 'codigo', 'product_id', 'codigo_produto'],
    quantidade: ['quantidade', 'quantity', 'qtd', 'qty'],
    valor: ['valor', 'value', 'preco', 'price', 'total', 'valor_total'],
    vendedor: ['vendedor', 'seller', 'funcionario', 'employee']
  };

  Object.entries(mapeamentos).forEach(([campo, variacoes]) => {
    const colunaEncontrada = Object.keys(primeiraLinha).find(col =>
      variacoes.some(v => col.toLowerCase().includes(v))
    );

    if (colunaEncontrada) {
      colunas[campo] = colunaEncontrada;
    } else if (['data', 'produto', 'quantidade', 'valor'].includes(campo)) {
      erros.push(`Coluna obrigatória não encontrada: ${campo}`);
    }
  });

  return {
    colunas,
    valido: erros.length === 0,
    erros
  };
};