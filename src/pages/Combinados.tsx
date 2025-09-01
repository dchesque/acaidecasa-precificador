"use client"
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Layers, Calculator, Edit, Trash2, Search } from "lucide-react";

const Combinados = () => {
  const combinados = [
    {
      id: 1,
      nome: "Açaí Completo 500ml",
      categoria: "Premium",
      itens: ["Açaí 500ml", "Granola", "Banana", "Morango", "Leite Condensado"],
      custoTotal: 8.75,
      precoSugerido: 15.90,
      margem: 81.7,
      status: "ativo"
    },
    {
      id: 2,
      nome: "Açaí Fitness 300ml",
      categoria: "Saudável",
      itens: ["Açaí 300ml", "Granola Light", "Banana", "Castanhas"],
      custoTotal: 6.20,
      precoSugerido: 12.50,
      margem: 101.6,
      status: "ativo"
    },
    {
      id: 3,
      nome: "Açaí Kids 200ml",
      categoria: "Infantil",
      itens: ["Açaí 200ml", "Granola", "Banana", "Chocolate Granulado"],
      custoTotal: 4.15,
      precoSugerido: 8.90,
      margem: 114.5,
      status: "ativo"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Combinados</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os produtos combinados e kits do seu cardápio
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Combinado
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Combinados</TabsTrigger>
            <TabsTrigger value="analise">Análise de Margens</TabsTrigger>
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
                  <Input placeholder="Buscar combinado..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todas as categorias</option>
                    <option value="premium">Premium</option>
                    <option value="saudavel">Saudável</option>
                    <option value="infantil">Infantil</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Combinados */}
            <div className="grid gap-4">
              {combinados.map((combinado) => (
                <Card key={combinado.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5" />
                          {combinado.nome}
                        </CardTitle>
                        <CardDescription>
                          Categoria: {combinado.categoria}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={combinado.status === "ativo" ? "default" : "secondary"}>
                          {combinado.status}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Itens Inclusos:</h4>
                        <ul className="space-y-1">
                          {combinado.itens.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Custo Total</p>
                          <p className="text-lg font-bold text-destructive">
                            R$ {combinado.custoTotal.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Preço Sugerido</p>
                          <p className="text-lg font-bold text-primary">
                            R$ {combinado.precoSugerido.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center items-center">
                        <div className="text-center">
                          <p className="text-sm font-medium">Margem de Lucro</p>
                          <p className="text-2xl font-bold text-green-600">
                            {combinado.margem.toFixed(1)}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Recalcular
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analise" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Margens</CardTitle>
                <CardDescription>
                  Comparativo de rentabilidade dos combinados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {combinados.map((combinado) => (
                    <div key={combinado.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{combinado.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          Custo: R$ {combinado.custoTotal.toFixed(2)} | 
                          Preço: R$ {combinado.precoSugerido.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {combinado.margem.toFixed(1)}%
                        </div>
                        <div className="w-32 bg-secondary rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.min(combinado.margem, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Combinados;