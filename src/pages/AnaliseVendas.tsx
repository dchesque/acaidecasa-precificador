"use client"

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  BarChart3,
  Table as TableIcon,
  Calculator,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useAnaliseVendas } from '@/hooks/useAnaliseVendas';
import { VendasSystemStatus } from '@/components/analise-vendas/VendasSystemStatus';
import { VendasDashboard } from '@/components/analise-vendas/VendasDashboard';
import { VendasTable } from '@/components/analise-vendas/VendasTable';
import { VendasFilters } from '@/components/analise-vendas/VendasFilters';
import { VendasImportModal } from '@/components/modals/VendasImportModal';
import { VendasDetailModal } from '@/components/modals/VendasDetailModal';
import { VendaRegistrada, ResumoImportacao } from '@/types/analise-vendas';
import { PeriodoImportacao } from '@/types/periodo';
import { PeriodConsistencyAlert, SimplePeriodAlert } from '@/components/common/PeriodConsistencyAlert';
import { useAppContext } from '@/contexts/AppContext';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { formatarPeriodoDisplay, obterStatusPeriodo, sugerirMelhorPeriodo } from '@/utils/periodoUtils';
import { toast } from 'sonner';

export default function AnaliseVendas() {
  const {
    loading,
    importacoes,
    vendasFiltradas,
    vendasRegistradas,
    systemInfo,
    filtros,
    dashboardData,
    estatisticas,
    produtosSemMatch,
    processarArquivo,
    confirmarImportacao,
    atualizarFiltros,
    resolverMatch,
    limparFiltros
  } = useAnaliseVendas();

  const {
    custosOperacionais,
    periodoAtualGestao,
    statusPeriodos,
    setPeriodoGestao,
    updateStatusPeriodo
  } = useAppContext();
  const router = useRouter();

  const [modalImportacao, setModalImportacao] = useState(false);
  const [modalMatch, setModalMatch] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaRegistrada | null>(null);
  const [periodoVendas, setPeriodoVendas] = useState<PeriodoImportacao | null>(periodoAtualGestao);

  // Obter período de referência baseado nos filtros atuais ou sugerir melhor período
  const getPeriodoReferencia = (): PeriodoImportacao | null => {
    if (periodoVendas) {
      return periodoVendas;
    }

    if (vendasRegistradas.length > 0) {
      return sugerirMelhorPeriodo(vendasRegistradas, custosOperacionais);
    }

    return null;
  };

  // Obter status do período atual
  const getStatusPeriodoAtual = () => {
    const periodo = getPeriodoReferencia();
    if (!periodo) return null;

    const statusExistente = statusPeriodos.get(periodo.mesReferencia);
    if (statusExistente) return statusExistente;

    return obterStatusPeriodo(periodo.mesReferencia, vendasRegistradas, custosOperacionais);
  };

  // Verificar consistência entre vendas e custos
  const isPeriodsConsistent = (): boolean => {
    const periodoRef = getPeriodoReferencia();
    if (!periodoRef) return false;

    const hasCustos = custosOperacionais.some(custo => {
      const custoPeriodo = `${custo.ano || new Date().getFullYear()}-${String((custo.mes || 1)).padStart(2, '0')}`;
      return custoPeriodo === periodoRef.mesReferencia;
    });

    return hasCustos && vendasRegistradas.length > 0;
  };

  const handlePeriodoChange = (periodo: PeriodoImportacao) => {
    setPeriodoVendas(periodo);
    setPeriodoGestao(periodo);

    // Atualizar filtros de vendas para corresponder ao período
    atualizarFiltros({
      ...filtros,
      periodo: {
        inicio: periodo.dataInicio,
        fim: periodo.dataFim
      }
    });

    toast.success(`Período atualizado para ${formatarPeriodoDisplay(periodo)}`);
  };

  const handleNavegacaoDashboardGestao = () => {
    const params = new URLSearchParams();
    if (filtros.periodo.inicio && filtros.periodo.fim) {
      params.set('inicio', filtros.periodo.inicio.toISOString());
      params.set('fim', filtros.periodo.fim.toISOString());
    }
    router.push(`/dashboard-gestao?${params.toString()}`);
  };

  const handleImportComplete = async (vendas: VendaRegistrada[], resumo: ResumoImportacao) => {
    const sucesso = await confirmarImportacao(resumo.arquivo, vendas, resumo);
    if (sucesso) {
      setModalImportacao(false);
    }
  };

  const handleViewDetails = (venda: VendaRegistrada) => {
    setVendaSelecionada(venda);
    setModalDetalhes(true);
  };

  const handleResolveMatch = (venda: VendaRegistrada) => {
    setVendaSelecionada(venda);
    setModalMatch(true);
  };

  const handleExportData = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Análise de Vendas', 14, 22);

      // Informações do período
      doc.setFontSize(10);
      doc.text(`Período: ${systemInfo.primeiraVenda ? new Date(systemInfo.primeiraVenda).toLocaleDateString('pt-BR') : 'N/A'} a ${systemInfo.ultimaVenda ? new Date(systemInfo.ultimaVenda).toLocaleDateString('pt-BR') : 'N/A'}`, 14, 35);
      doc.text(`Total de Vendas: ${vendasRegistradas.length}`, 14, 42);
      doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 49);

      // KPIs
      doc.setFontSize(12);
      doc.text('Indicadores Principais:', 14, 60);
      doc.setFontSize(10);
      if (dashboardData) {
        doc.text(`Faturamento Real: R$ ${dashboardData.faturamentoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 67);
        doc.text(`Lucro Bruto: R$ ${dashboardData.lucroBrutoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 74);
        doc.text(`Margem Média: ${dashboardData.margemMediaReal.toFixed(1)}%`, 14, 81);
        doc.text(`Total de Divergências: ${dashboardData.totalDivergencias}`, 14, 88);
      }

      // Tabela de vendas
      const tableData = vendasFiltradas.slice(0, 100).map(venda => [
        new Date(venda.dataVenda).toLocaleDateString('pt-BR'),
        venda.produtoNome,
        venda.quantidade.toString(),
        `R$ ${venda.precoTotalVendido.toFixed(2)}`,
        venda.margemReal.toFixed(1) + '%',
        venda.statusAnalise === 'ok' ? 'OK' : venda.statusAnalise === 'divergencia' ? 'Divergência' : 'Prejuízo'
      ]);

      autoTable(doc, {
        head: [['Data', 'Produto', 'Qtd', 'Valor', 'Margem', 'Status']],
        body: tableData,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 }
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }

      // Salvar PDF
      doc.save(`analise-vendas-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Análise de Vendas
              </h1>
              <p className="text-sm text-gray-600">
                Importe e analise suas vendas para identificar divergências e oportunidades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={vendasRegistradas.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => setModalImportacao(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Vendas
            </Button>
          </div>
        </div>

        {/* System Status */}
        <VendasSystemStatus systemInfo={systemInfo} />

        {/* Period Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status do Período
              </CardTitle>
              {getPeriodoReferencia() && (
                <Badge variant="outline">
                  {formatarPeriodoDisplay(getPeriodoReferencia()!)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <SimplePeriodAlert
              hasVendas={vendasRegistradas.length > 0}
              hasCustos={custosOperacionais.length > 0}
              periodosConsistentes={isPeriodsConsistent()}
              onAddVendas={() => setModalImportacao(true)}
              onAddCustos={() => router.push('/custos-operacionais')}
            />

            {getPeriodoReferencia() && getStatusPeriodoAtual() && (
              <div className="mt-4">
                <PeriodConsistencyAlert
                  periodoVendas={getPeriodoReferencia()!}
                  statusPeriodoVendas={getStatusPeriodoAtual()!}
                  onFixInconsistency={() => setModalImportacao(true)}
                  onViewDetails={() => router.push('/dashboard-gestao')}
                />
              </div>
            )}

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {vendasRegistradas.length}
                </p>
                <p className="text-xs text-gray-600">Vendas Registradas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {custosOperacionais.length}
                </p>
                <p className="text-xs text-gray-600">Custos Registrados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData ? formatarMoeda(dashboardData.faturamentoReal) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-gray-600">Faturamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard KPIs */}
        <VendasDashboard dashboard={dashboardData} loading={loading} />

        {/* Integração Dashboard Gestão */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle className="text-purple-900">Dashboard de Gestão</CardTitle>
                  <p className="text-sm text-purple-700 mt-1">
                    Analise o lucro líquido considerando os custos operacionais
                  </p>
                </div>
              </div>
              <Button
                onClick={handleNavegacaoDashboardGestao}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Lucro Bruto (Período)</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData ? formatarMoeda(dashboardData.lucroBrutoReal) : '-'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">Custos Operacionais</p>
                  {custosEncontrados.length > 0 ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {custosEncontrados.length} mês{custosEncontrados.length > 1 ? 'es' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Não cadastrado
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {custosEncontrados.length > 0 ? formatarMoeda(totalCustosOperacionais) : '-'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Lucro Líquido (Estimado)</p>
                <p className={`text-2xl font-bold ${
                  custosEncontrados.length > 0 && dashboardData
                    ? (dashboardData.lucroBrutoReal - totalCustosOperacionais) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                    : 'text-gray-400'
                }`}>
                  {custosEncontrados.length > 0 && dashboardData
                    ? formatarMoeda(dashboardData.lucroBrutoReal - totalCustosOperacionais)
                    : 'Cadastre custos'
                  }
                </p>
              </div>
            </div>

            {custosEncontrados.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Para uma análise completa do lucro líquido, cadastre os custos operacionais do período.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => router.push('/custos-operacionais')}
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Cadastrar Custos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <VendasFilters
        filtros={filtros}
        onUpdateFiltros={atualizarFiltros}
        onLimparFiltros={limparFiltros}
        totalVendas={vendasRegistradas.length}
        vendasFiltradas={vendasFiltradas.length}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Tabela
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
          <TabsTrigger value="divergencias" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Divergências
            {estatisticas.vendasComDivergencia > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {estatisticas.vendasComDivergencia}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <VendasTable
            vendas={vendasFiltradas}
            onViewDetails={handleViewDetails}
            onResolveMatch={handleResolveMatch}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Análises e Gráficos</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placeholder para gráficos */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Tendência de Vendas</p>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Produtos Mais Vendidos</p>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Margens</p>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Divergências</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="divergencias" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Produtos com Divergências</h3>

            {produtosSemMatch.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-900 mb-2">
                    Produtos não encontrados no cardápio
                  </h4>
                  <div className="space-y-2">
                    {produtosSemMatch.slice(0, 5).map((produto, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{produto.produtoNome}</p>
                          <p className="text-xs text-gray-500">
                            {produto.ocorrencias} ocorrência{produto.ocorrencias !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Abrir modal de match
                            toast.info('Funcionalidade em desenvolvimento');
                          }}
                        >
                          Vincular
                        </Button>
                      </div>
                    ))}
                  </div>
                  {produtosSemMatch.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      e mais {produtosSemMatch.length - 5} produtos...
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                    Vendas com divergência de preço
                  </h4>
                  <p className="text-sm text-gray-700">
                    {estatisticas.vendasComDivergencia} vendas apresentam divergência superior a 5%
                  </p>
                </div>

                {estatisticas.vendasComPrejuizo > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">
                      Vendas com prejuízo
                    </h4>
                    <p className="text-sm text-gray-700">
                      {estatisticas.vendasComPrejuizo} vendas foram realizadas abaixo do custo
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma divergência encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>
        </Tabs>

        {/* Modals */}
        <VendasImportModal
          isOpen={modalImportacao}
          onClose={() => setModalImportacao(false)}
          onImportComplete={handleImportComplete}
        />

        <VendasDetailModal
          isOpen={modalDetalhes}
          onClose={() => {
            setModalDetalhes(false);
            setVendaSelecionada(null);
          }}
          venda={vendaSelecionada}
        />
      </div>
    </Layout>
  );
}