"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus, Trash2, CheckCircle } from 'lucide-react';
import {
  CustoOperacional,
  CustoItemInput,
  CategoriaCustoSimples,
  CATEGORIAS_CUSTO_SIMPLES_LABELS,
  CATEGORIAS_CUSTO_SIMPLES_ICONS
} from '@/types/custos-operacionais';
import {
  sugerirDivisaoCategorias,
  validarSomaItens,
  formatarMoeda,
  formatarMesReferenciaCompleto
} from '@/utils/custosUtils';

interface LinhaItem extends CustoItemInput {
  tempId: string;
}

interface ConversaoRapidoParaDetalhadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  custo: CustoOperacional;
  onConfirm: (itens: CustoItemInput[]) => void;
}

export const ConversaoRapidoParaDetalhadoModal: React.FC<ConversaoRapidoParaDetalhadoModalProps> = ({
  isOpen,
  onClose,
  custo,
  onConfirm
}) => {
  const [itens, setItens] = useState<LinhaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Inicializar com sugestões
  useEffect(() => {
    if (isOpen && custo.tipo === 'RAPIDO') {
      const sugestoes = sugerirDivisaoCategorias(custo.valorTotal, custo.observacoes);
      setItens(
        sugestoes.map((item, idx) => ({
          ...item,
          tempId: `sugestao-${idx}`
        }))
      );
    }
  }, [isOpen, custo]);

  // Criar linha vazia
  const criarLinhaVazia = (): LinhaItem => ({
    tempId: `temp-${Date.now()}-${Math.random()}`,
    categoria: 'ALUGUEL',
    descricao: '',
    valor: 0
  });

  // Adicionar nova linha
  const handleAdicionarLinha = () => {
    setItens([...itens, criarLinhaVazia()]);
  };

  // Remover linha
  const handleRemoverLinha = (tempId: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.tempId !== tempId));
    }
  };

  // Atualizar campo de uma linha
  const handleAtualizarLinha = (
    tempId: string,
    campo: keyof CustoItemInput,
    valor: any
  ) => {
    setItens(
      itens.map(item =>
        item.tempId === tempId ? { ...item, [campo]: valor } : item
      )
    );
  };

  // Calcular total
  const totalAtual = itens.reduce((acc, item) => acc + (item.valor || 0), 0);
  const totalOriginal = custo.valorTotal;

  // Validar se soma bate
  const { valido: somaBate, diferenca } = validarSomaItens(itens, totalOriginal);

  // Verificar se todos itens são válidos
  const itensCompletos = itens.every(
    item => item.descricao.trim().length >= 2 && item.valor > 0
  );

  const podeConfirmar = itensCompletos && somaBate && !loading;

  // Submeter
  const handleSubmit = async () => {
    if (!podeConfirmar) {
      return;
    }

    setLoading(true);

    try {
      onConfirm(itens.map(({ tempId, ...item }) => item));
      onClose();
    } catch (error) {
      console.error('Erro ao converter custo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (custo.tipo !== 'RAPIDO') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Detalhar Custos de {formatarMesReferenciaCompleto(custo.mesReferencia)}
          </DialogTitle>
          <DialogDescription>
            Divida o valor total em categorias para análise detalhada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo do Custo Original */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Lançamento Rápido Atual</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-blue-800">Valor Total:</span>
                <span className="font-bold text-blue-900">{formatarMoeda(totalOriginal)}</span>
              </div>
              {custo.observacoes && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <span className="text-sm text-blue-800">Observações:</span>
                  <p className="text-sm text-blue-900 italic">{custo.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Instrução */}
          <Alert className="border-purple-200 bg-purple-50">
            <AlertDescription className="text-purple-800 text-sm">
              Ajuste os valores sugeridos abaixo. O <strong>total deve ser igual a {formatarMoeda(totalOriginal)}</strong>.
            </AlertDescription>
          </Alert>

          {/* Tabela de Itens */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Categoria</TableHead>
                  <TableHead className="w-[35%]">Descrição</TableHead>
                  <TableHead className="w-[25%]">Valor (R$)</TableHead>
                  <TableHead className="w-[10%]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.tempId}>
                    {/* Categoria */}
                    <TableCell>
                      <Select
                        value={item.categoria}
                        onValueChange={(value) =>
                          handleAtualizarLinha(
                            item.tempId,
                            'categoria',
                            value as CategoriaCustoSimples
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORIAS_CUSTO_SIMPLES_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {CATEGORIAS_CUSTO_SIMPLES_ICONS[key as CategoriaCustoSimples]}
                                  </span>
                                  <span>{label}</span>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Descrição */}
                    <TableCell>
                      <Input
                        placeholder="Ex: Aluguel Loja"
                        value={item.descricao}
                        onChange={(e) =>
                          handleAtualizarLinha(item.tempId, 'descricao', e.target.value)
                        }
                        maxLength={100}
                      />
                    </TableCell>

                    {/* Valor */}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valor || ''}
                        onChange={(e) =>
                          handleAtualizarLinha(
                            item.tempId,
                            'valor',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </TableCell>

                    {/* Ação */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverLinha(item.tempId)}
                        disabled={itens.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer: Adicionar Linha + Total */}
            <div className="border-t p-3 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleAdicionarLinha}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Linha
              </Button>

              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className={`text-xl font-bold ${somaBate ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(totalAtual)}
                  {somaBate && <CheckCircle className="inline h-5 w-5 ml-2" />}
                </p>
                {!somaBate && diferenca > 0.01 && (
                  <p className="text-xs text-red-600">
                    Diferença: {formatarMoeda(Math.abs(totalAtual - totalOriginal))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Alerta: Ação Irreversível */}
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Atenção:</strong> Ao confirmar, o lançamento rápido será{' '}
              <strong>substituído</strong> pelo detalhado.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!podeConfirmar}>
            {loading ? 'Convertendo...' : 'Confirmar Detalhamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
