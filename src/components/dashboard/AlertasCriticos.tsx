import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight, CheckCircle, TrendingUp } from "lucide-react";
import { AlertaCritico } from "@/utils/dashboardCalculations";
import { useRouter } from "next/navigation";

interface AlertasCriticosProps {
  alertas: AlertaCritico[];
  loading?: boolean;
}

const getAlertaIcon = (tipo: AlertaCritico['tipo']) => {
  switch (tipo) {
    case 'PREJUIZO':
      return '!';
    case 'SEM_VENDAS':
      return '!';
    case 'AUMENTO_CUSTO':
      return '!';
    case 'NAO_ENCONTRADO':
      return '?';
    case 'MARGEM_BAIXA':
      return '!';
    default:
      return '!';
  }
};

const getSeveridadeColor = (severidade: AlertaCritico['severidade']): string => {
  switch (severidade) {
    case 'critico':
      return 'border-red-500 bg-red-50';
    case 'alto':
      return 'border-orange-500 bg-orange-50';
    case 'medio':
      return 'border-yellow-500 bg-yellow-50';
    case 'baixo':
      return 'border-blue-500 bg-blue-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

export const AlertasCriticos = ({ alertas, loading = false }: AlertasCriticosProps) => {
  const router = useRouter();
  const [verTodos, setVerTodos] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse">Carregando alertas...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const alertasOrdenados = [...alertas].sort((a, b) => {
    const severidadeOrder = { critico: 0, alto: 1, medio: 2, baixo: 3 };
    return severidadeOrder[a.severidade] - severidadeOrder[b.severidade];
  });

  const alertasVisiveis = verTodos ? alertasOrdenados : alertasOrdenados.slice(0, 5);

  const handleAlertaClick = (alerta: AlertaCritico) => {
    if (alerta.link) {
      router.push(alerta.link);
    }
  };

  if (alertas.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Alertas Críticos
            <Badge variant="outline" className="bg-white border-green-300 text-green-700">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-6xl mb-4">OK</div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Nenhum alerta crítico no momento
            </h3>
            <p className="text-sm text-green-600">
              Seu negócio está operando sem problemas identificados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Alertas Críticos
          <Badge variant="destructive" className="bg-red-500">
            {alertas.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertasVisiveis.map((alerta) => (
          <div
            key={alerta.id}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getSeveridadeColor(alerta.severidade)}`}
            onClick={() => handleAlertaClick(alerta)}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{getAlertaIcon(alerta.tipo)}</span>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {alerta.titulo}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {alerta.descricao}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        ))}

        {alertas.length > 5 && !verTodos && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => setVerTodos(true)}
          >
            Ver todos os alertas ({alertas.length})
          </Button>
        )}

        {verTodos && alertas.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => setVerTodos(false)}
          >
            Mostrar menos
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
