import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MenuSquare, Eye, Edit, Download, Upload, Star, Clock } from "lucide-react";

const Cardapio = () => {
  const categorias = [
    {
      nome: "Açaí Tradicional",
      itens: [
        { nome: "Açaí 300ml", preco: 12.90, custo: 5.80, margem: 122.4, disponivel: true },
        { nome: "Açaí 500ml", preco: 18.90, custo: 8.50, margem: 122.4, disponivel: true },
        { nome: "Açaí 1L", preco: 32.90, custo: 15.20, margem: 116.4, disponivel: true }
      ]
    },
    {
      nome: "Açaí Premium",
      itens: [
        { nome: "Açaí Gourmet 300ml", preco: 16.90, custo: 7.20, margem: 134.7, disponivel: true },
        { nome: "Açaí Gourmet 500ml", preco: 24.90, custo: 11.50, margem: 116.5, disponivel: true }
      ]
    },
    {
      nome: "Combinados",
      itens: [
        { nome: "Açaí Completo 500ml", preco: 22.90, custo: 10.75, margem: 113.0, disponivel: true },
        { nome: "Açaí Fitness 300ml", preco: 18.50, custo: 8.20, margem: 125.6, disponivel: true },
        { nome: "Açaí Kids 200ml", preco: 12.90, custo: 5.90, margem: 118.6, disponivel: false }
      ]
    },
    {
      nome: "Sobremesas",
      itens: [
        { nome: "Torta de Açaí", preco: 8.90, custo: 3.50, margem: 154.3, disponivel: true },
        { nome: "Sorvete de Açaí", preco: 6.90, custo: 2.80, margem: 146.4, disponivel: true }
      ]
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie seu cardápio completo
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Cardápio
            </Button>
          </div>
        </div>

        <Tabs defaultValue="visualizacao" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visualizacao">Visualização</TabsTrigger>
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizacao" className="space-y-6">
            {/* Controles de Visualização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Controles de Visualização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="mostrar-precos" defaultChecked />
                    <Label htmlFor="mostrar-precos">Mostrar Preços</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mostrar-custos" />
                    <Label htmlFor="mostrar-custos">Mostrar Custos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mostrar-margens" />
                    <Label htmlFor="mostrar-margens">Mostrar Margens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="apenas-disponiveis" defaultChecked />
                    <Label htmlFor="apenas-disponiveis">Apenas Disponíveis</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cardápio por Categorias */}
            {categorias.map((categoria, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MenuSquare className="w-5 h-5" />
                    {categoria.nome}
                  </CardTitle>
                  <CardDescription>
                    {categoria.itens.length} itens nesta categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {categoria.itens.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          !item.disponivel ? 'opacity-50 bg-muted/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold">{item.nome}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={item.disponivel ? "default" : "secondary"}>
                                {item.disponivel ? "Disponível" : "Indisponível"}
                              </Badge>
                              {item.margem > 130 && (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Star className="w-3 h-3 mr-1" />
                                  Alta Margem
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Custo</p>
                            <p className="font-semibold text-destructive">
                              R$ {item.custo.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Preço</p>
                            <p className="text-lg font-bold text-primary">
                              R$ {item.preco.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Margem</p>
                            <p className="font-bold text-green-600">
                              {item.margem.toFixed(1)}%
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="configuracao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Cardápio</CardTitle>
                <CardDescription>
                  Ajuste a apresentação e organização do seu cardápio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-estabelecimento">Nome do Estabelecimento</Label>
                    <Input id="nome-estabelecimento" placeholder="Açaí Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input id="slogan" placeholder="O melhor açaí da cidade!" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Segunda a Sexta</Label>
                      <div className="flex items-center gap-2">
                        <Input placeholder="08:00" className="w-24" />
                        <span>às</span>
                        <Input placeholder="22:00" className="w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sábado e Domingo</Label>
                      <div className="flex items-center gap-2">
                        <Input placeholder="10:00" className="w-24" />
                        <span>às</span>
                        <Input placeholder="23:00" className="w-24" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opções de Exibição</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="mostrar-fotos" defaultChecked />
                      <Label htmlFor="mostrar-fotos">Mostrar Fotos dos Produtos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="mostrar-descricoes" />
                      <Label htmlFor="mostrar-descricoes">Mostrar Descrições</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="destacar-promocoes" defaultChecked />
                      <Label htmlFor="destacar-promocoes">Destacar Promoções</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="mostrar-tempo-preparo" />
                      <Label htmlFor="mostrar-tempo-preparo">Mostrar Tempo de Preparo</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Itens Mais Vendidos</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Açaí 500ml</span>
                      <span className="text-sm font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Açaí Completo</span>
                      <span className="text-sm font-semibold">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Açaí 300ml</span>
                      <span className="text-sm font-semibold">22%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
                  <Badge variant="outline">125.3%</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ 8.45</div>
                  <p className="text-xs text-muted-foreground">
                    Lucro médio por produto
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5.2 min</div>
                  <p className="text-xs text-muted-foreground">
                    Tempo de preparo médio
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorias.map((categoria, index) => {
                    const vendas = [35, 28, 20, 12][index];
                    const margemMedia = categoria.itens.reduce((acc, item) => acc + item.margem, 0) / categoria.itens.length;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {categoria.itens.length} itens
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Vendas</p>
                            <p className="font-semibold">{vendas}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Margem Média</p>
                            <p className="font-semibold text-green-600">{margemMedia.toFixed(1)}%</p>
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

export default Cardapio;