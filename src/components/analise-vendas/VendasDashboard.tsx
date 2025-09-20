"use client";

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Percent,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardVendas } from '@/types/analise-vendas';
import { formatarMoeda, formatarPercentual } from '@/utils/vendasCalculations';

interface VendasDashboardProps {
  dashboard?: DashboardVendas;
  loading?: boolean;
}

export const VendasDashboard: React.FC<VendasDashboardProps> = ({ dashboard, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const cards = [
    {
      id: 'faturamento',
      title: 'Faturamento',
      icon: DollarSign,
      color: 'blue',
      real: dashboard.faturamentoReal,
      esperado: dashboard.faturamentoEsperado,
      formato: 'moeda'
    },
    {
      id: 'lucro',
      title: 'Lucro Bruto',
      icon: TrendingUp,
      color: 'green',
      real: dashboard.lucroBrutoReal,
      esperado: dashboard.lucroBrutoEsperado,
      formato: 'moeda'
    },
    {
      id: 'margem',
      title: 'Margem Média',
      icon: Percent,
      color: 'purple',
      real: dashboard.margemMediaReal,
      esperado: dashboard.margemMediaEsperada,
      formato: 'percentual'
    },
    {
      id: 'divergencias',
      title: 'Divergências',
      icon: AlertTriangle,
      color: 'orange',
      valor: dashboard.totalDivergencias,
      prejuizos: dashboard.totalPrejuizos,
      formato: 'contador'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'text-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'text-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'text-orange-500'
      }
    };
    return colors[color] || colors.blue;
  };

  const formatarValor = (valor: number, formato: string) => {
    switch (formato) {
      case 'moeda':
        return formatarMoeda(valor);
      case 'percentual':
        return formatarPercentual(valor);
      case 'contador':
        return valor.toString();
      default:
        return valor.toString();
    }
  };

  const calcularVariacao = (real: number, esperado: number) => {
    if (esperado === 0) return 0;
    return ((real - esperado) / esperado) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = getColorClasses(card.color);
          const Icon = card.icon;

          if (card.formato === 'contador') {
            return (
              <div key={card.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {card.valor}
                  </span>
                  <span className="text-sm text-gray-500">vendas</span>
                </div>

                {card.prejuizos !== undefined && card.prejuizos > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        {card.prejuizos} com prejuízo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          const variacao = calcularVariacao(card.real!, card.esperado!);
          const isPositive = variacao >= 0;

          return (
            <div key={card.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="font-medium">{Math.abs(variacao).toFixed(1)}%</span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatarValor(card.real!, card.formato)}
                  </span>
                  <span className="text-xs text-gray-500">real</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Esperado:</span>
                  <span className="font-medium text-gray-700">
                    {formatarValor(card.esperado!, card.formato)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dashboard.produtoMaisVendido && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Produto Mais Vendido</h3>
                <p className="text-lg font-bold text-gray-900">
                  {dashboard.produtoMaisVendido.nome}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {dashboard.produtoMaisVendido.quantidade} unidades
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatarMoeda(dashboard.produtoMaisVendido.valor)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};