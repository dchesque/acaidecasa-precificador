import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { Alerta } from "@/types/database";

interface AlertBadgeProps {
  alerta: Alerta;
  onClick?: () => void;
}

export const AlertBadge = ({ alerta, onClick }: AlertBadgeProps) => {
  const getIcon = () => {
    switch (alerta.tipo) {
      case 'PREJUIZO':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MARGEM_BAIXA':
        return <TrendingDown className="h-4 w-4" />;
      case 'PRECO_ALTERADO':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (alerta.tipo) {
      case 'PREJUIZO':
        return 'destructive' as const;
      case 'MARGEM_BAIXA':
        return 'secondary' as const;
      case 'PRECO_ALTERADO':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const getColor = () => {
    switch (alerta.tipo) {
      case 'PREJUIZO':
        return 'border-red-200 bg-red-50';
      case 'MARGEM_BAIXA':
        return 'border-yellow-200 bg-yellow-50';
      case 'PRECO_ALTERADO':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Alert 
      className={`cursor-pointer transition-colors hover:opacity-80 ${getColor()}`}
      onClick={onClick}
    >
      {getIcon()}
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">{alerta.titulo}</div>
          <div className="text-sm text-muted-foreground">{alerta.descricao}</div>
        </div>
        <Badge variant={getVariant()} className="ml-2">
          {alerta.itemNome}
        </Badge>
      </AlertDescription>
    </Alert>
  );
};