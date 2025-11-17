"use client"

import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Info } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { calcularDashboardGestao } from '@/utils/dashboardGestaoUtils';
import { LucroLiquidoHero } from '@/components/dashboard-gestao/LucroLiquidoHero';
import { AnaliseRapidaCards } from '@/components/dashboard-gestao/AnaliseRapidaCards';
import { AlertasOportunidades } from '@/components/dashboard-gestao/AlertasOportunidades';
import { BreakdownReceitasCustos } from '@/components/dashboard-gestao/BreakdownReceitasCustos';
import Link from 'next/link';

export default function DashboardGestao() {
  const { vendasAnalise, custosOperacionais } = useAppContext();
  const { vendasRegistradas } = vendasAnalise;

  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Opcional: Meta de receita (pode vir de configuração futura)
  const [meta] = useState<number | undefined>(undefined);

  // Gerar lista de meses disponíveis
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

    // Adicionar meses com custos
    custosOperacionais.forEach(custo => {
      mesesSet.add(custo.mesReferencia);
    });

    return Array.from(mesesSet).sort().reverse();
  }, [vendasRegistradas, custosOperacionais]);

  // Calcular dados do dashboard
  const dashboardData = useMemo(() => {
    return calcularDashboardGestao(
      vendasRegistradas,
      custosOperacionais,
      mesReferencia,
      meta
    );
  }, [vendasRegistradas, custosOperacionais, mesReferencia, meta]);

  // Verificar se há dados
  const temVendas = vendasRegistradas.length > 0;
  const temCustos = custosOperacionais.length > 0;

  // Formatar nome do mês para exibição
  const formatarMesDisplay = (mesRef: string) => {
    const [ano, mes] = mesRef.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    const mesNome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return mesNome.charAt(0).toUpperCase() + mesNome.slice(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Dashboard de Gestão
              </h1>
              <p className="text-sm text-gray-600">
                Visão completa do lucro líquido do negócio
              </p>
            </div>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Período:</span>
            <Select value={mesReferencia} onValueChange={setMesReferencia}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mesesDisponiveis.map(mes => (
                  <SelectItem key={mes} value={mes}>
                    {formatarMesDisplay(mes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado Vazio: Sem Dados */}
        {!temVendas && !temCustos && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Para visualizar o dashboard completo:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  <Link href="/analise-vendas" className="text-blue-600 hover:underline">
                    Importe vendas
                  </Link>{' '}
                  em Análise de Vendas
                </li>
                <li>
                  <Link href="/custos-operacionais" className="text-blue-600 hover:underline">
                    Cadastre custos
                  </Link>{' '}
                  em Custos Operacionais
                </li>
              </ol>
              <div className="flex gap-2 mt-4">
                <Link href="/analise-vendas">
                  <Button size="sm">Importar Vendas</Button>
                </Link>
                <Link href="/custos-operacionais">
                  <Button size="sm" variant="outline">Cadastrar Custos</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Completo */}
        {(temVendas || temCustos) && (
          <>
            {/* Hero: Lucro Líquido */}
            <LucroLiquidoHero data={dashboardData} />

            {/* Análise Rápida: 3 Cards */}
            <AnaliseRapidaCards data={dashboardData} meta={meta} />

            {/* Alertas e Oportunidades */}
            <AlertasOportunidades data={dashboardData} meta={meta} />

            {/* Breakdown: Receitas vs Custos */}
            <BreakdownReceitasCustos data={dashboardData} />

            {/* Info Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>
                Dashboard atualizado em tempo real com base nas vendas e custos cadastrados.
              </p>
              <p className="mt-1">
                <Link href="/analise-vendas" className="text-blue-600 hover:underline">
                  Análise de Vendas
                </Link>
                {' • '}
                <Link href="/custos-operacionais" className="text-blue-600 hover:underline">
                  Custos Operacionais
                </Link>
                {' • '}
                <Link href="/cardapio" className="text-blue-600 hover:underline">
                  Cardápio
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
