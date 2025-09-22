import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto?: string;
  icone: ReactNode;
  cor?: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange';
  badge?: {
    texto: string;
    variante: 'success' | 'danger' | 'warning' | 'info';
  };
  trend?: 'up' | 'down' | 'stable';
  extra?: ReactNode;
  progress?: {
    valor: number;
    max: number;
    label?: string;
  };
  className?: string;
}

const getColorClasses = (cor: string) => {
  const colorMap = {
    green: {
      icon: 'text-green-600',
      value: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800'
    },
    red: {
      icon: 'text-red-600',
      value: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800'
    },
    blue: {
      icon: 'text-blue-600',
      value: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800'
    },
    yellow: {
      icon: 'text-yellow-600',
      value: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    purple: {
      icon: 'text-purple-600',
      value: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      border: 'border-purple-200 dark:border-purple-800'
    },
    orange: {
      icon: 'text-orange-600',
      value: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800'
    }
  };
  return colorMap[cor as keyof typeof colorMap] || colorMap.blue;
};

const getBadgeVariant = (variante: string) => {
  const variantMap = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  };
  return variantMap[variante as keyof typeof variantMap] || variantMap.info;
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case 'stable':
      return <Minus className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtexto,
  icone,
  cor = 'blue',
  badge,
  trend,
  extra,
  progress,
  className
}) => {
  const colorClasses = getColorClasses(cor);

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      colorClasses.bg,
      colorClasses.border,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {titulo}
        </CardTitle>
        <div className={cn('h-5 w-5', colorClasses.icon)}>
          {icone}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={cn('text-2xl font-bold', colorClasses.value)}>
            {valor}
          </div>
          {trend && getTrendIcon(trend)}
        </div>

        {subtexto && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {subtexto}
          </p>
        )}

        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{progress.label || 'Progresso'}</span>
              <span>{Math.round((progress.valor / progress.max) * 100)}%</span>
            </div>
            <Progress
              value={progress.valor}
              max={progress.max}
              className="h-2"
            />
          </div>
        )}

        {badge && (
          <Badge
            className={cn('text-xs', getBadgeVariant(badge.variante))}
          >
            {badge.texto}
          </Badge>
        )}

        {extra && (
          <div className="mt-3">
            {extra}
          </div>
        )}
      </CardContent>
    </Card>
  );
};