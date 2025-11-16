import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";
import { formatarMoeda, formatarPercentual } from "@/utils/calculosFinanceiros";
import { SaudeFinanceira as SaudeFinanceiraType } from "@/utils/dashboardCalculations";
import { PeriodoImportacao } from "@/types/periodo";
import { formatarPeriodoDisplay } from "@/utils/periodoUtils";

interface SaudeFinanceiraProps {
  dados: SaudeFinanceiraType;
  periodo: PeriodoImportacao;
  loading?: boolean;
}

export const SaudeFinanceira = ({ dados, periodo, loading = false }: SaudeFinanceiraProps) => {
  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="animate-pulse">Carregando...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const { lucroLiquido, margemLiquida, faturamento, meta, percentualMeta, comparacaoMesAnterior } = dados;

  // Definir cores com base nos valores
  const lucroColor = lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600';
  const lucroBgColor = lucroLiquido >= 0 ? 'bg-green-50' : 'bg-red-50';

  const margemColor = margemLiquida >= 30 ? 'text-green-600' : margemLiquida >= 15 ? 'text-yellow-600' : 'text-red-600';
  const margemBgColor = margemLiquida >= 30 ? 'bg-green-50' : margemLiquida >= 15 ? 'bg-yellow-50' : 'bg-red-50';

  const metaColor = percentualMeta >= 100 ? 'text-green-600' : percentualMeta >= 80 ? 'text-yellow-600' : 'text-red-600';
  const metaBgColor = percentualMeta >= 100 ? 'bg-green-50' : percentualMeta >= 80 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          Saúde Financeira
          <Badge variant="outline" className="text-sm font-normal">
            {formatarPeriodoDisplay(periodo)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lucro Líquido */}
          <div className={`${lucroBgColor} rounded-lg p-4 border ${lucroLiquido >= 0 ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Lucro Líquido</span>
              {comparacaoMesAnterior.lucroLiquido !== 0 && (
                <div className="flex items-center gap-1">
                  {comparacaoMesAnterior.lucroLiquido > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${comparacaoMesAnterior.lucroLiquido > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(comparacaoMesAnterior.lucroLiquido).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`text-3xl md:text-4xl font-bold ${lucroColor}`}>
              {formatarMoeda(lucroLiquido)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              vs. mês anterior
            </div>
          </div>

          {/* Margem Líquida */}
          <div className={`${margemBgColor} rounded-lg p-4 border ${margemLiquida >= 30 ? 'border-green-200' : margemLiquida >= 15 ? 'border-yellow-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Margem Líquida</span>
              {comparacaoMesAnterior.margemLiquida !== 0 && (
                <div className="flex items-center gap-1">
                  {comparacaoMesAnterior.margemLiquida > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${comparacaoMesAnterior.margemLiquida > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(comparacaoMesAnterior.margemLiquida).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`text-3xl md:text-4xl font-bold ${margemColor}`}>
              {formatarPercentual(margemLiquida)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {margemLiquida >= 30 ? 'Excelente' : margemLiquida >= 15 ? 'Regular' : 'Abaixo do ideal'}
            </div>
          </div>

          {/* Meta Atingida */}
          <div className={`${metaBgColor} rounded-lg p-4 border ${percentualMeta >= 100 ? 'border-green-200' : percentualMeta >= 80 ? 'border-yellow-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Meta Atingida</span>
              {percentualMeta >= 100 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            <div className={`text-3xl md:text-4xl font-bold ${metaColor}`}>
              {percentualMeta.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {percentualMeta >= 100 ? 'Meta superada!' : 'Em progresso'}
            </div>
          </div>
        </div>

        {/* Barra de Progresso da Meta */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Faturamento</span>
            <span className="font-semibold">
              {formatarMoeda(faturamento)} / {formatarMoeda(meta)}
            </span>
          </div>
          <Progress
            value={Math.min(percentualMeta, 100)}
            className="h-3"
            // @ts-ignore
            indicatorClassName={percentualMeta >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}
          />
          {percentualMeta > 100 && (
            <div className="text-xs text-green-600 font-medium text-right">
              +{formatarMoeda(faturamento - meta)} acima da meta
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
