import {
  ImportacaoVendas,
  VendaRegistrada,
  VendasSystemInfo,
  DashboardVendas,
  FiltrosVendas,
  ProdutoSemMatch,
  ResumoImportacao
} from '@/types/analise-vendas';
import { ItemCardapio } from '@/types/database';
import {
  calcularDivergencia,
  calcularLucro,
  classificarVenda,
  validarDuplicacao,
  calcularEstatisticasVendas,
  parseCSV,
  detectarColunasVendas,
  calcularHashArquivo
} from '@/utils/vendasCalculations';

// Service class para análise de vendas
export class AnaliseVendasService {
  private supabaseEnabled: boolean = false;

  constructor() {
    // Verificar se Supabase está configurado
    this.checkSupabaseConfig();
  }

  private checkSupabaseConfig() {
    // TODO: Verificar se as variáveis de ambiente do Supabase estão configuradas
    // this.supabaseEnabled = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseEnabled = false; // Por enquanto usar mock
  }

  // Processar arquivo de vendas
  async processarArquivoVendas(
    file: File,
    cardapio: ItemCardapio[],
    vendasExistentes: VendaRegistrada[]
  ): Promise<ResumoImportacao> {
    const fileContent = await this.lerArquivo(file);
    const data = this.parseData(file.name, fileContent);

    // Detectar colunas
    const { colunas, valido, erros } = detectarColunasVendas(data);
    if (!valido) {
      throw new Error(`Erro ao detectar colunas: ${erros.join(', ')}`);
    }

    // Processar cada linha
    const vendasProcessadas: VendaRegistrada[] = [];
    const produtosSemMatch: Map<string, ProdutoSemMatch> = new Map();
    let registrosDuplicados = 0;

    for (const row of data) {
      const vendaErpId = row[colunas.produtoId || 'id'] || this.generateId();

      // Verificar duplicação
      if (validarDuplicacao(vendaErpId, vendasExistentes)) {
        registrosDuplicados++;
        continue;
      }

      // Tentar fazer match com produto do cardápio
      const produtoId = row[colunas.produtoId || 'sku'];
      const produtoNome = row[colunas.produto || 'produto'];
      const itemCardapio = this.encontrarItemCardapio(produtoId, produtoNome, cardapio);

      const quantidade = parseFloat(row[colunas.quantidade || 'quantidade']) || 1;
      const valorTotal = parseFloat(row[colunas.valor || 'valor']) || 0;
      const precoUnitario = valorTotal / quantidade;

      if (!itemCardapio) {
        // Adicionar aos produtos sem match
        const key = produtoId || produtoNome;
        if (!produtosSemMatch.has(key)) {
          produtosSemMatch.set(key, {
            produtoErpId: produtoId,
            produtoNome: produtoNome,
            ocorrencias: 0,
            valorTotal: 0
          });
        }
        const prod = produtosSemMatch.get(key)!;
        prod.ocorrencias++;
        prod.valorTotal += valorTotal;
      }

      // Calcular métricas
      const custoCalculado = itemCardapio ? itemCardapio.custoAtual * quantidade : 0;
      const precoCardapio = itemCardapio ? itemCardapio.precoAtual : 0;
      const { lucroBruto, margem } = calcularLucro(valorTotal, custoCalculado);
      const { lucroBruto: lucroEsperado, margem: margemEsperada } = calcularLucro(
        precoCardapio * quantidade,
        custoCalculado
      );
      const { valor: divergenciaValor, percentual: divergenciaPercentual } = calcularDivergencia(
        precoUnitario,
        precoCardapio
      );

      const statusAnalise = classificarVenda(divergenciaPercentual, margem);

      vendasProcessadas.push({
        id: this.generateId(),
        importacaoId: '', // Será preenchido depois
        vendaErpId,
        dataVenda: new Date(row[colunas.data || 'data']),
        produtoErpId: produtoId,
        produtoNome,
        quantidade,
        precoUnitarioVendido: precoUnitario,
        precoTotalVendido: valorTotal,
        itemCardapioId: itemCardapio?.id,
        itemCardapioNome: itemCardapio?.nome,
        statusMatch: itemCardapio ? 'matched' : 'not_found',
        custoCalculado,
        precoCardapio,
        lucroBrutoReal: lucroBruto,
        lucroBrutoEsperado: lucroEsperado,
        margemReal: margem,
        margemEsperada,
        divergenciaValor,
        divergenciaPercentual,
        statusAnalise,
        vendedor: row[colunas.vendedor || 'vendedor'] || 'Não informado'
      });
    }

    // Determinar período
    const datas = vendasProcessadas.map(v => v.dataVenda);
    const periodoInicio = datas.length > 0 ? new Date(Math.min(...datas.map(d => d.getTime()))) : new Date();
    const periodoFim = datas.length > 0 ? new Date(Math.max(...datas.map(d => d.getTime()))) : new Date();

    // Calcular valor total
    const valorTotalNovo = vendasProcessadas.reduce((acc, v) => acc + v.precoTotalVendido, 0);

    return {
      arquivo: file.name,
      periodo: { inicio: periodoInicio, fim: periodoFim },
      totalRegistros: data.length,
      registrosNovos: vendasProcessadas.length,
      registrosDuplicados,
      produtosSemMatch: Array.from(produtosSemMatch.values()),
      valorTotalNovo,
      vendas: vendasProcessadas
    };
  }

  // Ler arquivo
  private async lerArquivo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Parse data baseado na extensão
  private parseData(fileName: string, content: string): any[] {
    if (fileName.endsWith('.csv')) {
      return parseCSV(content);
    } else if (fileName.endsWith('.json')) {
      return JSON.parse(content);
    } else {
      // Para Excel, seria necessário uma biblioteca como xlsx
      throw new Error('Formato de arquivo não suportado. Use CSV ou JSON.');
    }
  }

  // Encontrar item no cardápio
  private encontrarItemCardapio(
    produtoId: string,
    produtoNome: string,
    cardapio: ItemCardapio[]
  ): ItemCardapio | undefined {
    // Primeiro tentar por SKU/ID exato
    let item = cardapio.find(i => i.sku === produtoId);
    if (item) return item;

    // Depois tentar por nome exato
    item = cardapio.find(i => i.nome.toLowerCase() === produtoNome.toLowerCase());
    if (item) return item;

    // Por último, tentar similaridade
    item = cardapio.find(i =>
      i.nome.toLowerCase().includes(produtoNome.toLowerCase()) ||
      produtoNome.toLowerCase().includes(i.nome.toLowerCase())
    );

    return item;
  }

  // Criar nova importação
  async criarImportacao(
    arquivo: string,
    vendas: VendaRegistrada[],
    resumo: ResumoImportacao
  ): Promise<ImportacaoVendas> {
    if (!resumo.periodoImportacao) {
      throw new Error('Período de importação não definido');
    }

    const importacao: ImportacaoVendas = {
      id: this.generateId(),
      nomeArquivo: arquivo,
      dataImportacao: new Date(),
      periodoInicio: resumo.periodo.inicio,
      periodoFim: resumo.periodo.fim,
      periodoImportacao: resumo.periodoImportacao,
      totalRegistros: resumo.totalRegistros,
      totalImportados: resumo.registrosNovos,
      totalDuplicados: resumo.registrosDuplicados,
      totalSemMatch: resumo.produtosSemMatch.length,
      status: 'concluido'
    };

    if (this.supabaseEnabled) {
      // TODO: Salvar no Supabase
    }

    return importacao;
  }

  // Salvar vendas registradas
  async salvarVendas(vendas: VendaRegistrada[], importacaoId: string): Promise<VendaRegistrada[]> {
    // Atualizar importacaoId
    const vendasComImportacao = vendas.map(v => ({
      ...v,
      importacaoId
    }));

    if (this.supabaseEnabled) {
      // TODO: Salvar no Supabase
    }

    return vendasComImportacao;
  }

  // Atualizar system info
  async atualizarSystemInfo(vendas: VendaRegistrada[]): Promise<VendasSystemInfo> {
    const datas = vendas.map(v => v.dataVenda);
    const primeiraVenda = datas.length > 0 ? new Date(Math.min(...datas.map(d => d.getTime()))) : null;
    const ultimaVenda = datas.length > 0 ? new Date(Math.max(...datas.map(d => d.getTime()))) : null;

    const systemInfo: VendasSystemInfo = {
      primeiraVenda,
      ultimaVenda,
      ultimaImportacao: new Date(),
      totalVendasRegistradas: vendas.length,
      totalProdutosDiferentes: [...new Set(vendas.map(v => v.produtoNome))].length,
      totalImportacoes: 1 // Incrementar baseado nas importações existentes
    };

    if (this.supabaseEnabled) {
      // TODO: Salvar no Supabase
    }

    return systemInfo;
  }

  // Calcular dashboard
  async calcularDashboard(vendas: VendaRegistrada[], filtros: FiltrosVendas): Promise<DashboardVendas> {
    // Aplicar filtros
    let vendasFiltradas = this.aplicarFiltros(vendas, filtros);

    // Calcular estatísticas
    const stats = calcularEstatisticasVendas(vendasFiltradas);

    // Produto mais vendido
    const produtosMaisVendidos = vendasFiltradas.reduce((acc, v) => {
      const key = v.itemCardapioNome || v.produtoNome;
      if (!acc[key]) {
        acc[key] = { quantidade: 0, valor: 0 };
      }
      acc[key].quantidade += v.quantidade;
      acc[key].valor += v.precoTotalVendido;
      return acc;
    }, {} as Record<string, { quantidade: number; valor: number }>);

    const topProduto = Object.entries(produtosMaisVendidos)
      .sort((a, b) => b[1].valor - a[1].valor)[0];

    return {
      faturamentoReal: stats.faturamentoReal,
      faturamentoEsperado: stats.faturamentoEsperado,
      lucroBrutoReal: stats.lucroBrutoReal,
      lucroBrutoEsperado: stats.lucroBrutoEsperado,
      margemMediaReal: stats.margemMediaReal,
      margemMediaEsperada: stats.margemMediaEsperada,
      totalDivergencias: stats.totalDivergencias,
      totalPrejuizos: stats.totalPrejuizos,
      produtoMaisVendido: topProduto ? {
        nome: topProduto[0],
        quantidade: topProduto[1].quantidade,
        valor: topProduto[1].valor
      } : {
        nome: 'Nenhum',
        quantidade: 0,
        valor: 0
      },
      periodoAnalisado: {
        inicio: filtros.periodo.inicio || new Date(),
        fim: filtros.periodo.fim || new Date()
      }
    };
  }

  // Aplicar filtros nas vendas
  private aplicarFiltros(vendas: VendaRegistrada[], filtros: FiltrosVendas): VendaRegistrada[] {
    let resultado = [...vendas];

    // Filtro de período
    if (filtros.periodo.inicio) {
      resultado = resultado.filter(v => v.dataVenda >= filtros.periodo.inicio!);
    }
    if (filtros.periodo.fim) {
      resultado = resultado.filter(v => v.dataVenda <= filtros.periodo.fim!);
    }

    // Filtro de produto
    if (filtros.produto) {
      resultado = resultado.filter(v =>
        v.produtoNome.toLowerCase().includes(filtros.produto.toLowerCase()) ||
        (v.itemCardapioNome?.toLowerCase().includes(filtros.produto.toLowerCase()) ?? false)
      );
    }

    // Filtro de status de análise
    if (filtros.statusAnalise !== 'todos') {
      resultado = resultado.filter(v => v.statusAnalise === filtros.statusAnalise);
    }

    // Filtro de status de match
    if (filtros.statusMatch !== 'todos') {
      resultado = resultado.filter(v => v.statusMatch === filtros.statusMatch);
    }

    // Filtro de vendedor
    if (filtros.vendedor) {
      resultado = resultado.filter(v =>
        v.vendedor?.toLowerCase().includes(filtros.vendedor.toLowerCase())
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      let comparison = 0;

      switch (filtros.orderBy) {
        case 'data':
          comparison = a.dataVenda.getTime() - b.dataVenda.getTime();
          break;
        case 'valor':
          comparison = a.precoTotalVendido - b.precoTotalVendido;
          break;
        case 'divergencia':
          comparison = Math.abs(a.divergenciaPercentual) - Math.abs(b.divergenciaPercentual);
          break;
        case 'margem':
          comparison = a.margemReal - b.margemReal;
          break;
      }

      return filtros.orderDirection === 'asc' ? comparison : -comparison;
    });

    return resultado;
  }

  // Resolver match manual
  async resolverMatch(
    vendaId: string,
    itemCardapioId: string,
    vendas: VendaRegistrada[]
  ): Promise<VendaRegistrada | null> {
    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) return null;

    // Atualizar venda
    venda.itemCardapioId = itemCardapioId;
    venda.statusMatch = 'manual';

    if (this.supabaseEnabled) {
      // TODO: Atualizar no Supabase
    }

    return venda;
  }

  // Gerar ID único
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

// Exportar instância singleton
export const analiseVendasService = new AnaliseVendasService();