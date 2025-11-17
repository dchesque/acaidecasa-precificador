"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  DollarSign,
  TrendingDown,
  BarChart3,
  Package,
  AlertTriangle,
  Upload,
  ExternalLink
} from 'lucide-react';
import {
  CustoOperacional,
  CATEGORIAS_CUSTO_SIMPLES_LABELS,
  CATEGORIAS_CUSTO_SIMPLES_ICONS
} from '@/types/custos-operacionais';
import { VendaRegistrada } from '@/types/analise-vendas';
import {
  calcularTotalCusto,
  contarCustos,
  agruparPorCategoria,
  calcularFaturamentoMes,
  calcularPercentualReceita,
  calcularImpactoLucro,
  formatarMoeda,
  formatarPercentual,
  formatarMesReferenciaCompleto,
  gerarUltimos12Meses
} from '@/utils/custosUtils';

interface CustoResumoCardProps {
  custo: CustoOperacional | null;
  mesReferencia: string;
  vendas: VendaRegistrada[];
  onMesChange: (mes: string) => void;
}

export const CustoResumoCard: React.FC<CustoResumoCardProps> = ({
  custo,
  mesReferencia,
  vendas,
  onMesChange
}) => {
  const meses = useMemo(() => gerarUltimos12Meses(), []);

  // Cálculos principais
  const total = custo ? calcularTotalCusto(custo) : 0;
  const quantidadeCustos = custo ? contarCustos(custo) : 0;
  const faturamento = calcularFaturamentoMes(mesReferencia, vendas);
  const percentualReceita = calcularPercentualReceita(total, faturamento);
  const impacto = calcularImpactoLucro(total);

  // Detalhamento por categoria (se detalhado)
  const custosPorCategoria = useMemo(() => {
    if (!custo || custo.tipo !== 'DETALHADO' || !custo.itens) {
      return null;
    }
    return agruparPorCategoria(custo.itens);
  }, [custo]);

  const temVendas = faturamento > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Período Selecionado
          </CardTitle>

          {/* Badge de Tipo */}
          {custo && (
            <Badge
              variant="outline"
              className={
                custo.tipo === 'RAPIDO'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }
            >
              {custo.tipo === 'RAPIDO' ? '⚡ Lançamento Rápido' : '📊 Lançamento Detalhado'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dropdown de Seleção de Mês */}
        <div className="w-full md:w-1/2">
          <Select value={mesReferencia} onValueChange={onMesChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes} value={mes}>
                  {formatarMesReferenciaCompleto(mes)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerta: Sem Vendas */}
        {!temVendas && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Não há vendas registradas para este mês.{' '}
              <Link
                href="/analise-vendas"
                className="underline font-medium hover:text-amber-900"
              >
                Importe vendas
              </Link>{' '}
              para ver o impacto real dos custos.
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas Principais (Grid 2x2 ou 1x4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Total</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {formatarMoeda(total)}
            </p>
          </div>

          {/* % Receita */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">% Receita</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {percentualReceita !== null
                ? formatarPercentual(percentualReceita)
                : 'N/A'}
            </p>
            {percentualReceita !== null && (
              <p className="text-xs text-blue-600 mt-1">
                de {formatarMoeda(faturamento)}
              </p>
            )}
          </div>

          {/* Impacto no Lucro */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Impacto</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {formatarMoeda(impacto)}
            </p>
          </div>

          {/* Quantidade de Custos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Custos</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">
              {quantidadeCustos}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {quantidadeCustos === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>

        {/* Detalhamento Adaptativo */}
        {custo && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">
              Detalhamento
            </h4>

            {/* MODO RÁPIDO: Mostra Observações */}
            {custo.tipo === 'RAPIDO' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Observações:</p>
                <p className="text-sm text-gray-800">
                  {custo.observacoes || 'Nenhuma observação registrada'}
                </p>
              </div>
            )}

            {/* MODO DETALHADO: Lista Resumo por Categoria */}
            {custo.tipo === 'DETALHADO' && custosPorCategoria && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(custosPorCategoria).map(([categoria, valor]) => {
                  if (valor === 0) return null;

                  const catKey = categoria as keyof typeof CATEGORIAS_CUSTO_SIMPLES_LABELS;

                  return (
                    <div
                      key={categoria}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {CATEGORIAS_CUSTO_SIMPLES_ICONS[catKey]}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {CATEGORIAS_CUSTO_SIMPLES_LABELS[catKey]}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatarMoeda(valor)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODO DETALHADO: Sem Itens */}
            {custo.tipo === 'DETALHADO' && (!custo.itens || custo.itens.length === 0) && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  Nenhum custo detalhado registrado
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sem Custos */}
        {!custo && (
          <div className="border-t pt-4">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Nenhum custo registrado para este mês
              </p>
            </div>
          </div>
        )}

        {/* Link de Navegação */}
        <div className="border-t pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard-gestao">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Impacto no Dashboard de Gestão
              <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
