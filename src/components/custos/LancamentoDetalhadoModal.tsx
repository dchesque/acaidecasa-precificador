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
import { Label } from '@/components/ui/label';
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
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import {
  CustoOperacional,
  CustoOperacionalDetalhadoInput,
  CustoItemInput,
  CategoriaCustoSimples,
  CATEGORIAS_CUSTO_SIMPLES_LABELS,
  CATEGORIAS_CUSTO_SIMPLES_ICONS
} from '@/types/custos-operacionais';
import {
  gerarUltimos12Meses,
  formatarMesReferenciaCompleto,
  validarCustoItem,
  formatarMoeda,
  calcularTotalCusto,
  contarCustos
} from '@/utils/custosUtils';

interface LinhaItem extends CustoItemInput {
  tempId: string;
}

interface LancamentoDetalhadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (input: CustoOperacionalDetalhadoInput) => void;
  custoExistente?: CustoOperacional;
  custosExistentesPorMes: Map<string, CustoOperacional>;
}

export const LancamentoDetalhadoModal: React.FC<LancamentoDetalhadoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  custoExistente,
  custosExistentesPorMes
}) => {
  const meses = gerarUltimos12Meses();

  // Form state
  const [mesReferencia, setMesReferencia] = useState<string>('');
  const [itens, setItens] = useState<LinhaItem[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (custoExistente && custoExistente.tipo === 'DETALHADO' && custoExistente.itens) {
        // Modo edição - carregar itens existentes
        setMesReferencia(custoExistente.mesReferencia);
        setItens(
          custoExistente.itens.map((item, idx) => ({
            tempId: `existing-${idx}`,
            categoria: item.categoria,
            descricao: item.descricao,
            valor: item.valor
          }))
        );
      } else {
        // Modo criação - sugerir mês atual e 1 linha vazia
        const mesAtual = new Date();
        const mesRef = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
        setMesReferencia(mesRef);
        setItens([criarLinhaVazia()]);
      }
    }
  }, [isOpen, custoExistente]);

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
  const totalGeral = itens.reduce((acc, item) => acc + (item.valor || 0), 0);

  // Verificar se já existe custo para o mês selecionado
  const custoExistenteNoMes = mesReferencia && !custoExistente
    ? custosExistentesPorMes.get(mesReferencia)
    : null;

  const quantidadeCustosExistentes = custoExistenteNoMes
    ? contarCustos(custoExistenteNoMes)
    : 0;

  const totalCustoExistente = custoExistenteNoMes
    ? calcularTotalCusto(custoExistenteNoMes)
    : 0;

  // Validar item individual
  const validarItem = (item: LinhaItem): boolean => {
    const validacao = validarCustoItem(item);
    return validacao.valido;
  };

  // Contar itens válidos
  const itensValidos = itens.filter(validarItem);
  const quantidadeValidos = itensValidos.length;

  // Pode enviar se tem pelo menos 1 item válido
  const podeEnviar = mesReferencia && quantidadeValidos > 0 && !loading;

  // Submeter formulário
  const handleSubmit = async () => {
    if (!podeEnviar) {
      return;
    }

    setLoading(true);

    try {
      const input: CustoOperacionalDetalhadoInput = {
        mesReferencia,
        itens: itensValidos.map(({ tempId, ...item }) => ({
          categoria: item.categoria,
          descricao: item.descricao,
          valor: item.valor
        }))
      };

      onConfirm(input);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar custos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Lançamento Detalhado de Custos
          </DialogTitle>
          <DialogDescription>
            Registre custos separados por categoria para análise detalhada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleção de Mês */}
          <div className="space-y-2">
            <Label htmlFor="mes">Selecione o Mês *</Label>
            <Select
              value={mesReferencia}
              onValueChange={setMesReferencia}
              disabled={!!custoExistente}
            >
              <SelectTrigger id="mes">
                <SelectValue placeholder="Escolha um mês" />
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

          {/* Alerta: Custo Existente */}
          {custoExistenteNoMes && (
            <Alert variant="default" className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Você já tem {quantidadeCustosExistentes} custo(s) para este mês (
                {formatarMoeda(totalCustoExistente)}). Adicionar aqui irá{' '}
                <strong>MESCLAR</strong> com os existentes.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabela de Custos */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
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
                  {itens.map((item, index) => {
                    const isValido = validarItem(item);

                    return (
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
                                        {
                                          CATEGORIAS_CUSTO_SIMPLES_ICONS[
                                            key as CategoriaCustoSimples
                                          ]
                                        }
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
                            placeholder="Ex: Aluguel Loja Centro"
                            value={item.descricao}
                            onChange={(e) =>
                              handleAtualizarLinha(
                                item.tempId,
                                'descricao',
                                e.target.value
                              )
                            }
                            maxLength={100}
                            className={
                              item.descricao.trim().length < 2 && item.descricao.length > 0
                                ? 'border-amber-300'
                                : ''
                            }
                          />
                        </TableCell>

                        {/* Valor */}
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={item.valor || ''}
                            onChange={(e) =>
                              handleAtualizarLinha(
                                item.tempId,
                                'valor',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={
                              item.valor <= 0 && item.valor !== 0
                                ? 'border-amber-300'
                                : ''
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Botão Adicionar Linha + Total */}
            <div className="border-t p-3 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdicionarLinha}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Linha
              </Button>

              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatarMoeda(totalGeral)}
                </p>
              </div>
            </div>
          </div>

          {/* Validação em Tempo Real */}
          {itens.length > 0 && quantidadeValidos < itens.length && (
            <Alert variant="default" className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                {itens.length - quantidadeValidos} linha(s) com dados incompletos.
                Preencha todos os campos corretamente.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-600">
              {quantidadeValidos} custo(s) válido(s)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!podeEnviar}>
                {loading
                  ? 'Salvando...'
                  : `Salvar ${quantidadeValidos} custo${quantidadeValidos !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
