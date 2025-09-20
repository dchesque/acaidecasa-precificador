"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Link2,
  AlertTriangle,
  TrendingDown,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { VendaRegistrada } from '@/types/analise-vendas';
import { formatarMoeda, formatarPercentual, formatarData } from '@/utils/vendasCalculations';

interface VendasTableProps {
  vendas: VendaRegistrada[];
  onViewDetails?: (venda: VendaRegistrada) => void;
  onResolveMatch?: (venda: VendaRegistrada) => void;
  onAcceptDivergence?: (venda: VendaRegistrada) => void;
  loading?: boolean;
}

export const VendasTable: React.FC<VendasTableProps> = ({
  vendas,
  onViewDetails,
  onResolveMatch,
  onAcceptDivergence,
  loading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(vendas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendas = vendas.slice(startIndex, endIndex);

  const getStatusBadge = (status: VendaRegistrada['statusAnalise']) => {
    switch (status) {
      case 'ok':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1" />
            OK
          </Badge>
        );
      case 'divergencia':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Divergência
          </Badge>
        );
      case 'prejuizo':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <TrendingDown className="h-3 w-3 mr-1" />
            Prejuízo
          </Badge>
        );
    }
  };

  const getMatchBadge = (status: VendaRegistrada['statusMatch']) => {
    switch (status) {
      case 'matched':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            Vinculado
          </Badge>
        );
      case 'not_found':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            Não encontrado
          </Badge>
        );
      case 'manual':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            Manual
          </Badge>
        );
    }
  };

  const formatarDivergencia = (valor: number, percentual: number) => {
    if (Math.abs(percentual) < 0.01) return '-';

    const cor = valor > 0 ? 'text-green-600' : 'text-red-600';
    const sinal = valor > 0 ? '+' : '';

    return (
      <div className={`font-medium ${cor}`}>
        {sinal}{formatarMoeda(valor)}
        <span className="text-xs ml-1">
          ({sinal}{formatarPercentual(percentual)})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (vendas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p>Nenhuma venda encontrada com os filtros selecionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-right">Preço Vendido</TableHead>
              <TableHead className="text-right">Preço Cardápio</TableHead>
              <TableHead className="text-right">Divergência</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVendas.map((venda) => (
              <TableRow key={venda.id}>
                <TableCell className="font-medium">
                  {formatarData(venda.dataVenda)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {venda.itemCardapioNome || venda.produtoNome}
                    </div>
                    {venda.vendedor && (
                      <div className="text-xs text-gray-500">
                        Vendedor: {venda.vendedor}
                      </div>
                    )}
                    {venda.statusMatch === 'not_found' && (
                      <div className="flex items-center gap-2">
                        {getMatchBadge(venda.statusMatch)}
                        {onResolveMatch && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => onResolveMatch(venda)}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Vincular
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {venda.quantidade}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(venda.precoTotalVendido)}
                  {venda.quantidade > 1 && (
                    <div className="text-xs text-gray-500">
                      {formatarMoeda(venda.precoUnitarioVendido)}/un
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {venda.precoCardapio > 0 ? (
                    <>
                      {formatarMoeda(venda.precoCardapio * venda.quantidade)}
                      {venda.quantidade > 1 && (
                        <div className="text-xs text-gray-500">
                          {formatarMoeda(venda.precoCardapio)}/un
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatarDivergencia(venda.divergenciaValor, venda.divergenciaPercentual)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={venda.lucroBrutoReal >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatarMoeda(venda.lucroBrutoReal)}
                  </div>
                  {venda.lucroBrutoEsperado > 0 && Math.abs(venda.lucroBrutoReal - venda.lucroBrutoEsperado) > 0.01 && (
                    <div className="text-xs text-gray-500">
                      esp: {formatarMoeda(venda.lucroBrutoEsperado)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className={venda.margemReal >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatarPercentual(venda.margemReal)}
                  </div>
                  {venda.margemEsperada > 0 && Math.abs(venda.margemReal - venda.margemEsperada) > 0.01 && (
                    <div className="text-xs text-gray-500">
                      esp: {formatarPercentual(venda.margemEsperada)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(venda.statusAnalise)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(venda)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, vendas.length)} de {vendas.length} vendas
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};