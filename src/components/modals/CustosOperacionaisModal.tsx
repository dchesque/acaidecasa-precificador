"use client";

import React, { useState, useCallback } from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  DollarSign,
  Receipt
} from 'lucide-react';
import {
  CustosOperacionaisModalProps,
  CustoOperacionalInput,
  CategoriaCusto,
  CATEGORIAS_CUSTO_LABELS,
  CATEGORIAS_CUSTO_ICONS
} from '@/types/custos-operacionais';
import { PeriodoImportacao } from '@/types/periodo';
import { PeriodSelector } from '@/components/common/PeriodSelector';
import { formatarPeriodoDisplay, formatarMoeda } from '@/utils/periodoUtils';
import { toast } from 'sonner';

type ModalStep = 'period' | 'custos' | 'preview' | 'complete';

export const CustosOperacionaisModal: React.FC<CustosOperacionaisModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  periodoInicial,
  custosExistentes = []
}) => {
  const [step, setStep] = useState<ModalStep>('period');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoImportacao | null>(periodoInicial || null);
  const [custos, setCustos] = useState<CustoOperacionalInput[]>([]);
  const [custoAtual, setCustoAtual] = useState<CustoOperacionalInput>({
    categoria: 'OUTROS',
    descricao: '',
    valor: 0,
    dataVencimento: new Date()
  });
  const [error, setError] = useState<string | null>(null);

  // Resetar estado quando modal abre/fecha
  React.useEffect(() => {
    if (isOpen) {
      setStep(periodoInicial ? 'custos' : 'period');
      setPeriodoSelecionado(periodoInicial || null);
      setCustos([]);
      setCustoAtual({
        categoria: 'OUTROS',
        descricao: '',
        valor: 0,
        dataVencimento: new Date()
      });
      setError(null);
    }
  }, [isOpen, periodoInicial]);

  const handlePeriodSelect = (periodo: PeriodoImportacao) => {
    setPeriodoSelecionado(periodo);
  };

  const handlePeriodConfirm = () => {
    if (periodoSelecionado) {
      setStep('custos');
    }
  };

  const validarCusto = (custo: CustoOperacionalInput): { valido: boolean; erro?: string } => {
    if (!custo.descricao.trim()) {
      return { valido: false, erro: 'Descrição é obrigatória' };
    }

    if (custo.valor <= 0) {
      return { valido: false, erro: 'Valor deve ser maior que zero' };
    }

    if (!periodoSelecionado) {
      return { valido: false, erro: 'Período não selecionado' };
    }

    // Verificar se a data de vencimento está no período
    const dataVencimento = new Date(custo.dataVencimento);
    if (dataVencimento < periodoSelecionado.dataInicio || dataVencimento > periodoSelecionado.dataFim) {
      return { valido: false, erro: 'Data de vencimento deve estar dentro do período selecionado' };
    }

    // Verificar duplicata (mesma categoria e descrição similar)
    const duplicata = custos.find(c =>
      c.categoria === custo.categoria &&
      c.descricao.toLowerCase().trim() === custo.descricao.toLowerCase().trim()
    );

    if (duplicata) {
      return { valido: false, erro: 'Já existe um custo com a mesma categoria e descrição' };
    }

    return { valido: true };
  };

  const adicionarCusto = () => {
    const validacao = validarCusto(custoAtual);

    if (!validacao.valido) {
      setError(validacao.erro || 'Dados inválidos');
      return;
    }

    setCustos(prev => [...prev, custoAtual]);
    setCustoAtual({
      categoria: 'OUTROS',
      descricao: '',
      valor: 0,
      dataVencimento: new Date()
    });
    setError(null);
    toast.success('Custo adicionado com sucesso');
  };

  const removerCusto = (index: number) => {
    setCustos(prev => prev.filter((_, i) => i !== index));
    toast.success('Custo removido');
  };

  const handlePreview = () => {
    if (custos.length === 0) {
      setError('Adicione pelo menos um custo operacional');
      return;
    }
    setStep('preview');
  };

  const handleConfirm = () => {
    if (!periodoSelecionado || custos.length === 0) {
      setError('Dados incompletos');
      return;
    }

    setStep('complete');

    setTimeout(() => {
      onConfirm(custos, periodoSelecionado);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep('period');
    setPeriodoSelecionado(null);
    setCustos([]);
    setCustoAtual({
      categoria: 'OUTROS',
      descricao: '',
      valor: 0,
      dataVencimento: new Date()
    });
    setError(null);
    onClose();
  };

  const getTotalCustos = () => {
    return custos.reduce((acc, custo) => acc + custo.valor, 0);
  };

  const getCustosPorCategoria = () => {
    return custos.reduce((acc, custo) => {
      acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
      return acc;
    }, {} as Record<CategoriaCusto, number>);
  };

  const getModalTitle = () => {
    switch (step) {
      case 'period':
        return 'Custos Operacionais - Seleção de Período';
      case 'custos':
        return 'Custos Operacionais - Adicionar Custos';
      case 'preview':
        return 'Custos Operacionais - Revisão';
      case 'complete':
        return 'Custos Operacionais - Concluído';
      default:
        return 'Custos Operacionais';
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'period':
        return (
          <div className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Selecione o período dos custos operacionais que você deseja adicionar.
                Recomendamos usar períodos mensais para melhor organização.
              </AlertDescription>
            </Alert>

            <PeriodSelector
              tipo="custos"
              onPeriodSelect={handlePeriodSelect}
              periodoAtual={periodoSelecionado || undefined}
              showAdvancedMode={true}
            />

            {periodoSelecionado && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Período Selecionado</h4>
                <p className="text-sm text-green-700">
                  {formatarPeriodoDisplay(periodoSelecionado)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {periodoSelecionado.dataInicio.toLocaleDateString('pt-BR')} - {periodoSelecionado.dataFim.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handlePeriodConfirm}
                disabled={!periodoSelecionado}
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'custos':
        return (
          <div className="space-y-6">
            {/* Período Selecionado */}
            {periodoSelecionado && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Período: {formatarPeriodoDisplay(periodoSelecionado)}
                      </p>
                      <p className="text-xs text-blue-700">
                        {periodoSelecionado.dataInicio.toLocaleDateString('pt-BR')} - {periodoSelecionado.dataFim.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep('period')}>
                    Alterar
                  </Button>
                </div>
              </div>
            )}

            {/* Formulário para adicionar custo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Novo Custo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={custoAtual.categoria}
                      onValueChange={(value: CategoriaCusto) =>
                        setCustoAtual(prev => ({ ...prev, categoria: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIAS_CUSTO_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{CATEGORIAS_CUSTO_ICONS[key as CategoriaCusto]}</span>
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={custoAtual.valor}
                      onChange={(e) =>
                        setCustoAtual(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={custoAtual.descricao}
                    onChange={(e) =>
                      setCustoAtual(prev => ({ ...prev, descricao: e.target.value }))
                    }
                    placeholder="Ex: Aluguel da loja - Janeiro 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Vencimento</Label>
                    <Input
                      type="date"
                      value={custoAtual.dataVencimento.toISOString().split('T')[0]}
                      onChange={(e) =>
                        setCustoAtual(prev => ({ ...prev, dataVencimento: new Date(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Pagamento (Opcional)</Label>
                    <Input
                      type="date"
                      value={custoAtual.dataPagamento?.toISOString().split('T')[0] || ''}
                      onChange={(e) =>
                        setCustoAtual(prev => ({
                          ...prev,
                          dataPagamento: e.target.value ? new Date(e.target.value) : undefined
                        }))
                      }
                    />
                  </div>
                </div>

                {custoAtual.observacoes !== undefined && (
                  <div className="space-y-2">
                    <Label>Observações (Opcional)</Label>
                    <Textarea
                      value={custoAtual.observacoes || ''}
                      onChange={(e) =>
                        setCustoAtual(prev => ({ ...prev, observacoes: e.target.value }))
                      }
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button onClick={adicionarCusto} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Custo
                </Button>
              </CardContent>
            </Card>

            {/* Lista de custos adicionados */}
            {custos.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Custos Adicionados</CardTitle>
                    <Badge variant="secondary">
                      {custos.length} custo{custos.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {custos.map((custo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {CATEGORIAS_CUSTO_ICONS[custo.categoria]}
                          </span>
                          <div>
                            <p className="font-medium">{custo.descricao}</p>
                            <p className="text-sm text-gray-600">
                              {CATEGORIAS_CUSTO_LABELS[custo.categoria]} • {formatarMoeda(custo.valor)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Venc: {custo.dataVencimento.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerCusto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span className="text-lg font-bold">
                          {formatarMoeda(getTotalCustos())}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={() => setStep('period')}>
                ← Voltar
              </Button>
              <Button
                onClick={handlePreview}
                disabled={custos.length === 0}
              >
                Revisar ({custos.length})
              </Button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Resumo dos Custos Operacionais
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Período:</span>
                  <p className="font-medium">
                    {periodoSelecionado && formatarPeriodoDisplay(periodoSelecionado)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total de custos:</span>
                  <p className="font-medium">{custos.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Valor total:</span>
                  <p className="font-medium text-lg">{formatarMoeda(getTotalCustos())}</p>
                </div>
                <div>
                  <span className="text-gray-600">Categorias:</span>
                  <p className="font-medium">{Object.keys(getCustosPorCategoria()).length}</p>
                </div>
              </div>
            </div>

            {/* Custos por categoria */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Custos por Categoria</h4>
              {Object.entries(getCustosPorCategoria()).map(([categoria, valor]) => (
                <div key={categoria} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORIAS_CUSTO_ICONS[categoria as CategoriaCusto]}</span>
                    <span className="font-medium">
                      {CATEGORIAS_CUSTO_LABELS[categoria as CategoriaCusto]}
                    </span>
                  </div>
                  <span className="font-bold">{formatarMoeda(valor)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={() => setStep('custos')}>
                ← Editar
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                Confirmar Custos
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Receipt className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custos Adicionados com Sucesso!
              </h3>
              <p className="text-sm text-gray-600">
                {custos.length} custos operacionais foram registrados para {periodoSelecionado && formatarPeriodoDisplay(periodoSelecionado)}
              </p>
              <p className="text-lg font-bold text-green-600 mt-2">
                Total: {formatarMoeda(getTotalCustos())}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      title={getModalTitle()}
      size="lg"
    >
      {renderContent()}
    </BaseModal>
  );
};

// Função auxiliar para formatar moeda (se não existir em periodoUtils)
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}