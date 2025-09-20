"use client";

import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { VendaRegistrada } from '@/types/analise-vendas';
import { formatarMoeda, formatarPercentual, formatarData } from '@/utils/vendasCalculations';

interface VendasAceitarDivergenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaRegistrada | null;
  onConfirm: (vendaId: string, motivo: string) => void;
}

export const VendasAceitarDivergenciaModal: React.FC<VendasAceitarDivergenciaModalProps> = ({
  isOpen,
  onClose,
  venda,
  onConfirm
}) => {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');

  const handleClose = () => {
    setMotivo('');
    setErro('');
    onClose();
  };

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setErro('Por favor, informe o motivo da divergência');
      return;
    }

    if (motivo.trim().length < 10) {
      setErro('O motivo deve ter pelo menos 10 caracteres');
      return;
    }

    if (venda) {
      onConfirm(venda.id, motivo.trim());
      handleClose();
    }
  };

  if (!venda) return null;

  const isLoss = venda.statusAnalise === 'prejuizo';
  const divergenciaPercent = Math.abs(venda.divergenciaPercentual);

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Aceitar Divergência"
      size="md"
    >
      <div className="space-y-4">
        {/* Alerta sobre o tipo de divergência */}
        <Alert className={isLoss ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertTriangle className={`h-4 w-4 ${isLoss ? 'text-red-600' : 'text-yellow-600'}`} />
          <AlertDescription className={isLoss ? 'text-red-800' : 'text-yellow-800'}>
            {isLoss ? (
              <>
                <strong>Atenção!</strong> Esta venda foi realizada com prejuízo.
                A margem está negativa em {formatarPercentual(Math.abs(venda.margemReal))}.
              </>
            ) : (
              <>
                Esta venda apresenta uma divergência de {formatarPercentual(divergenciaPercent)}
                em relação ao preço do cardápio.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Informações da Venda */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="text-sm font-medium">{formatarData(venda.dataVenda)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Vendedor</p>
                <p className="text-sm font-medium">{venda.vendedor || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Produto</p>
              <p className="text-sm font-medium">{venda.produtoNome}</p>
              <p className="text-xs text-gray-400">Quantidade: {venda.quantidade}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-500">Preço Vendido</p>
              <p className={`text-sm font-semibold ${venda.divergenciaValor < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatarMoeda(venda.precoTotalVendido)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Preço Cardápio</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatarMoeda(venda.precoCardapio * venda.quantidade)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Diferença</p>
              <p className={`text-sm font-semibold ${venda.divergenciaValor < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {venda.divergenciaValor > 0 ? '+' : ''}{formatarMoeda(venda.divergenciaValor * venda.quantidade)}
              </p>
            </div>
          </div>
        </div>

        {/* Campo de Motivo */}
        <div className="space-y-2">
          <Label htmlFor="motivo" className="text-sm font-medium">
            Motivo da Divergência <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="motivo"
            placeholder="Ex: Desconto especial para cliente VIP, Promoção do dia, Erro de precificação, etc..."
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              setErro('');
            }}
            className={`min-h-[100px] ${erro ? 'border-red-500' : ''}`}
          />
          {erro && (
            <p className="text-sm text-red-600">{erro}</p>
          )}
          <p className="text-xs text-gray-500">
            Explique o motivo desta divergência para registro e análise futura.
          </p>
        </div>

        {/* Sugestões de motivos comuns */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Motivos comuns:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Desconto para cliente',
              'Promoção especial',
              'Erro de lançamento',
              'Cortesia parcial',
              'Negociação especial'
            ].map((sugestao) => (
              <Badge
                key={sugestao}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setMotivo(sugestao)}
              >
                {sugestao}
              </Badge>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aceitar Divergência
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};