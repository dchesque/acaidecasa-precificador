"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, ArrowRightLeft, Package } from 'lucide-react';
import {
  CustoOperacional,
  CATEGORIAS_CUSTO_SIMPLES_LABELS,
  CATEGORIAS_CUSTO_SIMPLES_ICONS,
  CATEGORIAS_CUSTO_SIMPLES_COLORS
} from '@/types/custos-operacionais';
import {
  formatarMoeda,
  formatarMesReferenciaCompleto
} from '@/utils/custosUtils';

interface CustoVisualizacaoProps {
  custo: CustoOperacional | null;
  onEditar?: () => void;
  onExcluir?: () => void;
  onConverterParaDetalhado?: () => void;
  onConsolidarParaRapido?: () => void;
}

export const CustoVisualizacao: React.FC<CustoVisualizacaoProps> = ({
  custo,
  onEditar,
  onExcluir,
  onConverterParaDetalhado,
  onConsolidarParaRapido
}) => {
  // Estado vazio
  if (!custo) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum custo registrado
            </h3>
            <p className="text-sm text-gray-600">
              Use os botões acima para adicionar custos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // MODO RÁPIDO
  if (custo.tipo === 'RAPIDO') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg">
              Custos de {formatarMesReferenciaCompleto(custo.mesReferencia)}
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              ⚡ Lançamento Rápido (valor único)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Valor Total */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Valor Total</span>
              <span className="text-3xl font-bold text-gray-900">
                {formatarMoeda(custo.valorTotal)}
              </span>
            </div>

            {/* Observações */}
            {custo.observacoes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-600 mb-1">Observações:</p>
                <p className="text-sm text-gray-700">{custo.observacoes}</p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {onEditar && (
              <Button variant="outline" size="sm" onClick={onEditar}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}

            {onConverterParaDetalhado && (
              <Button variant="outline" size="sm" onClick={onConverterParaDetalhado}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Detalhar por Categoria
              </Button>
            )}

            {onExcluir && (
              <Button variant="outline" size="sm" onClick={onExcluir} className="text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // MODO DETALHADO
  if (custo.tipo === 'DETALHADO') {
    const itens = custo.itens || [];
    const total = itens.reduce((acc, item) => acc + item.valor, 0);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg">
              Custos de {formatarMesReferenciaCompleto(custo.mesReferencia)}
            </CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              📊 Lançamento Detalhado ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabela Desktop */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Categoria</TableHead>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="w-[25%] text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      Nenhum custo detalhado registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${CATEGORIAS_CUSTO_SIMPLES_COLORS[item.categoria]}`}>
                            {CATEGORIAS_CUSTO_SIMPLES_ICONS[item.categoria]}{' '}
                            {CATEGORIAS_CUSTO_SIMPLES_LABELS[item.categoria]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatarMoeda(item.valor)}
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {/* Total */}
                {itens.length > 0 && (
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell colSpan={2} className="text-right">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatarMoeda(total)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden space-y-3">
            {itens.length === 0 ? (
              <div className="border rounded-lg p-6 text-center text-gray-500">
                Nenhum custo detalhado registrado
              </div>
            ) : (
              <>
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${CATEGORIAS_CUSTO_SIMPLES_COLORS[item.categoria]}`}>
                        {CATEGORIAS_CUSTO_SIMPLES_ICONS[item.categoria]}{' '}
                        {CATEGORIAS_CUSTO_SIMPLES_LABELS[item.categoria]}
                      </span>
                      <span className="text-lg font-bold">
                        {formatarMoeda(item.valor)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{item.descricao}</p>
                  </div>
                ))}

                {/* Total Mobile */}
                <div className="border-t-2 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatarMoeda(total)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {onEditar && (
              <Button variant="outline" size="sm" onClick={onEditar}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}

            {onConsolidarParaRapido && itens.length > 0 && (
              <Button variant="outline" size="sm" onClick={onConsolidarParaRapido}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Consolidar em Valor Único
              </Button>
            )}

            {onExcluir && (
              <Button variant="outline" size="sm" onClick={onExcluir} className="text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
