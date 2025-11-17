"use client"

import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Upload,
  Download
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { VendaResumoCard } from '@/components/analise-vendas/VendaResumoCard';
import { VendaVisualizacaoTabela } from '@/components/analise-vendas/VendaVisualizacaoTabela';
import { TopProdutosCard } from '@/components/analise-vendas/TopProdutosCard';
import { VendasImportModalSimples } from '@/components/modals/VendasImportModalSimples';
import { VendaRegistrada, ResumoImportacao } from '@/types/analise-vendas';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarMoeda } from '@/utils/calculosFinanceiros';

export default function AnaliseVendas() {
  const {
    vendasAnalise,
    custosOperacionais,
    initImportacao,
    addVendasRegistradas,
    updateSystemInfo,
    updateDashboardVendas
  } = useAppContext();

  const [modalImportacao, setModalImportacao] = useState(false);
  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  const { vendasRegistradas } = vendasAnalise;

  // Gerar lista de meses disponíveis (últimos 12 meses ou meses com vendas)
  const mesesDisponiveis = useMemo(() => {
    const mesesSet = new Set<string>();

    // Adicionar últimos 12 meses
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesRef = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      mesesSet.add(mesRef);
    }

    // Adicionar meses com vendas
    vendasRegistradas.forEach(venda => {
      const data = new Date(venda.dataVenda);
      const mesRef = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      mesesSet.add(mesRef);
    });

    return Array.from(mesesSet).sort().reverse();
  }, [vendasRegistradas]);

  // Filtrar vendas por mês selecionado
  const vendasDoMes = useMemo(() => {
    const [ano, mes] = mesReferencia.split('-');
    return vendasRegistradas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda);
      return (
        dataVenda.getFullYear() === parseInt(ano) &&
        dataVenda.getMonth() + 1 === parseInt(mes)
      );
    });
  }, [vendasRegistradas, mesReferencia]);

  // Buscar custos operacionais do mês
  const custosDoMes = useMemo(() => {
    return custosOperacionais
      .filter(custo => custo.mesReferencia === mesReferencia)
      .reduce((total, custo) => total + custo.valorTotal, 0);
  }, [custosOperacionais, mesReferencia]);

  const handleImportComplete = async (vendas: VendaRegistrada[], resumo: ResumoImportacao) => {
    try {
      // Garantir que periodoImportacao existe
      if (!resumo.periodoImportacao) {
        throw new Error('Período de importação não definido');
      }

      // Criar importação mock
      const importacao = {
        id: `imp_${Date.now()}`,
        nomeArquivo: resumo.arquivo,
        dataImportacao: new Date(),
        periodoInicio: resumo.periodo.inicio,
        periodoFim: resumo.periodo.fim,
        periodoImportacao: resumo.periodoImportacao,
        totalRegistros: resumo.totalRegistros,
        totalImportados: resumo.registrosNovos,
        totalDuplicados: resumo.registrosDuplicados,
        totalSemMatch: resumo.produtosSemMatch?.length || 0,
        status: 'concluido' as const
      };

      initImportacao(importacao);
      addVendasRegistradas(vendas);

      // Atualizar system info
      const todasVendas = [...vendasRegistradas, ...vendas];
      const datasVendas = todasVendas.map(v => new Date(v.dataVenda));
      const primeiraVenda = datasVendas.length > 0 ? new Date(Math.min(...datasVendas.map(d => d.getTime()))) : null;
      const ultimaVenda = datasVendas.length > 0 ? new Date(Math.max(...datasVendas.map(d => d.getTime()))) : null;

      updateSystemInfo({
        primeiraVenda,
        ultimaVenda,
        ultimaImportacao: new Date(),
        totalVendasRegistradas: todasVendas.length,
        totalProdutosDiferentes: new Set(todasVendas.map(v => v.produtoNome)).size,
        totalImportacoes: vendasAnalise.importacoes.length + 1
      });

      // Atualizar dashboard
      const faturamentoReal = todasVendas.reduce((sum, v) => sum + v.precoTotalVendido, 0);
      const lucroBrutoReal = todasVendas.reduce((sum, v) => sum + v.lucroBrutoReal, 0);
      const margemMediaReal = faturamentoReal > 0 ? (lucroBrutoReal / faturamentoReal) * 100 : 0;

      updateDashboardVendas({
        faturamentoReal,
        faturamentoEsperado: faturamentoReal,
        lucroBrutoReal,
        lucroBrutoEsperado: lucroBrutoReal,
        margemMediaReal,
        margemMediaEsperada: margemMediaReal,
        totalDivergencias: todasVendas.filter(v => v.statusAnalise === 'divergencia').length,
        totalPrejuizos: todasVendas.filter(v => v.statusAnalise === 'prejuizo').length,
        produtoMaisVendido: {
          nome: 'N/A',
          quantidade: 0,
          valor: 0
        },
        periodoAnalisado: {
          inicio: primeiraVenda || new Date(),
          fim: ultimaVenda || new Date()
        }
      });

      toast.success(`✅ ${vendas.length} vendas importadas com sucesso!`);
      setModalImportacao(false);

      // Atualizar mês de referência para o mês importado
      if (resumo.periodoImportacao) {
        setMesReferencia(resumo.periodoImportacao.mesReferencia);
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar vendas');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Vendas', 14, 22);

      // Info do período
      const [ano, mes] = mesReferencia.split('-');
      const mesNome = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      doc.setFontSize(12);
      doc.text(`Período: ${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)}`, 14, 35);

      // Métricas
      const receita = vendasDoMes.reduce((sum, v) => sum + v.precoTotalVendido, 0);
      const lucro = vendasDoMes.reduce((sum, v) => sum + v.lucroBrutoReal, 0);
      const margem = receita > 0 ? (lucro / receita) * 100 : 0;

      doc.setFontSize(10);
      doc.text(`Vendas: ${vendasDoMes.length}`, 14, 45);
      doc.text(`Receita: ${formatarMoeda(receita)}`, 14, 52);
      doc.text(`Lucro: ${formatarMoeda(lucro)}`, 14, 59);
      doc.text(`Margem: ${margem.toFixed(1)}%`, 14, 66);

      // Tabela
      const tableData = vendasDoMes.slice(0, 100).map(venda => [
        new Date(venda.dataVenda).toLocaleDateString('pt-BR'),
        venda.produtoNome,
        venda.quantidade.toString(),
        formatarMoeda(venda.precoTotalVendido),
        `${venda.margemReal.toFixed(1)}%`,
        venda.statusAnalise === 'ok' ? 'OK' : venda.statusAnalise === 'divergencia' ? 'Alerta' : 'Prejuízo'
      ]);

      autoTable(doc, {
        head: [['Data', 'Produto', 'Qtd', 'Valor', 'Margem', 'Status']],
        body: tableData,
        startY: 75,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 }
      });

      doc.save(`vendas-${mesReferencia}.pdf`);
      toast.success('Relatório exportado!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Análise de Vendas
              </h1>
              <p className="text-sm text-gray-600">
                Importe vendas do ERP para análise de performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={vendasDoMes.length === 0}
              size="sm"
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

        {/* Resumo do Período */}
        <VendaResumoCard
          vendas={vendasDoMes}
          mesReferencia={mesReferencia}
          onMesChange={setMesReferencia}
          mesesDisponiveis={mesesDisponiveis}
          custosOperacionais={custosDoMes}
          loading={false}
        />

        {/* Tabela de Vendas */}
        <VendaVisualizacaoTabela
          vendas={vendasDoMes}
          loading={false}
        />

        {/* Top 5 Produtos */}
        {vendasDoMes.length > 0 && (
          <TopProdutosCard
            vendas={vendasDoMes}
            loading={false}
          />
        )}

        {/* TODO: Histórico accordion - implementar depois */}
        {/* <HistoricoVendasAccordion vendasRegistradas={vendasRegistradas} /> */}

        {/* Modal de Importação */}
        <VendasImportModalSimples
          isOpen={modalImportacao}
          onClose={() => setModalImportacao(false)}
          onImportComplete={handleImportComplete}
        />
      </div>
    </Layout>
  );
}
