import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChefHat, Clock, Users, Calculator, Edit, Trash2, Search } from "lucide-react";

const Receitas = () => {
  const receitas = [
    {
      id: 1,
      nome: "Açaí Premium 500ml",
      categoria: "Tradicional",
      tempoPreparo: 3,
      porcoes: 1,
      custoTotal: 8.75,
      ingredientes: [
        { nome: "Açaí Premium", quantidade: 350, unidade: "g", custo: 8.95 },
        { nome: "Xarope de Guaraná", quantidade: 30, unidade: "ml", custo: 0.45 },
        { nome: "Água", quantidade: 120, unidade: "ml", custo: 0.05 }
      ],
      instrucoes: [
        "Bater o açaí com água gelada no liquidificador",
        "Adicionar xarope de guaraná aos poucos",
        "Bater até obter consistência cremosa",
        "Servir imediatamente"
      ],
      status: "ativo"
    },
    {
      id: 2,
      nome: "Açaí Fitness 300ml",
      categoria: "Saudável",
      tempoPreparo: 2,
      porcoes: 1,
      custoTotal: 6.20,
      ingredientes: [
        { nome: "Açaí Premium", quantidade: 250, unidade: "g", custo: 6.40 },
        { nome: "Água de Coco", quantidade: 100, unidade: "ml", custo: 0.80 }
      ],
      instrucoes: [
        "Bater o açaí com água de coco no liquidificador",
        "Não adicionar açúcar ou xarope",
        "Bater até obter consistência lisa",
        "Servir em pote de 300ml"
      ],
      status: "ativo"
    },
    {
      id: 3,
      nome: "Açaí Gourmet 500ml",
      categoria: "Premium",
      tempoPreparo: 5,
      porcoes: 1,
      custoTotal: 11.50,
      ingredientes: [
        { nome: "Açaí Premium", quantidade: 400, unidade: "g", custo: 10.24 },
        { nome: "Leite Condensado", quantidade: 50, unidade: "ml", custo: 0.75 },
        { nome: "Creme de Leite", quantidade: 30, unidade: "ml", custo: 0.45 },
        { nome: "Essência de Baunilha", quantidade: 2, unidade: "ml", custo: 0.06 }
      ],
      instrucoes: [
        "Bater o açaí com metade do leite condensado",
        "Adicionar creme de leite e essência de baunilha",
        "Bater até obter consistência cremosa e homogênea",
        "Ajustar doçura com restante do leite condensado",
        "Servir decorado"
      ],
      status: "ativo"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as receitas e fórmulas dos seus produtos
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Receita
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Receitas</TabsTrigger>
            <TabsTrigger value="calculadora">Calculadora de Custos</TabsTrigger>
            <TabsTrigger value="analise">Análise Nutricional</TabsTrigger>
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
                  <Input placeholder="Buscar receita..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todas as categorias</option>
                    <option value="tradicional">Tradicional</option>
                    <option value="saudavel">Saudável</option>
                    <option value="premium">Premium</option>
                    <option value="especial">Especial</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="teste">Em Teste</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Receitas */}
            <div className="grid gap-6">
              {receitas.map((receita) => (
                <Card key={receita.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ChefHat className="w-5 h-5" />
                          {receita.nome}
                        </CardTitle>
                        <CardDescription>
                          {receita.categoria}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={receita.status === "ativo" ? "default" : "secondary"}>
                          {receita.status}
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Informações Básicas */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Informações Básicas</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{receita.tempoPreparo} minutos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{receita.porcoes} porção</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-bold text-destructive">
                              Custo: R$ {receita.custoTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ingredientes */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Ingredientes</h4>
                        <div className="space-y-2">
                          {receita.ingredientes.map((ingrediente, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                              <div>
                                <p className="text-sm font-medium">{ingrediente.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ingrediente.quantidade} {ingrediente.unidade}
                                </p>
                              </div>
                              <span className="text-sm font-medium">
                                R$ {ingrediente.custo.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modo de Preparo */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Modo de Preparo</h4>
                        <ol className="space-y-2">
                          {receita.instrucoes.map((instrucao, index) => (
                            <li key={index} className="text-sm flex gap-2">
                              <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{instrucao}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calculadora" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Calculadora de Custos
                </CardTitle>
                <CardDescription>
                  Calcule os custos de uma nova receita ou modifique uma existente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Receita</label>
                    <Input placeholder="Ex: Açaí Especial 400ml" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Selecionar categoria</option>
                      <option value="tradicional">Tradicional</option>
                      <option value="premium">Premium</option>
                      <option value="saudavel">Saudável</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ingredientes</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3 p-3 border rounded-lg">
                      <Input placeholder="Ingrediente" />
                      <Input placeholder="Quantidade" type="number" />
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="un">un</option>
                      </select>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">R$ 0,00</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      + Adicionar Ingrediente
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Custo Total</p>
                      <p className="text-2xl font-bold text-destructive">R$ 0,00</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Custo por 100ml</p>
                      <p className="text-2xl font-bold">R$ 0,00</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margem Sugerida (120%)</p>
                      <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analise" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Comparativa de Receitas</CardTitle>
                <CardDescription>
                  Compare custos e rendimento das receitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receitas.map((receita) => {
                    const custoPor100ml = (receita.custoTotal / 500) * 100; // Assumindo 500ml como base
                    const rendimento = ((15.90 - receita.custoTotal) / receita.custoTotal) * 100; // Preço de venda exemplo
                    
                    return (
                      <div key={receita.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{receita.nome}</h4>
                          <p className="text-sm text-muted-foreground">{receita.categoria}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Custo Total</p>
                            <p className="font-bold text-destructive">R$ {receita.custoTotal.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Custo/100ml</p>
                            <p className="font-bold">R$ {custoPor100ml.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ingredientes</p>
                            <p className="font-bold">{receita.ingredientes.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rendimento</p>
                            <p className="font-bold text-green-600">{rendimento.toFixed(1)}%</p>
                          </div>
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

export default Receitas;