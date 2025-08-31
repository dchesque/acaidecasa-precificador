import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Coffee, Zap, Calculator, TrendingUp, Edit, Trash2, Search } from "lucide-react";

const CoposBase = () => {
  const coposBase = [
    {
      id: 1,
      nome: "Açaí Base 300ml",
      tamanho: "300ml",
      receita: "Açaí Premium 300ml",
      custoReceita: 5.25,
      custoEmbalagem: 1.28,
      custoTotal: 6.53,
      tempoPreparoMin: 3,
      precoSugerido: 12.90,
      margem: 97.5,
      popularidade: 85,
      status: "ativo"
    },
    {
      id: 2,
      nome: "Açaí Base 500ml",
      tamanho: "500ml",
      receita: "Açaí Premium 500ml",
      custoReceita: 8.75,
      custoEmbalagem: 1.68,
      custoTotal: 10.43,
      tempoPreparoMin: 4,
      precoSugerido: 18.90,
      margem: 81.2,
      popularidade: 92,
      status: "ativo"
    },
    {
      id: 3,
      nome: "Açaí Base 1L",
      tamanho: "1000ml",
      receita: "Açaí Premium 1L",
      custoReceita: 17.50,
      custoEmbalagem: 2.71,
      custoTotal: 20.21,
      tempoPreparoMin: 6,
      precoSugerido: 32.90,
      margem: 62.8,
      popularidade: 65,
      status: "ativo"
    },
    {
      id: 4,
      nome: "Açaí Fitness 300ml",
      tamanho: "300ml",
      receita: "Açaí Fitness 300ml",
      custoReceita: 6.20,
      custoEmbalagem: 1.28,
      custoTotal: 7.48,
      tempoPreparoMin: 2,
      precoSugerido: 15.50,
      margem: 107.2,
      popularidade: 70,
      status: "ativo"
    },
    {
      id: 5,
      nome: "Açaí Gourmet 500ml",
      tamanho: "500ml",
      receita: "Açaí Gourmet 500ml",
      custoReceita: 11.50,
      custoEmbalagem: 1.68,
      custoTotal: 13.18,
      tempoPreparoMin: 5,
      precoSugerido: 24.90,
      margem: 89.0,
      popularidade: 78,
      status: "ativo"
    }
  ];

  const getPopularidadeColor = (popularidade: number) => {
    if (popularidade >= 80) return "text-green-600";
    if (popularidade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Copos Base</h1>
            <p className="text-muted-foreground mt-2">
              Produtos base prontos para complementos e personalização
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Copo Base
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Copos Base</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
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
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Buscar copo base..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os tamanhos</option>
                    <option value="300ml">300ml</option>
                    <option value="500ml">500ml</option>
                    <option value="1000ml">1000ml</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Copos Base */}
            <div className="grid gap-4">
              {coposBase.map((copo) => (
                <Card key={copo.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Coffee className="w-5 h-5" />
                          {copo.nome}
                        </CardTitle>
                        <CardDescription>
                          Baseado em: {copo.receita}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={copo.status === "ativo" ? "default" : "secondary"}>
                          {copo.status}
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
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm font-medium">Tamanho</p>
                        <p className="text-lg font-bold text-primary">{copo.tamanho}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Receita</p>
                        <p className="text-lg font-bold text-destructive">
                          R$ {copo.custoReceita.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Embalagem</p>
                        <p className="text-lg font-bold text-muted-foreground">
                          R$ {copo.custoEmbalagem.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Total</p>
                        <p className="text-lg font-bold">
                          R$ {copo.custoTotal.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preço Sugerido</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {copo.precoSugerido.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Margem</p>
                        <p className="text-lg font-bold text-green-600">
                          {copo.margem.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Tempo de Preparo</p>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{copo.tempoPreparoMin} minutos</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Popularidade</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${copo.popularidade}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold ${getPopularidadeColor(copo.popularidade)}`}>
                            {copo.popularidade}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Copo Mais Vendido</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Açaí Base 500ml</div>
                  <p className="text-xs text-muted-foreground">
                    92% de popularidade
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maior Margem</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">107.2%</div>
                  <p className="text-xs text-muted-foreground">
                    Açaí Fitness 300ml
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Preparo Mais Rápido</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2 min</div>
                  <p className="text-xs text-muted-foreground">
                    Açaí Fitness 300ml
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Performance</CardTitle>
                <CardDescription>
                  Copos base ordenados por popularidade e margem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coposBase
                    .sort((a, b) => b.popularidade - a.popularidade)
                    .map((copo, index) => (
                      <div key={copo.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{copo.nome}</h4>
                            <p className="text-sm text-muted-foreground">{copo.tamanho}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Popularidade</p>
                            <p className={`font-bold ${getPopularidadeColor(copo.popularidade)}`}>
                              {copo.popularidade}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Margem</p>
                            <p className="font-bold text-green-600">{copo.margem.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Custo</p>
                            <p className="font-bold">R$ {copo.custoTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparativo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Comparativa por Tamanho</CardTitle>
                <CardDescription>
                  Compare custos e rentabilidade entre os diferentes tamanhos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["300ml", "500ml", "1000ml"].map((tamanho) => {
                    const coposTamanho = coposBase.filter(c => c.tamanho === tamanho);
                    
                    return (
                      <div key={tamanho} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-4">Tamanho {tamanho}</h3>
                        <div className="space-y-3">
                          {coposTamanho.map((copo) => (
                            <div key={copo.id} className="grid grid-cols-5 gap-4 p-3 bg-muted/30 rounded">
                              <div>
                                <p className="text-sm font-medium">{copo.nome}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Custo</p>
                                <p className="font-bold">R$ {copo.custoTotal.toFixed(2)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Preço</p>
                                <p className="font-bold text-green-600">R$ {copo.precoSugerido.toFixed(2)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Margem</p>
                                <p className="font-bold text-green-600">{copo.margem.toFixed(1)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Tempo</p>
                                <p className="font-bold">{copo.tempoPreparoMin}min</p>
                              </div>
                            </div>
                          ))}
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

export default CoposBase;