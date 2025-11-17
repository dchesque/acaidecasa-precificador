"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Scale } from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { DashboardGestaoData } from '@/utils/dashboardGestaoUtils';

interface AnaliseRapidaCardsProps {
  data: DashboardGestaoData;
  meta?: number;
  loading?: boolean;
}

export function AnaliseRapidaCards({ data, meta, loading = false }: AnaliseRapidaCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Card 1: Meta
  const percentualMeta = data.percentualMeta || 0;
  const metaAtingida = percentualMeta >= 100;
  const statusMeta = metaAtingida ? 'Atingida' : percentualMeta >= 85 ? 'Próxima' : 'Distante';

  // Card 2: Tendência
  const tendenciaConfig = {
    crescendo: {
      label: 'Crescendo',
      icon: '📈',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    estavel: {
      label: 'Estável',
      icon: '➡️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    caindo: {
      label: 'Caindo',
      icon: '📉',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };
  const tendConfig = tendenciaConfig[data.tendencia];

  // Card 3: Ponto de Equilíbrio
  const cobertura = data.pontoEquilibrio > 0 ? (data.receita / data.pontoEquilibrio) * 100 : 0;
  const statusEquilibrio =
    cobertura >= 150 ? 'Superado' :
    cobertura >= 100 ? 'Atingido' :
    cobertura >= 80 ? 'Próximo' :
    'Longe';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Meta */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">🎯 Meta</h3>
          </div>

          {meta && meta > 0 ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-600">
                    {percentualMeta.toFixed(0)}%
                  </span>
                  <Badge
                    className={
                      metaAtingida
                        ? 'bg-green-100 text-green-800'
                        : percentualMeta >= 85
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {statusMeta}
                  </Badge>
                </div>
                <Progress value={Math.min(percentualMeta, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {formatarMoeda(data.receita)} de {formatarMoeda(meta)}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Nenhuma meta definida</p>
              <p className="text-xs text-gray-400 mt-1">Configure uma meta para acompanhar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Tendência */}
      <Card className={`hover:shadow-md transition-shadow ${tendConfig.bgColor} ${tendConfig.borderColor} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-lg">
              <TrendingUp className={`h-5 w-5 ${tendConfig.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900">📈 Tendência</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${tendConfig.color}`}>
                {tendConfig.icon}
              </span>
              <Badge className={`${tendConfig.bgColor} ${tendConfig.color} border-none`}>
                {tendConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">
              Lucro líquido está <strong>{tendConfig.label.toLowerCase()}</strong>
            </p>
            {data.variacao.lucroLiquido !== 0 && (
              <p className="text-xs text-gray-600">
                {data.variacao.lucroLiquido > 0 ? '+' : ''}
                {data.variacao.lucroLiquido.toFixed(1)}% vs mês anterior
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Ponto de Equilíbrio */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">⚖️ Equilíbrio</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatarMoeda(data.pontoEquilibrio)}
                </p>
                <p className="text-xs text-gray-500">para lucro zero</p>
              </div>
              <Badge
                className={
                  cobertura >= 150
                    ? 'bg-green-100 text-green-800'
                    : cobertura >= 100
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {statusEquilibrio}
              </Badge>
            </div>
            <Progress value={Math.min(cobertura, 100)} className="h-2" />
            <p className="text-xs text-gray-600">
              {cobertura > 0 ? `${cobertura.toFixed(0)}% de cobertura` : 'Calcule custos'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
