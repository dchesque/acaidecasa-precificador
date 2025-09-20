"use client";

import { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { analiseVendasService } from '@/services/analiseVendasService';
import {
  VendaRegistrada,
  FiltrosVendas,
  ResumoImportacao,
  ImportacaoVendas
} from '@/types/analise-vendas';
import { toast } from 'sonner';

export const useAnaliseVendas = () => {
  const {
    cardapio,
    vendasAnalise,
    initImportacao,
    addVendasRegistradas,
    updateSystemInfo,
    setVendasFiltros,
    resolveProdutoMatch,
    updateDashboardVendas
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resumoImportacao, setResumoImportacao] = useState<ResumoImportacao | null>(null);

  // Vendas filtradas
  const vendasFiltradas = useMemo(() => {
    let resultado = [...vendasAnalise.vendasRegistradas];
    const filtros = vendasAnalise.filtros;

    // Filtro de período
    if (filtros.periodo.inicio) {
      resultado = resultado.filter(v => new Date(v.dataVenda) >= filtros.periodo.inicio!);
    }
    if (filtros.periodo.fim) {
      resultado = resultado.filter(v => new Date(v.dataVenda) <= filtros.periodo.fim!);
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
          comparison = new Date(a.dataVenda).getTime() - new Date(b.dataVenda).getTime();
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
  }, [vendasAnalise.vendasRegistradas, vendasAnalise.filtros]);

  // Processar arquivo de vendas
  const processarArquivo = useCallback(async (file: File) => {
    try {
      setImportando(true);

      const resumo = await analiseVendasService.processarArquivoVendas(
        file,
        cardapio,
        vendasAnalise.vendasRegistradas
      );

      setResumoImportacao(resumo);
      return resumo;
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo de vendas');
      throw error;
    } finally {
      setImportando(false);
    }
  }, [cardapio, vendasAnalise.vendasRegistradas]);

  // Confirmar importação
  const confirmarImportacao = useCallback(async (
    arquivo: string,
    vendas: VendaRegistrada[],
    resumo: ResumoImportacao
  ) => {
    try {
      setLoading(true);

      // Criar importação
      const importacao = await analiseVendasService.criarImportacao(arquivo, vendas, resumo);
      initImportacao(importacao);

      // Salvar vendas
      const vendasSalvas = await analiseVendasService.salvarVendas(vendas, importacao.id);
      addVendasRegistradas(vendasSalvas);

      // Atualizar system info
      const novoSystemInfo = await analiseVendasService.atualizarSystemInfo([
        ...vendasAnalise.vendasRegistradas,
        ...vendasSalvas
      ]);
      updateSystemInfo(novoSystemInfo);

      // Recalcular dashboard
      const dashboard = await analiseVendasService.calcularDashboard(
        [...vendasAnalise.vendasRegistradas, ...vendasSalvas],
        vendasAnalise.filtros
      );
      updateDashboardVendas(dashboard);

      toast.success(`✅ ${vendasSalvas.length} vendas importadas com sucesso!`);

      setResumoImportacao(null);
      return true;
    } catch (error) {
      console.error('Erro ao confirmar importação:', error);
      toast.error('Erro ao salvar vendas');
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    vendasAnalise.vendasRegistradas,
    vendasAnalise.filtros,
    initImportacao,
    addVendasRegistradas,
    updateSystemInfo,
    updateDashboardVendas
  ]);

  // Atualizar filtros
  const atualizarFiltros = useCallback(async (novosFiltros: Partial<FiltrosVendas>) => {
    const filtrosAtualizados = {
      ...vendasAnalise.filtros,
      ...novosFiltros
    };

    setVendasFiltros(filtrosAtualizados);

    // Recalcular dashboard com novos filtros
    try {
      setLoading(true);
      const dashboard = await analiseVendasService.calcularDashboard(
        vendasAnalise.vendasRegistradas,
        filtrosAtualizados
      );
      updateDashboardVendas(dashboard);
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [vendasAnalise, setVendasFiltros, updateDashboardVendas]);

  // Resolver match de produto
  const resolverMatch = useCallback(async (vendaId: string, itemCardapioId: string) => {
    try {
      setLoading(true);

      const vendaAtualizada = await analiseVendasService.resolverMatch(
        vendaId,
        itemCardapioId,
        vendasAnalise.vendasRegistradas
      );

      if (vendaAtualizada) {
        resolveProdutoMatch(vendaId, itemCardapioId);
        toast.success('Produto vinculado com sucesso!');

        // Recalcular dashboard
        const dashboard = await analiseVendasService.calcularDashboard(
          vendasAnalise.vendasRegistradas,
          vendasAnalise.filtros
        );
        updateDashboardVendas(dashboard);
      }
    } catch (error) {
      console.error('Erro ao resolver match:', error);
      toast.error('Erro ao vincular produto');
    } finally {
      setLoading(false);
    }
  }, [vendasAnalise, resolveProdutoMatch, updateDashboardVendas]);

  // Estatísticas rápidas
  const estatisticas = useMemo(() => {
    const vendas = vendasFiltradas;

    if (vendas.length === 0) {
      return {
        totalVendas: 0,
        faturamentoTotal: 0,
        lucroTotal: 0,
        margemMedia: 0,
        ticketMedio: 0,
        produtosSemMatch: 0,
        vendasComDivergencia: 0,
        vendasComPrejuizo: 0
      };
    }

    const faturamentoTotal = vendas.reduce((acc, v) => acc + v.precoTotalVendido, 0);
    const lucroTotal = vendas.reduce((acc, v) => acc + v.lucroBrutoReal, 0);
    const margemMedia = faturamentoTotal > 0 ? (lucroTotal / faturamentoTotal) * 100 : 0;
    const ticketMedio = faturamentoTotal / vendas.length;

    return {
      totalVendas: vendas.length,
      faturamentoTotal,
      lucroTotal,
      margemMedia,
      ticketMedio,
      produtosSemMatch: vendas.filter(v => v.statusMatch === 'not_found').length,
      vendasComDivergencia: vendas.filter(v => v.statusAnalise === 'divergencia').length,
      vendasComPrejuizo: vendas.filter(v => v.statusAnalise === 'prejuizo').length
    };
  }, [vendasFiltradas]);

  // Produtos sem match
  const produtosSemMatch = useMemo(() => {
    const semMatch = vendasAnalise.vendasRegistradas.filter(v => v.statusMatch === 'not_found');

    const agrupado = semMatch.reduce((acc, venda) => {
      const key = venda.produtoErpId || venda.produtoNome;
      if (!acc[key]) {
        acc[key] = {
          produtoErpId: venda.produtoErpId,
          produtoNome: venda.produtoNome,
          ocorrencias: 0,
          valorTotal: 0,
          sugestaoMatch: undefined
        };
      }
      acc[key].ocorrencias += 1;
      acc[key].valorTotal += venda.precoTotalVendido;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(agrupado).sort((a, b) => b.ocorrencias - a.ocorrencias);
  }, [vendasAnalise.vendasRegistradas]);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    const filtrosLimpos: FiltrosVendas = {
      periodo: { inicio: null, fim: null },
      produto: '',
      statusAnalise: 'todos',
      statusMatch: 'todos',
      vendedor: '',
      orderBy: 'data',
      orderDirection: 'desc'
    };

    atualizarFiltros(filtrosLimpos);
  }, [atualizarFiltros]);

  return {
    // Estados
    loading,
    importando,
    resumoImportacao,

    // Dados
    importacoes: vendasAnalise.importacoes,
    vendasRegistradas: vendasAnalise.vendasRegistradas,
    vendasFiltradas,
    systemInfo: vendasAnalise.systemInfo,
    filtros: vendasAnalise.filtros,
    dashboardData: vendasAnalise.dashboardData,
    estatisticas,
    produtosSemMatch,

    // Ações
    processarArquivo,
    confirmarImportacao,
    atualizarFiltros,
    resolverMatch,
    limparFiltros,
    setResumoImportacao
  };
};