"use client";

import React from 'react';
import { BaseModal } from './BaseModal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  User,
  AlertTriangle,
  Check,
  TrendingDown,
  Hash
} from 'lucide-react';
import { VendaRegistrada } from '@/types/analise-vendas';
import { formatarMoeda, formatarPercentual, formatarData } from '@/utils/vendasCalculations';

interface VendasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaRegistrada | null;
}

export const VendasDetailModal: React.FC<VendasDetailModalProps> = ({
  isOpen,
  onClose,
  venda
}) => {
  if (!venda) return null;

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

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Detalhes da Venda"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header com Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusBadge(venda.statusAnalise)}
            {getMatchBadge(venda.statusMatch)}
          </div>
          <div className="text-sm text-gray-500">
            ID: {venda.id}
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data da Venda</p>
                <p className="font-medium">{formatarData(venda.dataVenda)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Produto</p>
                <p className="font-medium">{venda.itemCardapioNome || venda.produtoNome}</p>
                {venda.produtoErpId && (
                  <p className="text-xs text-gray-400">SKU: {venda.produtoErpId}</p>
                )}
              </div>
            </div>

            {venda.vendedor && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Vendedor</p>
                  <p className="font-medium">{venda.vendedor}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Quantidade</p>
                <p className="font-medium">{venda.quantidade} {venda.quantidade > 1 ? 'unidades' : 'unidade'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Valor Total</p>
                <p className="font-medium">{formatarMoeda(venda.precoTotalVendido)}</p>
                {venda.quantidade > 1 && (
                  <p className="text-xs text-gray-400">
                    {formatarMoeda(venda.precoUnitarioVendido)} / unidade
                  </p>
                )}
              </div>
            </div>

            {venda.vendaErpId && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">ID no ERP</p>
                  <p className="font-medium">{venda.vendaErpId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Análise Financeira */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Análise Financeira</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Preço Vendido</p>
              <p className="font-semibold text-lg">{formatarMoeda(venda.precoTotalVendido)}</p>
              {venda.quantidade > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatarMoeda(venda.precoUnitarioVendido)} por unidade
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Preço Cardápio</p>
              <p className="font-semibold text-lg">
                {venda.precoCardapio > 0
                  ? formatarMoeda(venda.precoCardapio * venda.quantidade)
                  : '-'
                }
              </p>
              {venda.precoCardapio > 0 && venda.quantidade > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatarMoeda(venda.precoCardapio)} por unidade
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Custo</p>
              <p className="font-semibold text-lg">{formatarMoeda(venda.custoCalculado)}</p>
              {venda.quantidade > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatarMoeda(venda.custoCalculado / venda.quantidade)} por unidade
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Divergência</p>
              <p className={`font-semibold text-lg ${
                venda.divergenciaValor > 0 ? 'text-green-600' :
                venda.divergenciaValor < 0 ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {venda.divergenciaValor !== 0
                  ? `${venda.divergenciaValor > 0 ? '+' : ''}${formatarMoeda(venda.divergenciaValor)}`
                  : '-'
                }
              </p>
              {venda.divergenciaPercentual !== 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {venda.divergenciaPercentual > 0 ? '+' : ''}{formatarPercentual(venda.divergenciaPercentual)}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Métricas de Desempenho */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Métricas de Desempenho</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Lucro Bruto Real</span>
                <span className={`font-semibold ${
                  venda.lucroBrutoReal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatarMoeda(venda.lucroBrutoReal)}
                </span>
              </div>
              {venda.lucroBrutoEsperado > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Esperado</span>
                  <span className="text-gray-500">
                    {formatarMoeda(venda.lucroBrutoEsperado)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Margem Real</span>
                <span className={`font-semibold ${
                  venda.margemReal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatarPercentual(venda.margemReal)}
                </span>
              </div>
              {venda.margemEsperada > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Esperada</span>
                  <span className="text-gray-500">
                    {formatarPercentual(venda.margemEsperada)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {venda.observacoes && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Observações</h3>
              <p className="text-sm text-gray-600">{venda.observacoes}</p>
            </div>
          </>
        )}

        {/* Informações de Importação */}
        <Separator />
        <div className="text-xs text-gray-500">
          <p>Importação ID: {venda.importacaoId}</p>
        </div>
      </div>
    </BaseModal>
  );
};