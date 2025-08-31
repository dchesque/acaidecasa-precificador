import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, AlertTriangle, TrendingUp, Edit, Trash2, Search } from "lucide-react";

const Insumos = () => {
  const insumos = [
    {
      id: 1,
      nome: "Açaí Premium (1kg)",
      categoria: "Base",
      fornecedor: "Açaí do Norte",
      custoUnitario: 25.50,
      unidadeMedida: "kg",
      estoqueAtual: 50,
      estoqueMinimo: 20,
      ultimaCompra: "2024-01-15",
      status: "disponivel"
    },
    {
      id: 2,
      nome: "Banana (dúzia)",
      categoria: "Frutas",
      fornecedor: "Frutas & Cia",
      custoUnitario: 4.20,
      unidadeMedida: "dz",
      estoqueAtual: 15,
      estoqueMinimo: 10,
      ultimaCompra: "2024-01-20",
      status: "baixo"
    },
    {
      id: 3,
      nome: "Granola Tradicional (500g)",
      categoria: "Complementos",
      fornecedor: "Granola Artesanal",
      custoUnitario: 8.90,
      unidadeMedida: "pct",
      estoqueAtual: 35,
      estoqueMinimo: 15,
      ultimaCompra: "2024-01-18",
      status: "disponivel"
    },
    {
      id: 4,
      nome: "Morango (1kg)",
      categoria: "Frutas",
      fornecedor: "Frutas & Cia",
      custoUnitario: 12.80,
      unidadeMedida: "kg",
      estoqueAtual: 5,
      estoqueMinimo: 8,
      ultimaCompra: "2024-01-22",
      status: "critico"
    },
    {
      id: 5,
      nome: "Leite Condensado (395g)",
      categoria: "Complementos",
      fornecedor: "Laticínios Silva",
      custoUnitario: 3.75,
      unidadeMedida: "un",
      estoqueAtual: 25,
      estoqueMinimo: 12,
      ultimaCompra: "2024-01-19",
      status: "disponivel"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "default";
      case "baixo":
        return "outline";
      case "critico":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "baixo":
        return "Estoque Baixo";
      case "critico":
        return "Estoque Crítico";
      default:
        return "Indisponível";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Insumos</h1>
            <p className="text-muted-foreground mt-2">
              Controle de estoque e custos dos seus insumos
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Insumo
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Insumos</TabsTrigger>
            <TabsTrigger value="estoque">Controle de Estoque</TabsTrigger>
            <TabsTrigger value="custos">Análise de Custos</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <Input placeholder="Buscar insumo..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todas as categorias</option>
                    <option value="base">Base</option>
                    <option value="frutas">Frutas</option>
                    <option value="complementos">Complementos</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os fornecedores</option>
                    <option value="acai-norte">Açaí do Norte</option>
                    <option value="frutas-cia">Frutas & Cia</option>
                    <option value="granola">Granola Artesanal</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os status</option>
                    <option value="disponivel">Disponível</option>
                    <option value="baixo">Estoque Baixo</option>
                    <option value="critico">Estoque Crítico</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Insumos */}
            <div className="grid gap-4">
              {insumos.map((insumo) => (
                <Card key={insumo.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          {insumo.nome}
                        </CardTitle>
                        <CardDescription>
                          {insumo.categoria} • {insumo.fornecedor}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(insumo.status)}>
                          {getStatusText(insumo.status)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium">Custo Unitário</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {insumo.custoUnitario.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">por {insumo.unidadeMedida}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estoque Atual</p>
                        <p className="text-lg font-bold">
                          {insumo.estoqueAtual} {insumo.unidadeMedida}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estoque Mínimo</p>
                        <p className="text-lg font-bold text-muted-foreground">
                          {insumo.estoqueMinimo} {insumo.unidadeMedida}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Última Compra</p>
                        <p className="text-sm">{new Date(insumo.ultimaCompra).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Valor em Estoque</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {(insumo.estoqueAtual * insumo.custoUnitario).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estoque" className="space-y-4">
            {/* Alertas de Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Alertas de Estoque
                </CardTitle>
                <CardDescription>
                  Insumos que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insumos.filter(i => i.status !== "disponivel").map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{insumo.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {insumo.estoqueAtual} {insumo.unidadeMedida} 
                          (Mínimo: {insumo.estoqueMinimo} {insumo.unidadeMedida})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(insumo.status)}>
                          {getStatusText(insumo.status)}
                        </Badge>
                        <Button size="sm">Comprar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Movimento de Estoque */}
            <Card>
              <CardHeader>
                <CardTitle>Movimento de Estoque</CardTitle>
                <CardDescription>
                  Últimas movimentações de entrada e saída
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Entrada - Açaí Premium</h4>
                      <p className="text-sm text-muted-foreground">20 kg • 15/01/2024</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">+20 kg</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Saída - Banana</h4>
                      <p className="text-sm text-muted-foreground">5 dz • 22/01/2024</p>
                    </div>
                    <Badge variant="outline" className="text-red-600">-5 dz</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Entrada - Granola</h4>
                      <p className="text-sm text-muted-foreground">10 pct • 18/01/2024</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">+10 pct</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 2.847,50</div>
                  <p className="text-xs text-muted-foreground">
                    +12% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 11,03</div>
                  <p className="text-xs text-muted-foreground">
                    Por unidade de medida
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
                  <Badge variant="outline">4 ativos</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">97%</div>
                  <p className="text-xs text-muted-foreground">
                    Taxa de disponibilidade
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Base", "Frutas", "Complementos"].map((categoria) => {
                    const insumosCat = insumos.filter(i => i.categoria === categoria);
                    const valorTotal = insumosCat.reduce((acc, i) => acc + (i.estoqueAtual * i.custoUnitario), 0);
                    const porcentagem = (valorTotal / 2847.50) * 100;
                    
                    return (
                      <div key={categoria} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria}</h4>
                          <p className="text-sm text-muted-foreground">
                            {insumosCat.length} insumos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R$ {valorTotal.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{porcentagem.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insumos;