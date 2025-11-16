import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DadosEvolucao } from "@/utils/dashboardCalculations";
import { PeriodoEvolucao } from "@/hooks/useDashboardData";
import { formatarMoeda } from "@/utils/calculosFinanceiros";

interface EvolucaoFinanceiraProps {
  dados: DadosEvolucao[];
  periodo: PeriodoEvolucao;
  onChangePeriodo: (periodo: PeriodoEvolucao) => void;
  loading?: boolean;
}

const formatPeriodoLabel = (periodo: string, tipoPeriodo: PeriodoEvolucao): string => {
  if (tipoPeriodo === '7D' || tipoPeriodo === '30D') {
    // Formato: YYYY-MM-DD -> DD/MM
    const [ano, mes, dia] = periodo.split('-');
    return `${dia}/${mes}`;
  } else {
    // Formato: YYYY-MM -> Mês/Ano
    const [ano, mes] = periodo.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  }
};

export const EvolucaoFinanceira = ({
  dados,
  periodo,
  onChangePeriodo,
  loading = false
}: EvolucaoFinanceiraProps) => {
  const periodos: { value: PeriodoEvolucao; label: string }[] = [
    { value: '6M', label: '6M' },
    { value: '3M', label: '3M' },
    { value: '30D', label: '30D' },
    { value: '7D', label: '7D' }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse">Carregando evolução...</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const dadosFormatados = dados.map(d => ({
    ...d,
    periodoLabel: formatPeriodoLabel(d.periodo, periodo)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold">{formatarMoeda(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            Evolução Financeira
          </CardTitle>
          <div className="flex gap-2">
            {periodos.map((p) => (
              <Button
                key={p.value}
                variant={periodo === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChangePeriodo(p.value)}
                className={periodo === p.value ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="text-4xl mb-4">-</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Sem dados para o período
            </h3>
            <p className="text-sm text-gray-500">
              Importe vendas para visualizar a evolução financeira
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFormatados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="periodoLabel"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(0)}k`;
                  }
                  return `R$ ${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="lucroLiquido"
                name="Lucro Líquido"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="custoTotal"
                name="Custos Totais"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
