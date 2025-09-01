"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopoBaseModal } from "@/components/modals/CopoBaseModal";
import { useAppContext } from "@/contexts/AppContext";
import { CopoBase } from "@/types/database";
import { formatarMoeda, formatarPorcentagem } from "@/utils/calculations";
import { Plus, Coffee, Calculator, TrendingUp, Edit, Trash2, Search, Package } from "lucide-react";

const CoposBase = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCopoBase, setEditingCopoBase] = useState<CopoBase | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredCoposBase = state.coposBase.filter((copoBase) => {
    const matchesSearch = copoBase.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || copoBase.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewCopoBase = () => {
    setEditingCopoBase(undefined);
    setModalOpen(true);
  };

  const handleEditCopoBase = (copoBase: CopoBase) => {
    setEditingCopoBase(copoBase);
    setModalOpen(true);
  };

  const handleDeleteCopoBase = (copoBase: CopoBase) => {
    if (window.confirm(`Tem certeza que deseja excluir "${copoBase.nome}"?`)) {
      dispatch({ type: 'DELETE_COPO_BASE', payload: copoBase.id });
    }
  };

  const stats = {
    totalCoposBase: state.coposBase.filter(c => c.ativo).length,
    custoMedio: state.coposBase.length > 0 
      ? state.coposBase.reduce((acc, c) => acc + c.custoTotal, 0) / state.coposBase.length 
      : 0,
    margemMedia: state.coposBase.length > 0 
      ? state.coposBase.reduce((acc, c) => acc + c.margem, 0) / state.coposBase.length 
      : 0,
    categorias: new Set(state.coposBase.map(c => c.categoriaId)).size,
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
          <Button onClick={handleNewCopoBase} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Copo Base
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Copos Base</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoposBase}</div>
              <p className="text-xs text-muted-foreground">
                copos base cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedio)}</div>
              <p className="text-xs text-muted-foreground">
                custo médio por copo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarPorcentagem(stats.margemMedia)}</div>
              <p className="text-xs text-muted-foreground">
                margem média de lucro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categorias}</div>
              <p className="text-xs text-muted-foreground">
                categorias diferentes
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Copos Base</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
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
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Buscar copo base..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Todas as categorias</option>
                    {state.categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Copos Base */}
            <div className="grid gap-4">
              {filteredCoposBase.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum copo base encontrado</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {state.coposBase.length === 0 
                        ? "Comece adicionando seus primeiros copos base ao sistema."
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    {state.coposBase.length === 0 && (
                      <Button onClick={handleNewCopoBase}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Copo Base
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredCoposBase.map((copoBase) => (
                  <Card key={copoBase.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Coffee className="w-5 h-5" />
                            {copoBase.nome}
                          </CardTitle>
                          <CardDescription>
                            {copoBase.categoria?.nome} • Insumo: {copoBase.insumoBase?.nome}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={copoBase.ativo ? "default" : "secondary"}>
                            {copoBase.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCopoBase(copoBase)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCopoBase(copoBase)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Custo Base</p>
                          <p className="text-lg font-bold text-primary">
                            {formatarMoeda(copoBase.custoBase)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Custo Embalagens</p>
                          <p className="text-lg font-bold">
                            {formatarMoeda(copoBase.custoEmbalagens)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Custo Total</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatarMoeda(copoBase.custoTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Preço Sugerido</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatarMoeda(copoBase.precoSugerido)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Margem</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatarPorcentagem(copoBase.margem)}
                          </p>
                        </div>
                      </div>
                      {copoBase.embalagens && copoBase.embalagens.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Embalagens:</h5>
                          <div className="space-y-1">
                            {copoBase.embalagens.map((item, index) => {
                              const embalagem = state.embalagens.find(e => e.id === item.embalagemId);
                              return (
                                <div key={index} className="text-sm text-muted-foreground flex justify-between">
                                  <span>{embalagem?.nome} - {item.quantidade}x</span>
                                  <span>{formatarMoeda(item.custo)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Análise por Margem */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance por Margem</CardTitle>
                <CardDescription>
                  Copos base ordenados por margem de lucro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCoposBase
                    .sort((a, b) => b.margem - a.margem)
                    .map((copoBase, index) => (
                      <div key={copoBase.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{copoBase.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              Custo: {formatarMoeda(copoBase.custoTotal)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatarMoeda(copoBase.precoSugerido)}</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {formatarPorcentagem(copoBase.margem)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
                <CardDescription>
                  Médias de custo e margem por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.categorias.map((categoria) => {
                    const coposBaseCat = state.coposBase.filter(c => c.categoriaId === categoria.id);
                    const custoMedio = coposBaseCat.length > 0 
                      ? coposBaseCat.reduce((acc, c) => acc + c.custoTotal, 0) / coposBaseCat.length 
                      : 0;
                    const margemMedia = coposBaseCat.length > 0 
                      ? coposBaseCat.reduce((acc, c) => acc + c.margem, 0) / coposBaseCat.length 
                      : 0;
                    
                    if (coposBaseCat.length === 0) return null;
                    
                    return (
                      <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {coposBaseCat.length} copos base
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatarMoeda(custoMedio)}</p>
                          <p className="text-sm text-blue-600 font-semibold">
                            Margem: {formatarPorcentagem(margemMedia)}
                          </p>
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

      <CopoBaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        copoBase={editingCopoBase}
      />
    </Layout>
  );
};

export default CoposBase;