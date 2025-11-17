"use client";

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import {
  CustoOperacional,
  CATEGORIAS_CUSTO_SIMPLES_LABELS,
  CATEGORIAS_CUSTO_SIMPLES_ICONS
} from '@/types/custos-operacionais';
import {
  agruparPorCategoria,
  gerarObservacoesConsolidacao,
  formatarMoeda,
  formatarMesReferenciaCompleto,
  validarObservacoes
} from '@/utils/custosUtils';

interface ConsolidarDetalhadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  custo: CustoOperacional;
  onConfirm: (observacoes: string) => void;
}

export const ConsolidarDetalhadoModal: React.FC<ConsolidarDetalhadoModalProps> = ({
  isOpen,
  onClose,
  custo,
  onConfirm
}) => {
  const [observacoes, setObservacoes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Inicializar observações quando modal abre
  React.useEffect(() => {
    if (isOpen && custo.tipo === 'DETALHADO' && custo.itens) {
      const obsGeradas = gerarObservacoesConsolidacao(custo.itens);
      setObservacoes(obsGeradas);
    }
  }, [isOpen, custo]);

  // Calcular resumo por categoria
  const custosPorCategoria = useMemo(() => {
    if (custo.tipo !== 'DETALHADO' || !custo.itens) {
      return null;
    }
    return agruparPorCategoria(custo.itens);
  }, [custo]);

  const totalGeral = useMemo(() => {
    if (!custo.itens) return 0;
    return custo.itens.reduce((acc, item) => acc + item.valor, 0);
  }, [custo]);

  const quantidadeItens = custo.itens?.length || 0;

  // Validação
  const validacao = validarObservacoes(observacoes);
  const podeConfirmar = validacao.valido && !loading;

  // Submeter
  const handleSubmit = async () => {
    if (!podeConfirmar) {
      return;
    }

    setLoading(true);

    try {
      onConfirm(observacoes.trim());
      onClose();
    } catch (error) {
      console.error('Erro ao consolidar custo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (custo.tipo !== 'DETALHADO') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚡ Consolidar em Valor Único
          </DialogTitle>
          <DialogDescription>
            Transformar lançamento detalhado em lançamento rápido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo dos Custos Atuais */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">
              Você tem {quantidadeItens} custo{quantidadeItens !== 1 ? 's' : ''} detalhado{quantidadeItens !== 1 ? 's' : ''}:
            </h4>

            {custosPorCategoria && (
              <div className="space-y-2">
                {Object.entries(custosPorCategoria).map(([categoria, valor]) => {
                  if (valor === 0) return null;

                  const catKey = categoria as keyof typeof CATEGORIAS_CUSTO_SIMPLES_LABELS;

                  // Contar quantos itens dessa categoria
                  const quantidadeCategoria = custo.itens?.filter(
                    item => item.categoria === categoria
                  ).length || 0;

                  return (
                    <div
                      key={categoria}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{CATEGORIAS_CUSTO_SIMPLES_ICONS[catKey]}</span>
                        <span className="text-purple-800">
                          {CATEGORIAS_CUSTO_SIMPLES_LABELS[catKey]}
                          {quantidadeCategoria > 1 && ` (${quantidadeCategoria})`}:
                        </span>
                      </div>
                      <span className="font-bold text-purple-900">
                        {formatarMoeda(valor)}
                      </span>
                    </div>
                  );
                })}

                <div className="border-t border-purple-300 pt-2 mt-2 flex items-center justify-between">
                  <span className="font-semibold text-purple-900">Total:</span>
                  <span className="text-lg font-bold text-purple-900">
                    {formatarMoeda(totalGeral)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="Ex: Custos consolidados de aluguel, contas e pessoal"
              className={validacao.valido ? '' : 'border-red-500'}
            />
            <div className="flex justify-between items-center">
              {!validacao.valido && validacao.erro ? (
                <p className="text-sm text-red-600">{validacao.erro}</p>
              ) : (
                <p className="text-xs text-gray-500">Máximo: 200 caracteres</p>
              )}
              <p className="text-xs text-gray-500">{observacoes.length}/200</p>
            </div>
          </div>

          {/* Alerta de Perda de Dados */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>ATENÇÃO:</strong> Você perderá o detalhamento por categoria.
              Esta ação <strong>NÃO pode ser desfeita automaticamente</strong>.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!podeConfirmar}
            variant="destructive"
          >
            {loading ? 'Consolidando...' : 'Confirmar Consolidação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
