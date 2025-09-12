"use client"
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertBadge } from "@/components/alerts/AlertBadge";
import { useAppContext } from "@/contexts/AppContext";
import { useCalculations } from "@/hooks/useCalculations";
import { 
  mockConfiguracao, 
  mockCategorias, 
  mockUnidadesMedida,
  mockFornecedores,
  mockInsumos,
  mockReceitas,
  mockCoposBase,
  mockCombinados,
  mockCardapio
} from "@/data/mockData";
import { formatarMoeda, formatarPorcentagem } from "@/utils/calculations";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Package,
  Users,
  ChefHat,
  Coffee
} from "lucide-react";

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const { verificarAlertas } = useCalculations();

  // Load mock data on mount
  useEffect(() => {
    dispatch({ type: 'SET_CONFIGURACAO', payload: mockConfiguracao });
    dispatch({ type: 'SET_CATEGORIAS', payload: mockCategorias });
    dispatch({ type: 'SET_UNIDADES_MEDIDA', payload: mockUnidadesMedida });
    dispatch({ type: 'SET_FORNECEDORES', payload: mockFornecedores });
    dispatch({ type: 'SET_INSUMOS', payload: mockInsumos });
    dispatch({ type: 'SET_RECEITAS', payload: mockReceitas });
    dispatch({ type: 'SET_COPOS_BASE', payload: mockCoposBase });
    dispatch({ type: 'SET_COMBINADOS', payload: mockCombinados });
    dispatch({ type: 'SET_CARDAPIO', payload: mockCardapio });
  }, [dispatch]);

  // Check for alerts when data changes
  useEffect(() => {
    if (state.coposBase.length > 0 || state.combinados.length > 0) {
      verificarAlertas();
    }
  }, [state.coposBase, state.combinados, verificarAlertas]);

  const stats = {
    totalItens: state.cardapio.filter(item => item.ativo).length,
    margemMedia: state.cardapio.length > 0 
      ? state.cardapio.reduce((acc, item) => acc + item.margemAtual, 0) / state.cardapio.length 
      : 0,
    custoMedio: state.cardapio.length > 0 
      ? state.cardapio.reduce((acc, item) => acc + item.custoAtual, 0) / state.cardapio.length 
      : 0,
    precoMedio: state.cardapio.length > 0 
      ? state.cardapio.reduce((acc, item) => acc + item.precoAtual, 0) / state.cardapio.length 
      : 0,
  };

  const alertasNaoLidos = state.alertas.filter(alerta => !alerta.lido);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de precificação
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Itens
              </CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItens}</div>
              <p className="text-xs text-muted-foreground">
                itens ativos no cardápio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Margem Média
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatarPorcentagem(stats.margemMedia)}
              </div>
              <p className="text-xs text-muted-foreground">
                margem de lucro média
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Custo Médio
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatarMoeda(stats.custoMedio)}
              </div>
              <p className="text-xs text-muted-foreground">
                custo médio por item
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Preço Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatarMoeda(stats.precoMedio)}
              </div>
              <p className="text-xs text-muted-foreground">
                preço médio de venda
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas
                {alertasNaoLidos.length > 0 && (
                  <Badge variant="destructive">{alertasNaoLidos.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Itens que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertasNaoLidos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta no momento
                </p>
              ) : (
                alertasNaoLidos.slice(0, 3).map((alerta) => (
                  <AlertBadge 
                    key={alerta.id} 
                    alerta={alerta}
                    onClick={() => dispatch({ type: 'MARK_ALERTA_READ', payload: alerta.id })}
                  />
                ))
              )}
              {alertasNaoLidos.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos os alertas ({alertasNaoLidos.length})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Sistema</CardTitle>
              <CardDescription>
                Dados gerais dos módulos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Fornecedores</span>
                </div>
                <Badge variant="secondary">{state.fornecedores.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Insumos</span>
                </div>
                <Badge variant="secondary">{state.insumos.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Receitas</span>
                </div>
                <Badge variant="secondary">{state.receitas.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Copos Base</span>
                </div>
                <Badge variant="secondary">{state.coposBase.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Combinados</span>
                </div>
                <Badge variant="secondary">{state.combinados.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens Recentes</CardTitle>
            <CardDescription>
              Últimos itens adicionados ao cardápio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.cardapio.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.nome}</h4>
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatarMoeda(item.precoAtual)}</div>
                    <div className="text-sm text-muted-foreground">
                      Margem: {formatarPorcentagem(item.margemAtual)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;