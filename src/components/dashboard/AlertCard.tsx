import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alerta: {
    tipo: 'warning' | 'danger' | 'info' | 'success';
    titulo: string;
    descricao: string;
    acao?: {
      label: string;
      link?: string;
      onClick?: () => void;
    };
  };
  onDismiss?: () => void;
  onAction?: () => void;
  className?: string;
}

const getAlertConfig = (tipo: string) => {
  const configs = {
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      titleColor: 'text-red-900 dark:text-red-100',
      descColor: 'text-red-700 dark:text-red-300',
      emoji: '🔴'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      titleColor: 'text-yellow-900 dark:text-yellow-100',
      descColor: 'text-yellow-700 dark:text-yellow-300',
      emoji: '🟡'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      titleColor: 'text-blue-900 dark:text-blue-100',
      descColor: 'text-blue-700 dark:text-blue-300',
      emoji: '🔵'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      titleColor: 'text-green-900 dark:text-green-100',
      descColor: 'text-green-700 dark:text-green-300',
      emoji: '🟢'
    }
  };
  return configs[tipo as keyof typeof configs] || configs.info;
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alerta,
  onDismiss,
  onAction,
  className
}) => {
  const config = getAlertConfig(alerta.tipo);
  const IconComponent = config.icon;

  const handleActionClick = () => {
    if (alerta.acao?.onClick) {
      alerta.acao.onClick();
    } else if (alerta.acao?.link) {
      window.open(alerta.acao.link, '_blank');
    }

    if (onAction) {
      onAction();
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Ícone */}
          <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
            <IconComponent className="h-5 w-5" />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cn('text-sm font-semibold', config.titleColor)}>
                  <span className="mr-2">{config.emoji}</span>
                  {alerta.titulo}
                </h4>
                <p className={cn('text-sm mt-1', config.descColor)}>
                  {alerta.descricao}
                </p>
              </div>

              {/* Botão de fechar */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="flex-shrink-0 ml-2 h-6 w-6 p-0 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Ação */}
            {alerta.acao && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActionClick}
                  className={cn(
                    'text-xs',
                    config.titleColor,
                    'border-current hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {alerta.acao.label}
                  {alerta.acao.link && (
                    <ExternalLink className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};