import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Phone, Mail, MapPin, Edit, Trash2, Search, Star } from "lucide-react";

const Fornecedores = () => {
  const fornecedores = [
    {
      id: 1,
      nome: "Açaí do Norte Ltda",
      categoria: "Açaí",
      contato: "(11) 99999-0001",
      email: "contato@acaidonorte.com.br",
      endereco: "São Paulo, SP",
      avaliacao: 4.8,
      status: "ativo",
      produtos: ["Açaí Premium", "Açaí Tradicional"]
    },
    {
      id: 2,
      nome: "Frutas & Cia",
      categoria: "Frutas",
      contato: "(11) 99999-0002", 
      email: "vendas@frutasecia.com.br",
      endereco: "Campinas, SP",
      avaliacao: 4.5,
      status: "ativo",
      produtos: ["Banana", "Morango", "Kiwi", "Manga"]
    },
    {
      id: 3,
      nome: "Embalagens Express",
      categoria: "Embalagens",
      contato: "(11) 99999-0003",
      email: "pedidos@embalaexpress.com.br", 
      endereco: "Guarulhos, SP",
      avaliacao: 4.2,
      status: "ativo",
      produtos: ["Potes 300ml", "Potes 500ml", "Colheres", "Tampas"]
    },
    {
      id: 4,
      nome: "Granola Artesanal",
      categoria: "Complementos",
      contato: "(11) 99999-0004",
      email: "contato@granolaartesanal.com.br",
      endereco: "São Paulo, SP", 
      avaliacao: 4.9,
      status: "inativo",
      produtos: ["Granola Tradicional", "Granola Light", "Castanhas"]
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus fornecedores e mantenha os contatos atualizados
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Fornecedores</TabsTrigger>
            <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
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
                  <Input placeholder="Buscar fornecedor..." />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todas as categorias</option>
                    <option value="acai">Açaí</option>
                    <option value="frutas">Frutas</option>
                    <option value="embalagens">Embalagens</option>
                    <option value="complementos">Complementos</option>
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Fornecedores */}
            <div className="grid gap-4">
              {fornecedores.map((fornecedor) => (
                <Card key={fornecedor.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {fornecedor.nome}
                        </CardTitle>
                        <CardDescription>
                          {fornecedor.categoria}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{fornecedor.avaliacao}</span>
                        </div>
                        <Badge variant={fornecedor.status === "ativo" ? "default" : "secondary"}>
                          {fornecedor.status}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{fornecedor.contato}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{fornecedor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{fornecedor.endereco}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Produtos:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {fornecedor.produtos.map((produto, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {produto}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            {["Açaí", "Frutas", "Embalagens", "Complementos"].map((categoria) => {
              const fornecedoresCategoria = fornecedores.filter(f => f.categoria === categoria);
              return (
                <Card key={categoria}>
                  <CardHeader>
                    <CardTitle>{categoria}</CardTitle>
                    <CardDescription>
                      {fornecedoresCategoria.length} fornecedores nesta categoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {fornecedoresCategoria.map((fornecedor) => (
                        <div key={fornecedor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{fornecedor.nome}</h4>
                            <p className="text-sm text-muted-foreground">{fornecedor.contato}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{fornecedor.avaliacao}</span>
                            </div>
                            <Badge variant={fornecedor.status === "ativo" ? "default" : "secondary"}>
                              {fornecedor.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="avaliacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Fornecedores</CardTitle>
                <CardDescription>
                  Fornecedores ordenados por avaliação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fornecedores
                    .sort((a, b) => b.avaliacao - a.avaliacao)
                    .map((fornecedor, index) => (
                      <div key={fornecedor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{fornecedor.nome}</h4>
                            <p className="text-sm text-muted-foreground">{fornecedor.categoria}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-bold">{fornecedor.avaliacao}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {fornecedor.produtos.length} produtos
                          </p>
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

export default Fornecedores;