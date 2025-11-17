"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Package,
  Wallet,
  ExternalLink,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { DashboardGestaoData } from '@/utils/dashboardGestaoUtils';
import Link from 'next/link';

interface BreakdownReceitasCustosProps {
  data: DashboardGestaoData;
  loading?: boolean;
}

export function BreakdownReceitasCustos({ data, loading = false }: BreakdownReceitasCustosProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna Esquerda: RECEITAS */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <DollarSign className="h-5 w-5" />
            💰 RECEITAS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total de Receita */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-green-600">
              {formatarMoeda(data.receita)}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs text-gray-500">
                <ShoppingCart className="h-3 w-3 inline mr-1" />
                {data.totalVendas} vendas
              </div>
              <div className="text-xs text-gray-500">
                •
              </div>
              <div className="text-xs text-gray-500">
                Ticket: {formatarMoeda(data.totalVendas > 0 ? data.receita / data.totalVendas : 0)}
              </div>
            </div>
          </div>

          {/* Top 3 Produtos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top 3 Produtos
            </h4>
            {data.top3Produtos.length > 0 ? (
              <div className="space-y-2">
                {data.top3Produtos.map((produto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 text-center font-bold text-gray-400">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {produto.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {produto.quantidade}x vendidos
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatarMoeda(produto.valor)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm bg-white rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma venda registrada</p>
              </div>
            )}
          </div>

          {/* Botão Ver Todas Vendas */}
          <Link href={`/analise-vendas?mes=${data.mesReferencia}`} className="block">
            <Button variant="outline" className="w-full group hover:bg-green-100 hover:border-green-300">
              <span>Ver Todas as Vendas</span>
              <ExternalLink className="ml-2 h-4 w-4 group-hover:text-green-600" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Coluna Direita: CUSTOS */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Wallet className="h-5 w-5" />
            💸 CUSTOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total de Custos */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Custo Total</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatarMoeda(data.cpv + data.custoOperacional)}
            </p>
          </div>

          {/* Breakdown CPV vs Operacional */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Breakdown de Custos
            </h4>
            <div className="space-y-3">
              {/* CPV */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    CPV (Custo dos Produtos)
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.receita > 0 ? ((data.cpv / data.receita) * 100).toFixed(1) : 0}% da receita
                  </p>
                </div>
                <p className="font-semibold text-red-600">
                  {formatarMoeda(data.cpv)}
                </p>
              </div>

              {/* Custos Operacionais */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Custos Operacionais
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.receita > 0 ? ((data.custoOperacional / data.receita) * 100).toFixed(1) : 0}% da receita
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">
                    {formatarMoeda(data.custoOperacional)}
                  </p>
                  {data.custoOperacional === 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Não cadastrado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Proporção Visual */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Proporção
            </h4>
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
              <div
                className="bg-red-500"
                style={{
                  width: `${data.cpv + data.custoOperacional > 0 ? (data.cpv / (data.cpv + data.custoOperacional)) * 100 : 50}%`
                }}
                title="CPV"
              />
              <div
                className="bg-orange-500"
                style={{
                  width: `${data.cpv + data.custoOperacional > 0 ? (data.custoOperacional / (data.cpv + data.custoOperacional)) * 100 : 50}%`
                }}
                title="Custos Operacionais"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>CPV</span>
              <span>Operacionais</span>
            </div>
          </div>

          {/* Botão Ver Custos */}
          <Link href={`/custos-operacionais?mes=${data.mesReferencia}`} className="block">
            <Button variant="outline" className="w-full group hover:bg-orange-100 hover:border-orange-300">
              <span>Ver Todos os Custos</span>
              <ExternalLink className="ml-2 h-4 w-4 group-hover:text-orange-600" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
