"use client"

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { DashboardGestaoData } from '@/utils/dashboardGestaoUtils';
import Link from 'next/link';

interface LucroLiquidoHeroProps {
  data: DashboardGestaoData;
  loading?: boolean;
}

export function LucroLiquidoHero({ data, loading = false }: LucroLiquidoHeroProps) {
  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-24 bg-gray-100 animate-pulse rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = (status: 'saudavel' | 'atencao' | 'critico') => {
    const configs = {
      saudavel: {
        badge: '✅ SAUDÁVEL',
        className: 'bg-green-100 text-green-800 border-green-200',
        color: 'text-green-600'
      },
      atencao: {
        badge: '⚠️ ATENÇÃO',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        color: 'text-yellow-600'
      },
      critico: {
        badge: '❌ CRÍTICO',
        className: 'bg-red-100 text-red-800 border-red-200',
        color: 'text-red-600'
      }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(data.status);

  const getTrendIcon = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="h-5 w-5" />;
    if (variacao < 0) return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getTrendColor = (variacao: number) => {
    if (variacao > 0) return 'text-green-600';
    if (variacao < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Calcular larguras das barras (baseado em percentual da receita)
  const calcularLargura = (valor: number) => {
    if (data.receita === 0) return 0;
    return Math.abs((valor / data.receita) * 100);
  };

  const barras = [
    {
      label: 'Receita',
      valor: data.receita,
      percentual: 100,
      cor: 'bg-blue-500',
      largura: 100
    },
    {
      label: 'CPV',
      valor: -data.cpv,
      percentual: calcularLargura(data.cpv),
      cor: 'bg-red-500',
      largura: calcularLargura(data.cpv)
    },
    {
      label: 'Lucro Bruto',
      valor: data.lucroBruto,
      percentual: data.margemBruta,
      cor: 'bg-green-500',
      largura: calcularLargura(data.lucroBruto)
    },
    {
      label: 'Custos Operacionais',
      valor: -data.custoOperacional,
      percentual: calcularLargura(data.custoOperacional),
      cor: 'bg-orange-500',
      largura: calcularLargura(data.custoOperacional)
    },
    {
      label: 'LUCRO LÍQUIDO',
      valor: data.lucroLiquido,
      percentual: data.margemLiquida,
      cor: data.lucroLiquido >= 0 ? 'bg-emerald-600' : 'bg-red-600',
      largura: calcularLargura(data.lucroLiquido),
      destaque: true
    }
  ];

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">💰 LUCRO LÍQUIDO</h2>
          <Badge className={statusConfig.className}>
            {statusConfig.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lucro Líquido Gigante */}
        <div className="text-center py-6">
          <p className={`text-6xl font-bold ${data.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatarMoeda(data.lucroLiquido)}
          </p>
          <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
        </div>

        {/* Comparação com Mês Anterior */}
        <div className="flex items-center justify-center gap-3 text-lg">
          <div className={`flex items-center gap-2 font-semibold ${getTrendColor(data.variacao.lucroLiquido)}`}>
            {getTrendIcon(data.variacao.lucroLiquido)}
            <span>
              {data.variacao.lucroLiquido > 0 ? '+' : ''}
              {data.variacao.lucroLiquido.toFixed(1)}%
            </span>
          </div>
          <span className="text-gray-500 text-sm">vs mês anterior</span>
        </div>

        {/* Waterfall Visual */}
        <div className="space-y-3 pt-4 border-t">
          {barras.map((barra, index) => (
            <div key={index} className={barra.destaque ? 'pt-2 border-t-2 border-dashed' : ''}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={`font-medium ${barra.destaque ? 'text-lg font-bold' : 'text-gray-700'}`}>
                  {barra.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${barra.destaque ? 'text-lg' : ''}`}>
                    {formatarMoeda(barra.valor)}
                  </span>
                  <span className="text-gray-500 text-xs w-12 text-right">
                    {barra.percentual.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`${barra.cor} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${barra.largura}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Margem Líquida Destaque */}
        <div className="flex items-center justify-center pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Margem Líquida</p>
            <p className={`text-3xl font-bold ${statusConfig.color}`}>
              {data.margemLiquida.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
          <Link href={`/analise-vendas?mes=${data.mesReferencia}`}>
            <Button variant="outline" className="w-full group hover:bg-green-50 hover:border-green-300">
              <span>Ver Vendas do Mês</span>
              <ExternalLink className="ml-2 h-4 w-4 group-hover:text-green-600" />
            </Button>
          </Link>
          <Link href={`/custos-operacionais?mes=${data.mesReferencia}`}>
            <Button variant="outline" className="w-full group hover:bg-orange-50 hover:border-orange-300">
              <span>Ver Custos do Mês</span>
              <ExternalLink className="ml-2 h-4 w-4 group-hover:text-orange-600" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
