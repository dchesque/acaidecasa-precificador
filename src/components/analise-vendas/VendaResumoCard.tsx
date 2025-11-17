"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingCart,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { VendaRegistrada } from '@/types/analise-vendas';
import Link from 'next/link';

interface VendaResumoCardProps {
  vendas: VendaRegistrada[];
  mesReferencia: string;
  onMesChange: (mes: string) => void;
  mesesDisponiveis: string[];
  custosOperacionais?: number;
  loading?: boolean;
}

interface MetricaCard {
  titulo: string;
  valor: string | number;
  icon: React.ReactNode;
  cor: string;
}

export function VendaResumoCard({
  vendas,
  mesReferencia,
  onMesChange,
  mesesDisponiveis,
  custosOperacionais = 0,
  loading = false
}: VendaResumoCardProps) {
  // Calcular métricas
  const totalVendas = vendas.length;
  const receitaTotal = vendas.reduce((sum, v) => sum + v.precoTotalVendido, 0);
  const lucroTotal = vendas.reduce((sum, v) => sum + v.lucroBrutoReal, 0);
  const custoTotal = vendas.reduce((sum, v) => sum + v.custoCalculado, 0);
  const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;
  const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

  // Calcular alertas
  const produtosSemMatch = vendas.filter(v => v.statusMatch === 'not_found');
  const vendasComPrejuizo = vendas.filter(v => v.statusAnalise === 'prejuizo');
  const vendasMargemBaixa = vendas.filter(v => v.margemReal < 20 && v.margemReal >= 0);

  // Produtos únicos sem match
  const produtosUnicos = new Set(produtosSemMatch.map(v => v.produtoNome)).size;

  const metricas: MetricaCard[] = [
    {
      titulo: 'Vendas',
      valor: totalVendas,
      icon: <Package className="h-5 w-5" />,
      cor: 'text-blue-600'
    },
    {
      titulo: 'Receita',
      valor: formatarMoeda(receitaTotal),
      icon: <DollarSign className="h-5 w-5" />,
      cor: 'text-green-600'
    },
    {
      titulo: 'Lucro',
      valor: formatarMoeda(lucroTotal),
      icon: <TrendingUp className="h-5 w-5" />,
      cor: 'text-emerald-600'
    },
    {
      titulo: 'Margem',
      valor: `${margemMedia.toFixed(1)}%`,
      icon: <Percent className="h-5 w-5" />,
      cor: margemMedia >= 50 ? 'text-green-600' : margemMedia >= 30 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      titulo: 'Ticket Médio',
      valor: formatarMoeda(ticketMedio),
      icon: <ShoppingCart className="h-5 w-5" />,
      cor: 'text-purple-600'
    },
    {
      titulo: 'Custos',
      valor: formatarMoeda(custoTotal),
      icon: <Wallet className="h-5 w-5" />,
      cor: 'text-orange-600'
    }
  ];

  const temAlertas = produtosUnicos > 0 || vendasComPrejuizo.length > 0 || vendasMargemBaixa.length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📊 Resumo do Período</CardTitle>
            <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg font-bold">📊 Resumo do Período</CardTitle>
          <Select value={mesReferencia} onValueChange={onMesChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {mesesDisponiveis.map(mes => {
                const [ano, mesNum] = mes.split('-');
                const data = new Date(parseInt(ano), parseInt(mesNum) - 1);
                const mesNome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return (
                  <SelectItem key={mes} value={mes}>
                    {mesNome.charAt(0).toUpperCase() + mesNome.slice(1)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid de Métricas 2x3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricas.map((metrica, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metrica.titulo}</span>
                <div className={metrica.cor}>{metrica.icon}</div>
              </div>
              <p className={`text-2xl font-bold ${metrica.cor}`}>
                {metrica.valor}
              </p>
            </div>
          ))}
        </div>

        {/* Alertas */}
        {temAlertas && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Alertas
            </h4>
            <div className="space-y-2">
              {produtosUnicos > 0 && (
                <div className="flex items-start gap-2 text-sm p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800">
                    <strong>{produtosUnicos}</strong> produto{produtosUnicos !== 1 ? 's' : ''} sem match no cardápio
                  </span>
                </div>
              )}
              {vendasComPrejuizo.length > 0 && (
                <div className="flex items-start gap-2 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800">
                    <strong>{vendasComPrejuizo.length}</strong> venda{vendasComPrejuizo.length !== 1 ? 's' : ''} com prejuízo (preço &lt; custo)
                  </span>
                </div>
              )}
              {vendasMargemBaixa.length > 0 && (
                <div className="flex items-start gap-2 text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-800">
                    <strong>{vendasMargemBaixa.length}</strong> venda{vendasMargemBaixa.length !== 1 ? 's' : ''} com margem baixa (&lt; 20%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link para Dashboard */}
        <div className="pt-4 border-t">
          <Link href={`/dashboard-gestao?mes=${mesReferencia}`}>
            <Button variant="outline" className="w-full justify-between group hover:bg-purple-50 hover:border-purple-300">
              <span>Ver Dashboard Completo</span>
              <ExternalLink className="h-4 w-4 group-hover:text-purple-600" />
            </Button>
          </Link>
        </div>

        {/* Info sobre custos operacionais */}
        {custosOperacionais > 0 && (
          <div className="text-xs text-gray-500 flex items-center gap-2 pt-2">
            <Wallet className="h-3 w-3" />
            <span>
              Custos operacionais do período: <strong>{formatarMoeda(custosOperacionais)}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
