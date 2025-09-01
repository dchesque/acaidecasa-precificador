"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceitaModal } from "@/components/modals/ReceitaModal";
import { useAppContext } from "@/contexts/AppContext";
import { Receita } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { Plus, ChefHat, Clock, Calculator, Edit, Trash2, Search, Users } from "lucide-react";

const Receitas = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredReceitas = state.receitas.filter((receita) => {
    const matchesSearch = receita.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || receita.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewReceita = () => {
    setEditingReceita(undefined);
    setModalOpen(true);
  };

  const handleEditReceita = (receita: Receita) => {
    setEditingReceita(receita);
    setModalOpen(true);
  };

  const handleDeleteReceita = (receita: Receita) => {
    if (window.confirm(`Tem certeza que deseja excluir "${receita.nome}"?`)) {
      dispatch({ type: 'DELETE_RECEITA', payload: receita.id });
    }
  };

  const stats = {
    totalReceitas: state.receitas.filter(r => r.ativo).length,
    custoMedio: state.receitas.length > 0 
      ? state.receitas.reduce((acc, r) => acc + r.custoPorGrama, 0) / state.receitas.length 
      : 0,
    tempoMedio: state.receitas.length > 0 
      ? state.receitas.reduce((acc, r) => acc + (r.tempoPreparo || 0), 0) / state.receitas.length 
      : 0,
    categorias: new Set(state.receitas.map(r => r.categoriaId)).size,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
            <p className="text-muted-foreground mt-2">
              Gestão de receitas e análise de custos para precificação
            </p>
          </div>
          <Button onClick={handleNewReceita} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Receita
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReceitas}</div>
              <p className="text-xs text-muted-foreground">
                receitas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio/g</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedio)}</div>
              <p className="text-xs text-muted-foreground">
                custo médio por grama
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.tempoMedio)}min</div>
              <p className="text-xs text-muted-foreground">
                tempo médio de preparo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
            <TabsTrigger value="lista">Lista de Receitas</TabsTrigger>
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
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Buscar receita..." 
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

            {/* Lista de Receitas */}
            <div className="grid gap-4">
              {filteredReceitas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma receita encontrada</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {state.receitas.length === 0 
                        ? "Comece adicionando suas primeiras receitas ao sistema."
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    {state.receitas.length === 0 && (
                      <Button onClick={handleNewReceita}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeira Receita
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredReceitas.map((receita) => (
                  <Card key={receita.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ChefHat className="w-5 h-5" />
                            {receita.nome}
                          </CardTitle>
                          <CardDescription>
                            {receita.categoria?.nome} • Rendimento: {receita.rendimento}g
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={receita.ativo ? "default" : "secondary"}>
                            {receita.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditReceita(receita)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteReceita(receita)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Custo Total</p>
                          <p className="text-lg font-bold text-primary">
                            {formatarMoeda(receita.custoTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Custo por Grama</p>
                          <p className="text-lg font-bold">
                            {formatarMoeda(receita.custoPorGrama)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tempo de Preparo</p>
                          <p className="text-lg font-bold text-muted-foreground">
                            {receita.tempoPreparo || 0} min
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ingredientes</p>
                          <p className="text-lg font-bold text-muted-foreground">
                            {receita.ingredientes?.length || 0} itens
                          </p>
                        </div>
                      </div>
                      {receita.ingredientes && receita.ingredientes.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Ingredientes:</h5>
                          <div className="space-y-1">
                            {receita.ingredientes.map((ingrediente, index) => {
                              const insumo = state.insumos.find(i => i.id === ingrediente.insumoId);
                              return (
                                <div key={index} className="text-sm text-muted-foreground flex justify-between">
                                  <span>{insumo?.nome} - {ingrediente.quantidade}g</span>
                                  <span>{formatarMoeda(ingrediente.custo)}</span>
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

          <TabsContent value="custos" className="space-y-4">
            {/* Análise por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos por Categoria</CardTitle>
                <CardDescription>
                  Distribuição de custos médios por categoria de receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.categorias.map((categoria) => {
                    const receitasCat = state.receitas.filter(r => r.categoriaId === categoria.id);
                    const custoMedio = receitasCat.length > 0 
                      ? receitasCat.reduce((acc, r) => acc + r.custoPorGrama, 0) / receitasCat.length 
                      : 0;
                    
                    if (receitasCat.length === 0) return null;
                    
                    return (
                      <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {receitasCat.length} receitas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatarMoeda(custoMedio)}</p>
                          <p className="text-sm text-muted-foreground">custo médio/g</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Receitas Mais Custosas */}
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Custo</CardTitle>
                <CardDescription>
                  Receitas ordenadas por custo total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReceitas
                    .sort((a, b) => b.custoTotal - a.custoTotal)
                    .slice(0, 10)
                    .map((receita, index) => (
                      <div key={receita.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{receita.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              Rendimento: {receita.rendimento}g
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatarMoeda(receita.custoTotal)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatarMoeda(receita.custoPorGrama)}/g
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

      <ReceitaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        receita={editingReceita}
      />
    </Layout>
  );
};

export default Receitas;