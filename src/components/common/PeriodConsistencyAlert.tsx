import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Info
} from 'lucide-react';
import { PeriodoImportacao, StatusPeriodo, ValidacaoPeriodo } from '@/types/periodo';
import { formatarPeriodoDisplay } from '@/utils/periodoUtils';

interface PeriodConsistencyAlertProps {
  periodoVendas?: PeriodoImportacao;
  periodoCustos?: PeriodoImportacao;
  statusPeriodoVendas?: StatusPeriodo;
  statusPeriodoCustos?: StatusPeriodo;
  validacao?: ValidacaoPeriodo;
  onFixInconsistency?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const PeriodConsistencyAlert: React.FC<PeriodConsistencyAlertProps> = ({
  periodoVendas,
  periodoCustos,
  statusPeriodoVendas,
  statusPeriodoCustos,
  validacao,
  onFixInconsistency,
  onViewDetails,
  className = ""
}) => {
  // Se não há dados suficientes, não mostrar o alerta
  if (!periodoVendas && !periodoCustos) {
    return null;
  }

  const getConsistencyStatus = () => {
    // Períodos consistentes - mesma referência
    if (periodoVendas && periodoCustos &&
        periodoVendas.mesReferencia === periodoCustos.mesReferencia) {

      const vendasCompletas = statusPeriodoVendas?.vendasStatus === 'COMPLETO';
      const custosCompletos = statusPeriodoCustos?.custosStatus === 'COMPLETO';

      if (vendasCompletas && custosCompletos) {
        return {
          type: 'success' as const,
          icon: CheckCircle,
          title: 'Períodos Consistentes',
          message: `Vendas e custos estão alinhados para ${formatarPeriodoDisplay(periodoVendas)}`,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      }

      if (vendasCompletas || custosCompletos) {
        return {
          type: 'warning' as const,
          icon: AlertTriangle,
          title: 'Dados Parciais',
          message: `Período ${formatarPeriodoDisplay(periodoVendas)} tem dados incompletos`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      }
    }

    // Períodos inconsistentes
    if (periodoVendas && periodoCustos &&
        periodoVendas.mesReferencia !== periodoCustos.mesReferencia) {
      return {
        type: 'error' as const,
        icon: XCircle,
        title: 'Períodos Inconsistentes',
        message: `Vendas (${formatarPeriodoDisplay(periodoVendas)}) e custos (${formatarPeriodoDisplay(periodoCustos)}) não coincidem`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    // Apenas um período definido
    if (periodoVendas && !periodoCustos) {
      return {
        type: 'info' as const,
        icon: Info,
        title: 'Custos Não Definidos',
        message: `Defina custos operacionais para ${formatarPeriodoDisplay(periodoVendas)} para análise completa`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (periodoCustos && !periodoVendas) {
      return {
        type: 'info' as const,
        icon: Info,
        title: 'Vendas Não Definidas',
        message: `Importe vendas para ${formatarPeriodoDisplay(periodoCustos)} para análise completa`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    return null;
  };

  const status = getConsistencyStatus();

  if (!status) {
    return null;
  }

  const Icon = status.icon;

  return (
    <Alert className={`${status.bgColor} ${status.borderColor} ${className}`}>
      <Icon className={`h-4 w-4 ${status.color}`} />
      <AlertDescription>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${status.color}`}>
                {status.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {status.message}
              </p>
            </div>
          </div>

          {/* Detalhes dos Períodos */}
          {(periodoVendas || periodoCustos) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Vendas */}
              {periodoVendas && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-medium">Vendas</span>
                    {statusPeriodoVendas && (
                      <Badge
                        variant={
                          statusPeriodoVendas.vendasStatus === 'COMPLETO' ? 'default' :
                          statusPeriodoVendas.vendasStatus === 'PARCIAL' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs px-1 py-0"
                      >
                        {statusPeriodoVendas.vendasStatus === 'COMPLETO' ? '✅' :
                         statusPeriodoVendas.vendasStatus === 'PARCIAL' ? '⏳' : '⚠️'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {formatarPeriodoDisplay(periodoVendas)}
                  </p>
                  {statusPeriodoVendas && (
                    <p className="text-gray-500">
                      {statusPeriodoVendas.diasVendas}/{statusPeriodoVendas.totalDias} dias com vendas
                    </p>
                  )}
                </div>
              )}

              {/* Custos */}
              {periodoCustos && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium">Custos</span>
                    {statusPeriodoCustos && (
                      <Badge
                        variant={
                          statusPeriodoCustos.custosStatus === 'COMPLETO' ? 'default' :
                          statusPeriodoCustos.custosStatus === 'PARCIAL' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs px-1 py-0"
                      >
                        {statusPeriodoCustos.custosStatus === 'COMPLETO' ? '✅' :
                         statusPeriodoCustos.custosStatus === 'PARCIAL' ? '⏳' : '⚠️'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {formatarPeriodoDisplay(periodoCustos)}
                  </p>
                  {statusPeriodoCustos && (
                    <p className="text-gray-500">
                      {statusPeriodoCustos.categoriasComCustos.length}/{statusPeriodoCustos.totalCategorias} categorias
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Validações Detalhadas */}
          {validacao && (
            <div className="space-y-2">
              {validacao.inconsistencias.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-700">Inconsistências:</p>
                  {validacao.inconsistencias.map((inconsistencia, index) => (
                    <p key={index} className="text-xs text-red-600">• {inconsistencia}</p>
                  ))}
                </div>
              )}

              {validacao.avisos.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-yellow-700">Avisos:</p>
                  {validacao.avisos.map((aviso, index) => (
                    <p key={index} className="text-xs text-yellow-600">• {aviso}</p>
                  ))}
                </div>
              )}

              {validacao.sugestoes.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-700">Sugestões:</p>
                  {validacao.sugestoes.map((sugestao, index) => (
                    <p key={index} className="text-xs text-blue-600">• {sugestao}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          {(onFixInconsistency || onViewDetails) && (
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              {status.type === 'error' && onFixInconsistency && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFixInconsistency}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Corrigir Períodos
                </Button>
              )}

              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewDetails}
                  className="text-xs"
                >
                  Ver Detalhes
                </Button>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Componente simplificado para casos básicos
interface SimplePeriodAlertProps {
  hasVendas: boolean;
  hasCustos: boolean;
  periodosConsistentes: boolean;
  onAddVendas?: () => void;
  onAddCustos?: () => void;
  className?: string;
}

export const SimplePeriodAlert: React.FC<SimplePeriodAlertProps> = ({
  hasVendas,
  hasCustos,
  periodosConsistentes,
  onAddVendas,
  onAddCustos,
  className = ""
}) => {
  if (hasVendas && hasCustos && periodosConsistentes) {
    return (
      <Alert className={`bg-green-50 border-green-200 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Dados completos!</strong> Vendas e custos operacionais estão alinhados para análise precisa.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasVendas && !hasCustos) {
    return (
      <Alert className={`bg-blue-50 border-blue-200 ${className}`}>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Dados não encontrados</strong>
              <p className="text-sm text-blue-700 mt-1">
                Importe vendas e adicione custos operacionais para começar a análise.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              {onAddVendas && (
                <Button variant="outline" size="sm" onClick={onAddVendas}>
                  Importar Vendas
                </Button>
              )}
              {onAddCustos && (
                <Button variant="outline" size="sm" onClick={onAddCustos}>
                  Adicionar Custos
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!periodosConsistentes) {
    return (
      <Alert className={`bg-yellow-50 border-yellow-200 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <strong>Períodos não coincidem</strong>
          <p className="text-sm text-yellow-700 mt-1">
            Para análise precisa, certifique-se que vendas e custos sejam do mesmo período.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-yellow-50 border-yellow-200 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>Dados incompletos</strong>
            <p className="text-sm text-yellow-700 mt-1">
              {!hasVendas ? 'Importe vendas' : 'Adicione custos operacionais'} para análise completa.
            </p>
          </div>
          <div className="ml-4">
            {!hasVendas && onAddVendas && (
              <Button variant="outline" size="sm" onClick={onAddVendas}>
                Importar Vendas
              </Button>
            )}
            {!hasCustos && onAddCustos && (
              <Button variant="outline" size="sm" onClick={onAddCustos}>
                Adicionar Custos
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};