"use client";

import React, { useState, useEffect } from 'react';
import { Database, Calendar, Upload, AlertCircle } from 'lucide-react';
import { VendasSystemInfo } from '@/types/analise-vendas';

interface VendasSystemStatusProps {
  systemInfo: VendasSystemInfo;
}

export function VendasSystemStatus({ systemInfo }: VendasSystemStatusProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const formatarTempoDecorrido = (data: Date | string | null) => {
    if (!data) return 'Nunca';

    const agora = new Date();
    const dataObj = new Date(data);
    const diff = agora.getTime() - dataObj.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return 'hoje';
    } else if (dias === 1) {
      return 'há 1 dia';
    } else if (dias < 30) {
      return `há ${dias} dias`;
    } else {
      const meses = Math.floor(dias / 30);
      return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
  };

  const formatarData = (data: Date | string | null) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  const temDados = systemInfo.totalVendasRegistradas > 0;

  if (!temDados) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <p>
            Nenhuma venda foi importada ainda. Clique em Importar Vendas para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Database className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Status do Sistema de Vendas
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Ativo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <span className="text-gray-600">Dados disponíveis:</span>
                <div className="font-medium text-gray-900">
                  {isClient ? (
                    `${formatarData(systemInfo.primeiraVenda)} até ${formatarData(systemInfo.ultimaVenda)}`
                  ) : (
                    'Carregando...'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <span className="text-gray-600">Total de vendas:</span>
                <div className="font-medium text-gray-900">
                  {systemInfo.totalVendasRegistradas.toLocaleString('pt-BR')} registros
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <div>
                <span className="text-gray-600">Última importação:</span>
                <div className="font-medium text-gray-900">
                  {isClient ? formatarTempoDecorrido(systemInfo.ultimaImportacao) : 'Carregando...'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>
                {systemInfo.totalImportacoes} {systemInfo.totalImportacoes !== 1 ? 'importações realizadas' : 'importação realizada'}
              </span>
              <span className="text-gray-400">•</span>
              <span>
                {systemInfo.totalProdutosDiferentes} produtos diferentes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}