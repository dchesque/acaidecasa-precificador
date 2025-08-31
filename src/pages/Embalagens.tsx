import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Archive, Truck, Calculator, Edit, Trash2, Search } from "lucide-react";

const Embalagens = () => {
  const embalagens = [
    {
      id: 1,
      nome: "Pote Plástico 300ml",
      categoria: "Potes",
      fornecedor: "Embalagens Express",
      custoUnitario: 0.85,
      estoqueAtual: 500,
      estoqueMinimo: 100,
      capacidade: "300ml",
      material: "Plástico PP",
      cor: "Transparente",
      status: "disponivel"
    },
    {
      id: 2,
      nome: "Pote Plástico 500ml",
      categoria: "Potes",
      fornecedor: "Embalagens Express",
      custoUnitario: 1.20,
      estoqueAtual: 250,
      estoqueMinimo: 80,
      capacidade: "500ml",
      material: "Plástico PP",
      cor: "Transparente",
      status: "disponivel"
    },
    {
      id: 3,
      nome: "Pote Plástico 1L",
      categoria: "Potes",
      fornecedor: "Embalagens Express",
      custoUnitario: 1.85,
      estoqueAtual: 45,
      estoqueMinimo: 50,
      capacidade: "1000ml",
      material: "Plástico PP",
      cor: "Transparente",
      status: "baixo"
    },
    {
      id: 4,
      nome: "Tampa para Pote 300ml",
      categoria: "Tampas",
      fornecedor: "Embalagens Express",
      custoUnitario: 0.35,
      estoqueAtual: 480,
      estoqueMinimo: 100,
      capacidade: "Para pote 300ml",
      material: "Plástico PP",
      cor: "Branca",
      status: "disponivel"
    },
    {
      id: 5,
      nome: "Colher Plástica Descartável",
      categoria: "Utensílios",
      fornecedor: "Descartáveis Silva",
      custoUnitario: 0.08,
      estoqueAtual: 1500,
      estoqueMinimo: 500,
      capacidade: "Pequena",
      material: "Plástico PS",
      cor: "Branca",
      status: "disponivel"
    },
    {
      id: 6,
      nome: "Sacola Plástica 30x40cm",
      categoria: "Sacolas",
      fornecedor: "Embalagens Express",
      custoUnitario: 0.15,
      estoqueAtual: 200,
      estoqueMinimo: 300,
      capacidade: "30x40cm",
      material: "Plástico PEBD",
      cor: "Branca",
      status: "critico"
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
            <h1 className="text-3xl font-bold text-foreground">Embalagens</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as embalagens e materiais descartáveis
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Embalagem
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Embalagens</TabsTrigger>
            <TabsTrigger value="kits">Kits de Embalagem</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
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
                  <Input placeholder="Buscar embalagem..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todas as categorias</option>
                    <option value="potes">Potes</option>
                    <option value="tampas">Tampas</option>
                    <option value="utensilios">Utensílios</option>
                    <option value="sacolas">Sacolas</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os materiais</option>
                    <option value="plastico-pp">Plástico PP</option>
                    <option value="plastico-ps">Plástico PS</option>
                    <option value="plastico-pebd">Plástico PEBD</option>
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

            {/* Lista de Embalagens */}
            <div className="grid gap-4">
              {embalagens.map((embalagem) => (
                <Card key={embalagem.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="w-5 h-5" />
                          {embalagem.nome}
                        </CardTitle>
                        <CardDescription>
                          {embalagem.categoria} • {embalagem.fornecedor}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(embalagem.status)}>
                          {getStatusText(embalagem.status)}
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
                        <p className="text-sm font-medium">Custo Unitário</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {embalagem.custoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estoque</p>
                        <p className="text-lg font-bold">
                          {embalagem.estoqueAtual} un
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Capacidade</p>
                        <p className="text-sm">{embalagem.capacidade}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Material</p>
                        <p className="text-sm">{embalagem.material}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cor</p>
                        <p className="text-sm">{embalagem.cor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Valor Total</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {(embalagem.estoqueAtual * embalagem.custoUnitario).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Kits de Embalagem por Produto
                </CardTitle>
                <CardDescription>
                  Combinações de embalagens para cada tipo de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Kit Açaí 300ml</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Componentes:</p>
                        <ul className="text-sm space-y-1">
                          <li>• 1x Pote 300ml (R$ 0,85)</li>
                          <li>• 1x Tampa 300ml (R$ 0,35)</li>
                          <li>• 1x Colher (R$ 0,08)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Total do Kit</p>
                        <p className="text-xl font-bold text-primary">R$ 1,28</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Kits Disponíveis</p>
                        <p className="text-xl font-bold">480</p>
                        <p className="text-xs text-muted-foreground">Baseado no item com menor estoque</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Kit Açaí 500ml</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Componentes:</p>
                        <ul className="text-sm space-y-1">
                          <li>• 1x Pote 500ml (R$ 1,20)</li>
                          <li>• 1x Tampa 500ml (R$ 0,40)</li>
                          <li>• 1x Colher (R$ 0,08)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Total do Kit</p>
                        <p className="text-xl font-bold text-primary">R$ 1,68</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Kits Disponíveis</p>
                        <p className="text-xl font-bold">250</p>
                        <p className="text-xs text-muted-foreground">Baseado no item com menor estoque</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Kit Açaí 1L (Para Viagem)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Componentes:</p>
                        <ul className="text-sm space-y-1">
                          <li>• 1x Pote 1L (R$ 1,85)</li>
                          <li>• 1x Tampa 1L (R$ 0,55)</li>
                          <li>• 2x Colher (R$ 0,16)</li>
                          <li>• 1x Sacola (R$ 0,15)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Custo Total do Kit</p>
                        <p className="text-xl font-bold text-primary">R$ 2,71</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Kits Disponíveis</p>
                        <p className="text-xl font-bold text-red-600">45</p>
                        <p className="text-xs text-muted-foreground">Estoque baixo - reabastecer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fornecedores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Fornecedores de Embalagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Embalagens Express</h3>
                        <p className="text-sm text-muted-foreground">Potes, tampas e sacolas</p>
                      </div>
                      <Badge variant="default">Principal</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Produtos:</p>
                        <p>5 itens</p>
                      </div>
                      <div>
                        <p className="font-medium">Valor Médio:</p>
                        <p>R$ 1,08</p>
                      </div>
                      <div>
                        <p className="font-medium">Prazo Entrega:</p>
                        <p>3-5 dias</p>
                      </div>
                      <div>
                        <p className="font-medium">Última Compra:</p>
                        <p>15/01/2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Descartáveis Silva</h3>
                        <p className="text-sm text-muted-foreground">Utensílios descartáveis</p>
                      </div>
                      <Badge variant="outline">Secundário</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Produtos:</p>
                        <p>1 item</p>
                      </div>
                      <div>
                        <p className="font-medium">Valor Médio:</p>
                        <p>R$ 0,08</p>
                      </div>
                      <div>
                        <p className="font-medium">Prazo Entrega:</p>
                        <p>2-3 dias</p>
                      </div>
                      <div>
                        <p className="font-medium">Última Compra:</p>
                        <p>20/01/2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Embalagens;