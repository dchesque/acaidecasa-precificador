import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Archive, 
  ChefHat, 
  Coffee, 
  Layers, 
  MenuSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus
} from "lucide-react";

const statsCards = [
  { title: "Fornecedores", count: 0, icon: Users, color: "primary" },
  { title: "Insumos", count: 0, icon: Package, color: "secondary" },
  { title: "Embalagens", count: 0, icon: Archive, color: "accent" },
  { title: "Receitas", count: 0, icon: ChefHat, color: "primary" },
  { title: "Copos Base", count: 0, icon: Coffee, color: "secondary" },
  { title: "Combinados", count: 0, icon: Layers, color: "accent" },
];

const quickActions = [
  { title: "Novo Fornecedor", icon: Users, action: "fornecedores" },
  { title: "Novo Insumo", icon: Package, action: "insumos" },
  { title: "Nova Receita", icon: ChefHat, action: "receitas" },
  { title: "Gerenciar Cardápio", icon: MenuSquare, action: "cardapio" },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do seu açaí delivery
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Sistema Iniciado
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Ações Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-20 flex-col space-y-2"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs text-center">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Getting Started */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Primeiros Passos
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">1. Configure o sistema</p>
              <p className="text-sm text-muted-foreground">
                Defina markup padrão e categorias
              </p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">2. Cadastre fornecedores</p>
              <p className="text-sm text-muted-foreground">
                Adicione seus fornecedores de insumos
              </p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">3. Registre insumos e embalagens</p>
              <p className="text-sm text-muted-foreground">
                Cadastre produtos com preços
              </p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Começar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};