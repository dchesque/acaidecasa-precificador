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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import {
  CustoOperacional,
  CustoOperacionalRapidoInput
} from '@/types/custos-operacionais';
import {
  gerarUltimos12Meses,
  formatarMesReferenciaCompleto,
  validarValorCusto,
  validarObservacoes,
  formatarMoeda,
  calcularTotalCusto
} from '@/utils/custosUtils';

interface LancamentoRapidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (input: CustoOperacionalRapidoInput) => void;
  custoExistente?: CustoOperacional;
  custosExistentesPorMes: Map<string, CustoOperacional>;
}

export const LancamentoRapidoModal: React.FC<LancamentoRapidoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  custoExistente,
  custosExistentesPorMes
}) => {
  const meses = gerarUltimos12Meses();

  // Form state
  const [mesReferencia, setMesReferencia] = useState<string>('');
  const [valorTotal, setValorTotal] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  // Validation state
  const [erroValor, setErroValor] = useState<string>('');
  const [erroObservacoes, setErroObservacoes] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (custoExistente) {
        // Modo edição
        setMesReferencia(custoExistente.mesReferencia);
        setValorTotal(custoExistente.valorTotal.toString());
        setObservacoes(custoExistente.observacoes || '');
      } else {
        // Modo criação - sugerir mês atual
        const mesAtual = new Date();
        const mesRef = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
        setMesReferencia(mesRef);
        setValorTotal('');
        setObservacoes('');
      }
      setErroValor('');
      setErroObservacoes('');
    }
  }, [isOpen, custoExistente]);

  // Validação em tempo real do valor
  const handleValorChange = (value: string) => {
    setValorTotal(value);

    // Limpar erro ao digitar
    if (erroValor) {
      setErroValor('');
    }

    // Validar se valor é numérico
    const numero = parseFloat(value);
    if (value && isNaN(numero)) {
      setErroValor('Digite um valor numérico válido');
    }
  };

  // Validação em tempo real das observações
  const handleObservacoesChange = (value: string) => {
    setObservacoes(value);

    const validacao = validarObservacoes(value);
    if (!validacao.valido && validacao.erro) {
      setErroObservacoes(validacao.erro);
    } else {
      setErroObservacoes('');
    }
  };

  // Verificar se já existe custo para o mês selecionado
  const custoExistenteNoMes = mesReferencia && !custoExistente
    ? custosExistentesPorMes.get(mesReferencia)
    : null;

  const totalCustoExistente = custoExistenteNoMes
    ? calcularTotalCusto(custoExistenteNoMes)
    : 0;

  // Validação final antes de salvar
  const validarFormulario = (): boolean => {
    let valido = true;

    // Validar mês
    if (!mesReferencia) {
      valido = false;
    }

    // Validar valor
    const numero = parseFloat(valorTotal);
    const validacaoValor = validarValorCusto(numero);
    if (!validacaoValor.valido && validacaoValor.erro) {
      setErroValor(validacaoValor.erro);
      valido = false;
    }

    // Validar observações
    const validacaoObs = validarObservacoes(observacoes);
    if (!validacaoObs.valido && validacaoObs.erro) {
      setErroObservacoes(validacaoObs.erro);
      valido = false;
    }

    return valido;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const input: CustoOperacionalRapidoInput = {
        mesReferencia,
        valorTotal: parseFloat(valorTotal),
        observacoes: observacoes.trim() || undefined
      };

      onConfirm(input);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Habilitar botão de salvar
  const podeEnviar = mesReferencia && valorTotal && !erroValor && !erroObservacoes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚡ Lançamento Rápido de Custos
          </DialogTitle>
          <DialogDescription>
            Registre o valor total dos custos do mês em segundos
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
            <Alert variant="default" className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Você já tem custos para este mês ({formatarMoeda(totalCustoExistente)}).
                Adicionar aqui irá <strong>SUBSTITUIR</strong> o valor anterior.
              </AlertDescription>
            </Alert>
          )}

          {/* Valor Total */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total dos Custos *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valorTotal}
                onChange={(e) => handleValorChange(e.target.value)}
                className={`pl-10 ${erroValor ? 'border-red-500' : ''}`}
              />
            </div>
            {erroValor && (
              <p className="text-sm text-red-600">{erroValor}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Ex: Aluguel + contas + salários"
              value={observacoes}
              onChange={(e) => handleObservacoesChange(e.target.value)}
              maxLength={200}
              rows={3}
              className={erroObservacoes ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {erroObservacoes ? (
                <p className="text-sm text-red-600">{erroObservacoes}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Máximo: 200 caracteres
                </p>
              )}
              <p className="text-xs text-gray-500">
                {observacoes.length}/200
              </p>
            </div>
          </div>

          {/* Dica */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Dica:</strong> Use o Lançamento Detalhado se quiser analisar
              seus custos por categoria depois.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!podeEnviar || loading}>
            {loading ? 'Salvando...' : custoExistente ? 'Atualizar Custo' : 'Salvar Custo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
