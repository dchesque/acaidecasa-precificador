import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Upload,
  DollarSign,
  FileText,
  Search,
  BarChart3
} from "lucide-react";

interface AcoesRapidasProps {
  compact?: boolean;
}

export const AcoesRapidas = ({ compact = false }: AcoesRapidasProps) => {
  const router = useRouter();

  const acoes = [
    {
      id: 'importar-vendas',
      icone: <Upload className="h-5 w-5" />,
      titulo: 'Importar Vendas do Dia',
      descricao: 'Envie o arquivo de vendas',
      link: '/analise-vendas',
      cor: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'registrar-custo',
      icone: <DollarSign className="h-5 w-5" />,
      titulo: 'Registrar Custo Operacional',
      descricao: 'Adicione um custo fixo',
      link: '/custos-operacionais',
      cor: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'ver-cardapio',
      icone: <FileText className="h-5 w-5" />,
      titulo: 'Ver Cardápio Completo',
      descricao: 'Visualize todos os produtos',
      link: '/cardapio',
      cor: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      id: 'dashboard-gestao',
      icone: <BarChart3 className="h-5 w-5" />,
      titulo: 'Dashboard de Gestão',
      descricao: 'Análise financeira detalhada',
      link: '/dashboard-gestao',
      cor: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
    }
  ];

  const handleAcaoClick = (link: string) => {
    router.push(link);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {acoes.map((acao) => (
          <Button
            key={acao.id}
            variant="outline"
            className={`w-full justify-start gap-3 ${acao.cor}`}
            onClick={() => handleAcaoClick(acao.link)}
          >
            {acao.icone}
            <span className="font-medium">{acao.titulo}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {acoes.map((acao) => (
          <button
            key={acao.id}
            onClick={() => handleAcaoClick(acao.link)}
            className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all ${acao.cor}`}
          >
            <div className="mb-3">{acao.icone}</div>
            <h3 className="font-semibold text-sm mb-1">{acao.titulo}</h3>
            <p className="text-xs text-gray-600">{acao.descricao}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
