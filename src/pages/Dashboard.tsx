"use client"

import { useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { useCalculations } from "@/hooks/useCalculations";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SaudeFinanceira } from "@/components/dashboard/SaudeFinanceira";
import { AlertasCriticos } from "@/components/dashboard/AlertasCriticos";
import { EvolucaoFinanceira } from "@/components/dashboard/EvolucaoFinanceira";
import { CardapioAnalise } from "@/components/dashboard/CardapioAnalise";
import { AcoesRapidas } from "@/components/dashboard/AcoesRapidas";
import {
  mockConfiguracao,
  mockCategorias,
  mockUnidadesMedida,
  mockFornecedores,
  mockInsumos,
  mockReceitas,
  mockCoposBase,
  mockCombinados,
  mockCardapio
} from "@/data/mockData";

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const { verificarAlertas } = useCalculations();

  // Load mock data on mount
  useEffect(() => {
    dispatch({ type: 'SET_CONFIGURACAO', payload: mockConfiguracao });
    dispatch({ type: 'SET_CATEGORIAS', payload: mockCategorias });
    dispatch({ type: 'SET_UNIDADES_MEDIDA', payload: mockUnidadesMedida });
    dispatch({ type: 'SET_FORNECEDORES', payload: mockFornecedores });
    dispatch({ type: 'SET_INSUMOS', payload: mockInsumos });
    dispatch({ type: 'SET_RECEITAS', payload: mockReceitas });
    dispatch({ type: 'SET_COPOS_BASE', payload: mockCoposBase });
    dispatch({ type: 'SET_COMBINADOS', payload: mockCombinados });
    dispatch({ type: 'SET_CARDAPIO', payload: mockCardapio });
  }, [dispatch]);

  // Verificar alertas quando dados mudam
  const handleVerificarAlertas = useCallback(() => {
    if (state.coposBase.length > 0 || state.combinados.length > 0) {
      verificarAlertas();
    }
  }, [state.coposBase, state.combinados, verificarAlertas]);

  useEffect(() => {
    handleVerificarAlertas();
  }, [handleVerificarAlertas]);

  // Obter dados consolidados do dashboard
  const {
    saudeFinanceira,
    alertas,
    evolucao,
    cardapioAnalise,
    loading,
    periodoAtual,
    periodoEvolucao,
    setPeriodoEvolucao,
    isClient
  } = useDashboardData();

  // Evitar erro de hidratação mostrando loading até estar no cliente
  if (!isClient) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão executiva orientada a ação e decisão
          </p>
        </div>

        {/* Hero Section - Saúde Financeira */}
        <SaudeFinanceira
          dados={saudeFinanceira}
          periodo={periodoAtual}
          loading={loading}
        />

        {/* Alertas Críticos */}
        <AlertasCriticos alertas={alertas} loading={loading} />

        {/* Gráfico de Evolução Financeira */}
        <EvolucaoFinanceira
          dados={evolucao}
          periodo={periodoEvolucao}
          onChangePeriodo={setPeriodoEvolucao}
          loading={loading}
        />

        {/* Análise do Cardápio - Grid 2x2 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Análise do Cardápio</h2>
          <CardapioAnalise
            maisVendidos={cardapioAnalise.maisVendidos}
            menosVendidos={cardapioAnalise.menosVendidos}
            maioresMargens={cardapioAnalise.maioresMargens}
            menoresMargens={cardapioAnalise.menoresMargens}
            loading={loading}
          />
        </div>

        {/* Ações Rápidas */}
        <AcoesRapidas />
      </div>
    </Layout>
  );
};

export default Dashboard;
