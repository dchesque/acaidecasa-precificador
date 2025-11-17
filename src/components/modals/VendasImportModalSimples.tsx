"use client"

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { ResumoImportacao, VendaRegistrada } from '@/types/analise-vendas';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { analiseVendasService } from '@/services/analiseVendasService';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface VendasImportModalSimplesProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (vendas: VendaRegistrada[], resumo: ResumoImportacao) => void;
}

type Step = 'upload' | 'processing' | 'preview' | 'importing' | 'complete';

// Gerar últimos 12 meses
function gerarUltimos12Meses(): { value: string; label: string }[] {
  const meses = [];
  const hoje = new Date();

  for (let i = 0; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesRef = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const mesNome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const label = mesNome.charAt(0).toUpperCase() + mesNome.slice(1);
    meses.push({ value: mesRef, label });
  }

  return meses;
}

export function VendasImportModalSimples({
  isOpen,
  onClose,
  onImportComplete
}: VendasImportModalSimplesProps) {
  const { cardapio, vendasAnalise } = useAppContext();
  const [step, setStep] = useState<Step>('upload');
  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [file, setFile] = useState<File | null>(null);
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null);
  const [vendas, setVendas] = useState<VendaRegistrada[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mesesDisponiveis = gerarUltimos12Meses();

  const processarArquivo = useCallback(async (arquivo: File) => {
    if (!mesReferencia) {
      setError('Selecione um período antes de processar');
      return;
    }

    try {
      setStep('processing');
      setProgress(20);

      // Simular progresso
      const intervalId = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      // Processar arquivo usando o serviço
      const resumoTemp = await analiseVendasService.processarArquivoVendas(
        arquivo,
        cardapio,
        vendasAnalise.vendasRegistradas
      );

      clearInterval(intervalId);
      setProgress(100);

      // Criar período de importação
      const [ano, mes] = mesReferencia.split('-');
      const dataInicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const dataFim = new Date(parseInt(ano), parseInt(mes), 0);
      const diasTotais = dataFim.getDate();

      const periodoImportacao = {
        tipo: 'MES_COMPLETO' as const,
        mesReferencia,
        ano: parseInt(ano),
        mes: parseInt(mes),
        dataInicio,
        dataFim,
        status: 'COMPLETO' as const,
        diasTotais,
        diasImportados: diasTotais
      };

      const resumoFinal: ResumoImportacao = {
        ...resumoTemp,
        periodoImportacao
      };

      setVendas(resumoTemp.vendas || []);
      setResumo(resumoFinal);
      setStep('preview');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar arquivo');
      setStep('upload');
    }
  }, [cardapio, vendasAnalise.vendasRegistradas, mesReferencia]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const arquivo = acceptedFiles[0];
    if (!arquivo) return;

    // Validar extensão
    const extensao = arquivo.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(extensao || '')) {
      setError('Formato inválido. Use CSV, XLS ou XLSX');
      return;
    }

    // Validar tamanho (5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    setFile(arquivo);
    setError(null);
    processarArquivo(arquivo);
  }, [processarArquivo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: step !== 'upload'
  });

  const handleConfirmImport = async () => {
    if (!resumo || !vendas.length) return;

    setStep('importing');
    setProgress(0);

    try {
      const intervalId = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 300);

      await new Promise(resolve => setTimeout(resolve, 1500));

      clearInterval(intervalId);
      setProgress(100);

      setStep('complete');
      setTimeout(() => {
        onImportComplete(vendas, resumo);
        handleClose();
      }, 1000);
    } catch (err) {
      console.error('Erro ao importar:', err);
      toast.error('Erro ao importar vendas');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setResumo(null);
    setVendas([]);
    setProgress(0);
    setError(null);
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-4">
            {/* Seleção de Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </label>
              <Select value={mesReferencia} onValueChange={setMesReferencia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {mesesDisponiveis.map(mes => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Solte o arquivo aqui' : '📤 Arraste arquivo ou clique para selecionar'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                CSV, XLS ou XLSX (máx. 5MB)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info do Formato */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Formato esperado
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• <strong>Colunas:</strong> data, produto, quantidade, valor</p>
                <p>• <strong>Data:</strong> DD/MM/AAAA ou AAAA-MM-DD</p>
                <p>• <strong>Exemplo:</strong> 15/11/2024, Açaí 500ml, 2, 38.00</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processando arquivo...
              </h3>
              <p className="text-sm text-gray-600">
                {file?.name}
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                Analisando dados e fazendo match com cardápio...
              </p>
            </div>
          </div>
        );

      case 'preview':
        return resumo ? (
          <div className="space-y-6">
            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Vendas</span>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {resumo.registrosNovos}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Receita</span>
                </div>
                <p className="text-xl font-bold text-green-700">
                  {formatarMoeda(resumo.valorTotalNovo)}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Período</span>
                </div>
                <p className="text-sm font-bold text-purple-700">
                  {mesesDisponiveis.find(m => m.value === mesReferencia)?.label.split(' ')[0]}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Produtos</span>
                </div>
                <p className="text-xl font-bold text-gray-700">
                  {new Set(vendas.map(v => v.produtoNome)).size}
                </p>
              </div>
            </div>

            {/* Produtos Sem Match */}
            {resumo.produtosSemMatch && resumo.produtosSemMatch.length > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong className="text-orange-900">
                    {resumo.produtosSemMatch.length} produto(s) sem match no cardápio:
                  </strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    {resumo.produtosSemMatch.slice(0, 5).map((produto, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {produto.produtoNome} ({produto.ocorrencias}x)
                      </li>
                    ))}
                    {resumo.produtosSemMatch.length > 5 && (
                      <li className="text-gray-500 text-xs">
                        e mais {resumo.produtosSemMatch.length - 5} produto(s)...
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Duplicados */}
            {resumo.registrosDuplicados > 0 && (
              <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                ⚠️ {resumo.registrosDuplicados} venda(s) duplicada(s) será(ão) ignorada(s)
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => {
                setStep('upload');
                setFile(null);
                setError(null);
              }}>
                ← Voltar
              </Button>
              <Button onClick={handleConfirmImport} disabled={resumo.registrosNovos === 0}>
                Confirmar Importação
              </Button>
            </div>
          </div>
        ) : null;

      case 'importing':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-green-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Importando vendas...
              </h3>
              <p className="text-sm text-gray-600">
                Salvando {resumo?.registrosNovos} registros
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Importação concluída!
              </h3>
              <p className="text-sm text-gray-600">
                {resumo?.registrosNovos} vendas importadas
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (step) {
      case 'upload':
        return '📤 Importar Vendas';
      case 'processing':
        return 'Processando...';
      case 'preview':
        return 'Confirmar Importação';
      case 'importing':
        return 'Importando...';
      case 'complete':
        return 'Concluído!';
      default:
        return 'Importar Vendas';
    }
  };

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && step !== 'importing') {
          handleClose();
        }
      }}
      title={getModalTitle()}
      size="lg"
    >
      {renderContent()}
    </BaseModal>
  );
}
