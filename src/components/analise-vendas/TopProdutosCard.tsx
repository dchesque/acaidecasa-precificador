"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { VendaRegistrada } from '@/types/analise-vendas';

interface TopProdutosCardProps {
  vendas: VendaRegistrada[];
  loading?: boolean;
}

interface ProdutoAgregado {
  nome: string;
  quantidade: number;
  valorTotal: number;
  margem: number;
}

export function TopProdutosCard({ vendas, loading = false }: TopProdutosCardProps) {
  const topProdutos = useMemo(() => {
    // Agregar vendas por produto
    const produtosMap = new Map<string, ProdutoAgregado>();

    vendas.forEach(venda => {
      const key = venda.produtoNome;
      const existente = produtosMap.get(key);

      if (existente) {
        existente.quantidade += venda.quantidade;
        existente.valorTotal += venda.precoTotalVendido;
        // Calcular margem média ponderada pelo valor
        const margemPonderada =
          (existente.margem * (existente.valorTotal - venda.precoTotalVendido) +
           venda.margemReal * venda.precoTotalVendido) /
          existente.valorTotal;
        existente.margem = margemPonderada;
      } else {
        produtosMap.set(key, {
          nome: venda.produtoNome,
          quantidade: venda.quantidade,
          valorTotal: venda.precoTotalVendido,
          margem: venda.margemReal
        });
      }
    });

    // Converter para array e ordenar por quantidade
    return Array.from(produtosMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [vendas]);

  const getMedalIcon = (index: number) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || '';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top 5 Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topProdutos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top 5 Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm">Nenhum produto vendido ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 5 Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topProdutos.map((produto, index) => (
            <div
              key={produto.nome}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Posição/Medalha */}
              <div className="flex-shrink-0 w-10 text-center">
                {index < 3 ? (
                  <span className="text-2xl">{getMedalIcon(index)}</span>
                ) : (
                  <span className="text-lg font-bold text-gray-400">{index + 1}.</span>
                )}
              </div>

              {/* Informações do Produto */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {produto.nome}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{produto.quantidade}</span>
                    <span>vendas</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium text-green-600">
                    {formatarMoeda(produto.valorTotal)}
                  </span>
                </div>
              </div>

              {/* Margem */}
              <div className="flex-shrink-0 text-right">
                <Badge
                  className={
                    produto.margem >= 50
                      ? 'bg-green-100 text-green-800'
                      : produto.margem >= 30
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {produto.margem.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Estatística Extra */}
        {topProdutos.length > 0 && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-600 flex items-center justify-between">
            <span>Total vendido (Top 5):</span>
            <span className="font-bold text-green-600">
              {formatarMoeda(topProdutos.reduce((sum, p) => sum + p.valorTotal, 0))}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
