"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  CustoOperacional,
  EvolucaoCustos,
  CategoriaCustoSimples,
  CATEGORIAS_CUSTO_SIMPLES_LABELS
} from '@/types/custos-operacionais';
import {
  gerarEvolucaoCustos,
  formatarMoeda,
  abreviarValor
} from '@/utils/custosUtils';

interface EvolucaoCustosGraficoProps {
  custos: CustoOperacional[];
  mesesExibir?: number;
}

type ModoVisualizacao = 'total' | 'categoria';

const CORES_CATEGORIAS: Record<CategoriaCustoSimples, string> = {
  ALUGUEL: '#3B82F6',   // blue-500
  CONTAS: '#EAB308',    // yellow-500
  PESSOAL: '#10B981',   // green-500
  OUTROS: '#6B7280'     // gray-500
};

export const EvolucaoCustosGrafico: React.FC<EvolucaoCustosGraficoProps> = ({
  custos,
  mesesExibir = 6
}) => {
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>('total');

  // Gerar dados de evolução
  const dadosEvolucao = useMemo(() => {
    // Pegar últimos N meses
    const hoje = new Date();
    const mesesReferencia: string[] = [];

    for (let i = mesesExibir - 1; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesRef = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      mesesReferencia.push(mesRef);
    }

    return gerarEvolucaoCustos(custos, mesesReferencia);
  }, [custos, mesesExibir]);

  // Verificar se há dados detalhados
  const temDadosDetalhados = dadosEvolucao.some(d => d.porCategoria);

  // Preparar dados para gráfico stacked (por categoria)
  const dadosStackedChart = useMemo(() => {
    return dadosEvolucao.map(item => {
      const base: Record<string, number | string> = {
        mes: item.mesNome,
        total: item.total
      };

      if (item.porCategoria) {
        Object.entries(item.porCategoria).forEach(([categoria, valor]) => {
          base[categoria] = valor;
        });
      }

      return base;
    });
  }, [dadosEvolucao]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>

          {modoVisualizacao === 'total' ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-700">Total:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatarMoeda(payload[0].value)}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              {payload.map((entry: { value: number; name: string; color: string; dataKey: string }, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">
                    {CATEGORIAS_CUSTO_SIMPLES_LABELS[entry.dataKey as CategoriaCustoSimples] || entry.dataKey}:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatarMoeda(entry.value)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatarMoeda(
                    payload.reduce((acc: number, p: { value: number; name: string; color: string; dataKey: string }) => acc + p.value, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Formatar eixo Y (valores abreviados)
  const formatarEixoY = (value: number) => {
    return `R$ ${abreviarValor(value)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Evolução dos Custos - Últimos {mesesExibir} Meses
          </CardTitle>

          {/* Toggle de Visualização (apenas se houver dados detalhados) */}
          {temDadosDetalhados && (
            <div className="flex gap-2">
              <Badge
                variant={modoVisualizacao === 'total' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setModoVisualizacao('total')}
              >
                Total Mensal
              </Badge>
              <Badge
                variant={modoVisualizacao === 'categoria' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setModoVisualizacao('categoria')}
              >
                Por Categoria
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Gráfico de Linha (Total) */}
        {modoVisualizacao === 'total' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="mesNome"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatarEixoY}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Gráfico de Barras Stacked (Por Categoria) */}
        {modoVisualizacao === 'categoria' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosStackedChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="mes"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatarEixoY}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) =>
                  CATEGORIAS_CUSTO_SIMPLES_LABELS[value as CategoriaCustoSimples] || value
                }
              />

              {/* Barras por Categoria */}
              <Bar dataKey="ALUGUEL" stackId="a" fill={CORES_CATEGORIAS.ALUGUEL} />
              <Bar dataKey="CONTAS" stackId="a" fill={CORES_CATEGORIAS.CONTAS} />
              <Bar dataKey="PESSOAL" stackId="a" fill={CORES_CATEGORIAS.PESSOAL} />
              <Bar dataKey="OUTROS" stackId="a" fill={CORES_CATEGORIAS.OUTROS} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Estado Vazio */}
        {dadosEvolucao.every(d => d.total === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Nenhum custo registrado nos últimos {mesesExibir} meses</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
