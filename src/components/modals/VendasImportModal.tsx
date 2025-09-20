"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  X,
  Download,
  AlertTriangle,
  Calendar,
  Package,
  DollarSign
} from 'lucide-react';
import { ResumoImportacao, VendaRegistrada } from '@/types/analise-vendas';
import { formatarMoeda, formatarData, validarArquivoVendas } from '@/utils/vendasCalculations';
import { analiseVendasService } from '@/services/analiseVendasService';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface VendasImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (vendas: VendaRegistrada[], resumo: ResumoImportacao) => void;
}

type ImportStep = 'upload' | 'processing' | 'preview' | 'importing' | 'complete';

export const VendasImportModal: React.FC<VendasImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { cardapio, vendasAnalise } = useAppContext();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null);
  const [vendas, setVendas] = useState<VendaRegistrada[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const arquivo = acceptedFiles[0];
    if (!arquivo) return;

    const validacao = validarArquivoVendas(arquivo);
    if (!validacao.valido) {
      setError(validacao.erro || 'Arquivo inválido');
      return;
    }

    setFile(arquivo);
    setError(null);
    processarArquivo(arquivo);
  }, [cardapio, vendasAnalise.vendasRegistradas]);

  const processarArquivo = async (arquivo: File) => {
    try {
      setStep('processing');
      setProgress(20);

      // Simular processamento progressivo
      const intervalId = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const resultado = await analiseVendasService.processarArquivoVendas(
        arquivo,
        cardapio,
        vendasAnalise.vendasRegistradas
      );

      clearInterval(intervalId);
      setProgress(100);

      // Gerar vendas processadas (simulação)
      const vendasProcessadas: VendaRegistrada[] = [];
      // Aqui você adicionaria as vendas reais processadas do arquivo
      // Por enquanto, apenas definimos como array vazio

      setResumo(resultado);
      setVendas(vendasProcessadas);
      setStep('preview');
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
      setStep('upload');
      setProgress(0);
    }
  };

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
    if (!resumo || !file) return;

    setStep('importing');
    setProgress(0);

    try {
      // Simular progresso de importação
      const intervalId = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 500);

      // Aqui você faria a importação real
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(intervalId);
      setProgress(100);

      setStep('complete');
      setTimeout(() => {
        onImportComplete(vendas, resumo);
        handleClose();
      }, 1500);
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
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Formatos aceitos: CSV, XLS, XLSX (máx. 5MB)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Formato esperado do arquivo:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Colunas obrigatórias: data, produto, quantidade, valor</li>
                <li>• Colunas opcionais: vendedor, produto_id (SKU)</li>
                <li>• Datas no formato DD/MM/AAAA ou AAAA-MM-DD</li>
                <li>• Valores decimais com ponto ou vírgula</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar modelo
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
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-xs text-gray-500 text-center">
              Analisando dados e fazendo correspondência com o cardápio...
            </div>
          </div>
        );

      case 'preview':
        return resumo ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Resumo da Importação
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Arquivo:</span>
                  <p className="font-medium">{resumo.arquivo}</p>
                </div>
                <div>
                  <span className="text-gray-600">Período:</span>
                  <p className="font-medium">
                    {formatarData(resumo.periodo.inicio)} a {formatarData(resumo.periodo.fim)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total de registros:</span>
                  <p className="font-medium">{resumo.totalRegistros}</p>
                </div>
                <div>
                  <span className="text-gray-600">Valor total:</span>
                  <p className="font-medium">{formatarMoeda(resumo.valorTotalNovo)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Novos</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {resumo.registrosNovos}
                </p>
                <p className="text-xs text-green-600">registros</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-900">Duplicados</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {resumo.registrosDuplicados}
                </p>
                <p className="text-xs text-yellow-600">ignorados</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-900">Sem match</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {resumo.produtosSemMatch.length}
                </p>
                <p className="text-xs text-orange-600">produtos</p>
              </div>
            </div>

            {resumo.produtosSemMatch.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{resumo.produtosSemMatch.length} produtos</strong> não foram encontrados no cardápio.
                  Você poderá vinculá-los manualmente após a importação.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Voltar
              </Button>
              <Button onClick={handleConfirmImport}>
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

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {progress}% concluído
              </p>
            </div>
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
                Importação concluída!
              </h3>
              <p className="text-sm text-gray-600">
                {resumo?.registrosNovos} vendas foram importadas com sucesso
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
      title="Importar Vendas"
      size="lg"
    >
      {renderContent()}
    </BaseModal>
  );
};