import {
  ImportacaoVendas,
  VendaRegistrada,
  VendasSystemInfo,
  DashboardVendas
} from '@/types/analise-vendas';

// Função auxiliar para gerar ID único determinístico
const generateId = (seed: number) => `id-${seed.toString(36).padStart(7, '0')}`;

// Função para gerar data determinística dentro de um período
const seededDate = (start: Date, end: Date, seed: number) => {
  const seededRandom = (seed % 1000) / 1000; // Normalizar para 0-1
  return new Date(start.getTime() + seededRandom * (end.getTime() - start.getTime()));
};

// Mapeamento de produtos do cardápio para vendas
const produtosCardapio = [
  { id: '1', nome: 'Açaí Tradicional 300ml', preco: 15.90, custo: 3.10, sku: 'ACAI-TRAD-300' },
  { id: '2', nome: 'Açaí Tradicional 500ml', preco: 20.90, custo: 5.20, sku: 'ACAI-TRAD-500' },
  { id: '3', nome: 'Açaí Tradicional 700ml', preco: 25.90, custo: 7.30, sku: 'ACAI-TRAD-700' },
  { id: '4', nome: 'Açaí Banana com Granola', preco: 18.90, custo: 4.15, sku: 'ACAI-BAN-GRA' },
  { id: '5', nome: 'Açaí Energy', preco: 22.90, custo: 5.80, sku: 'ACAI-ENRG' },
  { id: '6', nome: 'Cupuaçu Premium Gourmet', preco: 17.90, custo: 3.40, sku: 'CUP-PREM-GOUR' },
  { id: '7', nome: 'Granola Artesanal (porção)', preco: 3.50, custo: 0.75, sku: 'GRN-ART-30G' },
  { id: '8', nome: 'Banana Fatiada (porção)', preco: 2.50, custo: 0.56, sku: 'BAN-FAT-80G' },
  { id: '9', nome: 'Morango Fatiado (porção)', preco: 4.50, custo: 1.20, sku: 'MOR-FAT-60G' },
  { id: '10', nome: 'Castanha-do-Pará (porção)', preco: 5.50, custo: 1.20, sku: 'CAS-PAR-15G' },
  { id: '11', nome: 'Calda de Chocolate Premium', preco: 3.90, custo: 0.89, sku: 'CAL-CHO-PREM' },
  { id: '12', nome: 'Mix de Frutas Vermelhas', preco: 6.50, custo: 1.45, sku: 'MIX-FRU-VER' },
  { id: '13', nome: 'Granola Premium', preco: 3.50, custo: 0.33, sku: 'GRA-PREM' },
  { id: '14', nome: 'Mel Natural', preco: 2.00, custo: 0.47, sku: 'MEL-NAT' },
  { id: '15', nome: 'Castanha-do-Pará', preco: 5.50, custo: 0.39, sku: 'CAS-PAR' },
  { id: '16', nome: 'Coco Ralado', preco: 3.00, custo: 0.50, sku: 'COC-RAL' },
];

// Importações realizadas
export const mockImportacoes: ImportacaoVendas[] = [
  {
    id: 'imp-001',
    nomeArquivo: 'vendas_janeiro_2024.csv',
    dataImportacao: new Date('2024-02-01T10:30:00'),
    periodoInicio: new Date('2024-01-01'),
    periodoFim: new Date('2024-01-31'),
    totalRegistros: 523,
    totalImportados: 520,
    totalDuplicados: 3,
    totalSemMatch: 5,
    status: 'concluido'
  },
  {
    id: 'imp-002',
    nomeArquivo: 'vendas_fevereiro_2024.csv',
    dataImportacao: new Date('2024-03-01T14:15:00'),
    periodoInicio: new Date('2024-02-01'),
    periodoFim: new Date('2024-02-29'),
    totalRegistros: 480,
    totalImportados: 478,
    totalDuplicados: 2,
    totalSemMatch: 3,
    status: 'concluido'
  },
  {
    id: 'imp-003',
    nomeArquivo: 'vendas_marco_2024.csv',
    dataImportacao: new Date('2024-04-01T09:00:00'),
    periodoInicio: new Date('2024-03-01'),
    periodoFim: new Date('2024-03-31'),
    totalRegistros: 565,
    totalImportados: 562,
    totalDuplicados: 3,
    totalSemMatch: 7,
    status: 'concluido'
  }
];

// Gerar vendas registradas
const gerarVendas = (): VendaRegistrada[] => {
  const vendas: VendaRegistrada[] = [];
  const vendedores = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'];

  // Janeiro 2024
  for (let i = 0; i < 520; i++) {
    const produto = produtosCardapio[i % produtosCardapio.length];
    const quantidade = (i % 3) + 1;

    // Aplicar variação de preço (simular divergências)
    let precoUnitarioVendido = produto.preco;
    const chance = (i % 100) / 100; // Determinístico baseado no índice

    if (chance < 0.1) {
      // 10% de chance de vender com desconto (divergência)
      const variation = 0.85 + ((i % 10) / 100); // 0.85 a 0.95
      precoUnitarioVendido = produto.preco * variation;
    } else if (chance < 0.12) {
      // 2% de chance de vender abaixo do custo (prejuízo)
      const variation = 0.9 + ((i % 10) / 100); // 0.9 a 1.0
      precoUnitarioVendido = produto.custo * variation;
    }

    const precoTotal = precoUnitarioVendido * quantidade;
    const custoTotal = produto.custo * quantidade;
    const lucroReal = precoTotal - custoTotal;
    const lucroEsperado = (produto.preco * quantidade) - custoTotal;
    const margemReal = (lucroReal / precoTotal) * 100;
    const margemEsperada = (lucroEsperado / (produto.preco * quantidade)) * 100;
    const divergenciaValor = precoUnitarioVendido - produto.preco;
    const divergenciaPercent = (divergenciaValor / produto.preco) * 100;

    let statusAnalise: 'ok' | 'divergencia' | 'prejuizo' = 'ok';
    if (margemReal < 0) statusAnalise = 'prejuizo';
    else if (Math.abs(divergenciaPercent) > 5) statusAnalise = 'divergencia';

    vendas.push({
      id: generateId(i),
      importacaoId: 'imp-001',
      vendaErpId: `ERP-JAN-${String(i + 1).padStart(4, '0')}`,
      dataVenda: seededDate(new Date('2024-01-01'), new Date('2024-01-31'), i),
      produtoErpId: produto.sku,
      produtoNome: produto.nome,
      quantidade,
      precoUnitarioVendido: Number(precoUnitarioVendido.toFixed(2)),
      precoTotalVendido: Number(precoTotal.toFixed(2)),
      itemCardapioId: produto.id,
      itemCardapioNome: produto.nome,
      statusMatch: 'matched',
      custoCalculado: Number(custoTotal.toFixed(2)),
      precoCardapio: produto.preco,
      lucroBrutoReal: Number(lucroReal.toFixed(2)),
      lucroBrutoEsperado: Number(lucroEsperado.toFixed(2)),
      margemReal: Number(margemReal.toFixed(2)),
      margemEsperada: Number(margemEsperada.toFixed(2)),
      divergenciaValor: Number(divergenciaValor.toFixed(2)),
      divergenciaPercentual: Number(divergenciaPercent.toFixed(2)),
      statusAnalise,
      vendedor: vendedores[i % vendedores.length]
    });
  }

  // Fevereiro 2024
  for (let i = 0; i < 478; i++) {
    const produto = produtosCardapio[i % produtosCardapio.length];
    const quantidade = (i % 3) + 1;

    let precoUnitarioVendido = produto.preco;
    const chance = (i % 100) / 100;

    if (chance < 0.08) {
      const variation = 0.87 + ((i % 10) / 100);
      precoUnitarioVendido = produto.preco * variation;
    } else if (chance < 0.09) {
      const variation = 0.95 + ((i % 5) / 100);
      precoUnitarioVendido = produto.custo * variation;
    }

    const precoTotal = precoUnitarioVendido * quantidade;
    const custoTotal = produto.custo * quantidade;
    const lucroReal = precoTotal - custoTotal;
    const lucroEsperado = (produto.preco * quantidade) - custoTotal;
    const margemReal = (lucroReal / precoTotal) * 100;
    const margemEsperada = (lucroEsperado / (produto.preco * quantidade)) * 100;
    const divergenciaValor = precoUnitarioVendido - produto.preco;
    const divergenciaPercent = (divergenciaValor / produto.preco) * 100;

    let statusAnalise: 'ok' | 'divergencia' | 'prejuizo' = 'ok';
    if (margemReal < 0) statusAnalise = 'prejuizo';
    else if (Math.abs(divergenciaPercent) > 5) statusAnalise = 'divergencia';

    vendas.push({
      id: generateId(i + 520),
      importacaoId: 'imp-002',
      vendaErpId: `ERP-FEV-${String(i + 1).padStart(4, '0')}`,
      dataVenda: seededDate(new Date('2024-02-01'), new Date('2024-02-29'), i + 520),
      produtoErpId: produto.sku,
      produtoNome: produto.nome,
      quantidade,
      precoUnitarioVendido: Number(precoUnitarioVendido.toFixed(2)),
      precoTotalVendido: Number(precoTotal.toFixed(2)),
      itemCardapioId: produto.id,
      itemCardapioNome: produto.nome,
      statusMatch: 'matched',
      custoCalculado: Number(custoTotal.toFixed(2)),
      precoCardapio: produto.preco,
      lucroBrutoReal: Number(lucroReal.toFixed(2)),
      lucroBrutoEsperado: Number(lucroEsperado.toFixed(2)),
      margemReal: Number(margemReal.toFixed(2)),
      margemEsperada: Number(margemEsperada.toFixed(2)),
      divergenciaValor: Number(divergenciaValor.toFixed(2)),
      divergenciaPercentual: Number(divergenciaPercent.toFixed(2)),
      statusAnalise,
      vendedor: vendedores[i % vendedores.length]
    });
  }

  // Março 2024
  for (let i = 0; i < 562; i++) {
    const produto = produtosCardapio[i % produtosCardapio.length];
    const quantidade = (i % 3) + 1;

    let precoUnitarioVendido = produto.preco;
    const chance = (i % 100) / 100;

    if (chance < 0.12) {
      const variation = 0.85 + ((i % 12) / 100);
      precoUnitarioVendido = produto.preco * variation;
    } else if (chance < 0.15) {
      const variation = 0.92 + ((i % 8) / 100);
      precoUnitarioVendido = produto.custo * variation;
    }

    const precoTotal = precoUnitarioVendido * quantidade;
    const custoTotal = produto.custo * quantidade;
    const lucroReal = precoTotal - custoTotal;
    const lucroEsperado = (produto.preco * quantidade) - custoTotal;
    const margemReal = (lucroReal / precoTotal) * 100;
    const margemEsperada = (lucroEsperado / (produto.preco * quantidade)) * 100;
    const divergenciaValor = precoUnitarioVendido - produto.preco;
    const divergenciaPercent = (divergenciaValor / produto.preco) * 100;

    let statusAnalise: 'ok' | 'divergencia' | 'prejuizo' = 'ok';
    if (margemReal < 0) statusAnalise = 'prejuizo';
    else if (Math.abs(divergenciaPercent) > 5) statusAnalise = 'divergencia';

    vendas.push({
      id: generateId(i + 998),
      importacaoId: 'imp-003',
      vendaErpId: `ERP-MAR-${String(i + 1).padStart(4, '0')}`,
      dataVenda: seededDate(new Date('2024-03-01'), new Date('2024-03-31'), i + 998),
      produtoErpId: produto.sku,
      produtoNome: produto.nome,
      quantidade,
      precoUnitarioVendido: Number(precoUnitarioVendido.toFixed(2)),
      precoTotalVendido: Number(precoTotal.toFixed(2)),
      itemCardapioId: produto.id,
      itemCardapioNome: produto.nome,
      statusMatch: 'matched',
      custoCalculado: Number(custoTotal.toFixed(2)),
      precoCardapio: produto.preco,
      lucroBrutoReal: Number(lucroReal.toFixed(2)),
      lucroBrutoEsperado: Number(lucroEsperado.toFixed(2)),
      margemReal: Number(margemReal.toFixed(2)),
      margemEsperada: Number(margemEsperada.toFixed(2)),
      divergenciaValor: Number(divergenciaValor.toFixed(2)),
      divergenciaPercentual: Number(divergenciaPercent.toFixed(2)),
      statusAnalise,
      vendedor: vendedores[i % vendedores.length]
    });
  }

  // Adicionar algumas vendas sem match
  for (let i = 0; i < 15; i++) {
    const quantidade = (i % 3) + 1;
    const precoUnitario = 10 + (i % 20);
    vendas.push({
      id: generateId(i + 1560),
      importacaoId: mockImportacoes[i % 3].id,
      vendaErpId: `ERP-UNK-${String(i + 1).padStart(4, '0')}`,
      dataVenda: seededDate(new Date('2024-01-01'), new Date('2024-03-31'), i + 1560),
      produtoErpId: `PROD-DESCONHECIDO-${i + 1}`,
      produtoNome: `Produto Não Mapeado ${i + 1}`,
      quantidade,
      precoUnitarioVendido: precoUnitario,
      precoTotalVendido: precoUnitario * quantidade,
      statusMatch: 'not_found',
      custoCalculado: 0,
      precoCardapio: 0,
      lucroBrutoReal: 0,
      lucroBrutoEsperado: 0,
      margemReal: 0,
      margemEsperada: 0,
      divergenciaValor: 0,
      divergenciaPercentual: 0,
      statusAnalise: 'divergencia',
      vendedor: vendedores[i % vendedores.length]
    });
  }

  return vendas.sort((a, b) => a.dataVenda.getTime() - b.dataVenda.getTime());
};

export const mockVendasRegistradas = gerarVendas();

// Calcular system info
export const mockVendasSystemInfo: VendasSystemInfo = {
  primeiraVenda: new Date('2024-01-01'),
  ultimaVenda: new Date('2024-03-31'),
  ultimaImportacao: new Date('2024-04-01T09:00:00'),
  totalVendasRegistradas: mockVendasRegistradas.length,
  totalProdutosDiferentes: [...new Set(mockVendasRegistradas.map(v => v.produtoNome))].length,
  totalImportacoes: mockImportacoes.length
};

// Calcular dashboard data
const calcularDashboard = (): DashboardVendas => {
  const vendas = mockVendasRegistradas.filter(v => v.statusMatch === 'matched');

  const faturamentoReal = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
  const faturamentoEsperado = vendas.reduce((acc, v) => acc + (v.precoCardapio * v.quantidade), 0);
  const lucroBrutoReal = vendas.reduce((acc, v) => acc + v.lucroBrutoReal, 0);
  const lucroBrutoEsperado = vendas.reduce((acc, v) => acc + v.lucroBrutoEsperado, 0);

  const margemMediaReal = faturamentoReal > 0 ? (lucroBrutoReal / faturamentoReal) * 100 : 0;
  const margemMediaEsperada = faturamentoEsperado > 0 ? (lucroBrutoEsperado / faturamentoEsperado) * 100 : 0;

  const totalDivergencias = vendas.filter(v => v.statusAnalise === 'divergencia').length;
  const totalPrejuizos = vendas.filter(v => v.statusAnalise === 'prejuizo').length;

  // Produto mais vendido
  const produtosMaisVendidos = vendas.reduce((acc, v) => {
    if (!acc[v.produtoNome]) {
      acc[v.produtoNome] = { quantidade: 0, valor: 0 };
    }
    acc[v.produtoNome].quantidade += v.quantidade;
    acc[v.produtoNome].valor += v.precoTotalVendido;
    return acc;
  }, {} as Record<string, { quantidade: number; valor: number }>);

  const topProduto = Object.entries(produtosMaisVendidos)
    .sort((a, b) => b[1].valor - a[1].valor)[0];

  return {
    faturamentoReal: Number(faturamentoReal.toFixed(2)),
    faturamentoEsperado: Number(faturamentoEsperado.toFixed(2)),
    lucroBrutoReal: Number(lucroBrutoReal.toFixed(2)),
    lucroBrutoEsperado: Number(lucroBrutoEsperado.toFixed(2)),
    margemMediaReal: Number(margemMediaReal.toFixed(2)),
    margemMediaEsperada: Number(margemMediaEsperada.toFixed(2)),
    totalDivergencias,
    totalPrejuizos,
    produtoMaisVendido: {
      nome: topProduto[0],
      quantidade: topProduto[1].quantidade,
      valor: topProduto[1].valor
    },
    periodoAnalisado: {
      inicio: new Date('2024-01-01'),
      fim: new Date('2024-03-31')
    }
  };
};

export const mockDashboardVendas = calcularDashboard();

// Dados para preview de importação
export const mockArquivoPreview = [
  {
    data: '2024-04-01',
    produto: 'Açaí Tradicional 300ml',
    produto_id: 'ACAI-TRAD-300',
    quantidade: '2',
    valor: '31.80',
    vendedor: 'João Silva'
  },
  {
    data: '2024-04-01',
    produto: 'Granola Premium',
    produto_id: 'GRA-PREM',
    quantidade: '1',
    valor: '3.50',
    vendedor: 'Maria Santos'
  },
  {
    data: '2024-04-02',
    produto: 'Açaí Energy',
    produto_id: 'ACAI-ENRG',
    quantidade: '1',
    valor: '22.90',
    vendedor: 'Pedro Costa'
  },
  {
    data: '2024-04-02',
    produto: 'Mix de Frutas Vermelhas',
    produto_id: 'MIX-FRU-VER',
    quantidade: '2',
    valor: '13.00',
    vendedor: 'Ana Lima'
  },
  {
    data: '2024-04-03',
    produto: 'Produto Novo XYZ',
    produto_id: 'PROD-XYZ',
    quantidade: '1',
    valor: '15.00',
    vendedor: 'João Silva'
  }
];