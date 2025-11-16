"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { criarPeriodoMesCompleto, sugerirMelhorPeriodo } from '@/utils/periodoUtils';
import {
  calcularSaudeFinanceira,
  calcularEvolucaoFinanceira,
  calcularTopProdutos,
  calcularProdutosComMargem,
  gerarAlertas,
  SaudeFinanceira,
  DadosEvolucao,
  TopProduto,
  ProdutoMargem,
  AlertaCritico
} from '@/utils/dashboardCalculations';
import { PeriodoImportacao } from '@/types/periodo';

export interface DashboardData {
  saudeFinanceira: SaudeFinanceira;
  alertas: AlertaCritico[];
  evolucao: DadosEvolucao[];
  cardapioAnalise: {
    maisVendidos: TopProduto[];
    menosVendidos: TopProduto[];
    maioresMargens: ProdutoMargem[];
    menoresMargens: ProdutoMargem[];
  };
  loading: boolean;
  periodoAtual: PeriodoImportacao;
}

export type PeriodoEvolucao = '6M' | '3M' | '30D' | '7D';

export const useDashboardData = () => {
  const {
    cardapio,
    vendasAnalise,
    custosOperacionais,
    alertas
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [periodoEvolucao, setPeriodoEvolucao] = useState<PeriodoEvolucao>('6M');

  // Determinar período atual
  const periodoAtual = useMemo((): PeriodoImportacao => {
    // Tentar obter período mais recente com dados
    if (vendasAnalise.vendasRegistradas.length > 0) {
      return sugerirMelhorPeriodo(
        vendasAnalise.vendasRegistradas,
        custosOperacionais
      );
    }

    // Fallback: mês atual
    const hoje = new Date();
    const mesRef = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    return criarPeriodoMesCompleto(mesRef);
  }, [vendasAnalise.vendasRegistradas, custosOperacionais]);

  // Calcular saúde financeira
  const saudeFinanceira = useMemo((): SaudeFinanceira => {
    try {
      return calcularSaudeFinanceira(
        vendasAnalise.vendasRegistradas,
        custosOperacionais,
        periodoAtual,
        40000 // Meta padrão de R$ 40.000
      );
    } catch (error) {
      console.error('Erro ao calcular saúde financeira:', error);
      return {
        lucroLiquido: 0,
        margemLiquida: 0,
        faturamento: 0,
        cpv: 0,
        custosOperacionais: 0,
        meta: 40000,
        percentualMeta: 0,
        comparacaoMesAnterior: {
          lucroLiquido: 0,
          margemLiquida: 0,
          faturamento: 0
        }
      };
    }
  }, [vendasAnalise.vendasRegistradas, custosOperacionais, periodoAtual]);

  // Gerar alertas críticos
  const alertasCriticos = useMemo((): AlertaCritico[] => {
    try {
      return gerarAlertas(
        cardapio,
        vendasAnalise.vendasRegistradas,
        alertas
      );
    } catch (error) {
      console.error('Erro ao gerar alertas:', error);
      return [];
    }
  }, [cardapio, vendasAnalise.vendasRegistradas, alertas]);

  // Calcular evolução financeira
  const evolucao = useMemo((): DadosEvolucao[] => {
    try {
      return calcularEvolucaoFinanceira(
        vendasAnalise.vendasRegistradas,
        custosOperacionais,
        periodoEvolucao
      );
    } catch (error) {
      console.error('Erro ao calcular evolução:', error);
      return [];
    }
  }, [vendasAnalise.vendasRegistradas, custosOperacionais, periodoEvolucao]);

  // Análise do cardápio
  const cardapioAnalise = useMemo(() => {
    try {
      const maisVendidos = calcularTopProdutos(
        vendasAnalise.vendasRegistradas,
        7, // últimos 7 dias
        5,
        'mais'
      );

      const menosVendidos = calcularTopProdutos(
        vendasAnalise.vendasRegistradas,
        7,
        5,
        'menos'
      );

      const maioresMargens = calcularProdutosComMargem(
        cardapio,
        'maior',
        5
      );

      const menoresMargens = calcularProdutosComMargem(
        cardapio,
        'menor',
        5
      );

      return {
        maisVendidos,
        menosVendidos,
        maioresMargens,
        menoresMargens
      };
    } catch (error) {
      console.error('Erro ao calcular análise do cardápio:', error);
      return {
        maisVendidos: [],
        menosVendidos: [],
        maioresMargens: [],
        menoresMargens: []
      };
    }
  }, [cardapio, vendasAnalise.vendasRegistradas]);

  // Garantir que só renderiza no cliente para evitar erro de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const dashboardData: DashboardData = {
    saudeFinanceira,
    alertas: alertasCriticos,
    evolucao,
    cardapioAnalise,
    loading,
    periodoAtual
  };

  return {
    ...dashboardData,
    periodoEvolucao,
    setPeriodoEvolucao,
    isClient
  };
};
