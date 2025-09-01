import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmbalagemModal } from "@/components/modals/EmbalagemModal";
import { useAppContext } from "@/contexts/AppContext";
import { Embalagem } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { Plus, Archive, Edit, Trash2, Search, Package } from "lucide-react";

const Embalagens = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmbalagem, setEditingEmbalagem] = useState<Embalagem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const filteredEmbalagens = state.embalagens.filter((embalagem) => {
    const matchesSearch = embalagem.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || embalagem.categoriaId === selectedCategory;
    const matchesSupplier = !selectedSupplier || embalagem.fornecedorPrincipalId === selectedSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleNewEmbalagem = () => {
    setEditingEmbalagem(undefined);
    setModalOpen(true);
  };

  const handleEditEmbalagem = (embalagem: Embalagem) => {
    setEditingEmbalagem(embalagem);
    setModalOpen(true);
  };

  const handleDeleteEmbalagem = (embalagem: Embalagem) => {
    if (window.confirm(`Tem certeza que deseja excluir "${embalagem.nome}"?`)) {
      dispatch({ type: 'DELETE_EMBALAGEM', payload: embalagem.id });
    }
  };

  const stats = {
    totalEmbalagens: state.embalagens.filter(e => e.ativo).length,
    custoMedio: state.embalagens.length > 0 
      ? state.embalagens.reduce((acc, e) => acc + e.custoPorUnidade, 0) / state.embalagens.length 
      : 0,
    fornecedoresAtivos: new Set(state.embalagens.map(e => e.fornecedorPrincipalId)).size,
    categorias: new Set(state.embalagens.map(e => e.categoriaId)).size,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Embalagens</h1>
            <p className="text-muted-foreground mt-2">
              Gestão de embalagens e análise de custos para precificação
            </p>
          </div>
          <Button onClick={handleNewEmbalagem} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Embalagem
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Embalagens</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmbalagens}</div>
              <p className="text-xs text-muted-foreground">
                embalagens cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio/un</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedio)}</div>
              <p className="text-xs text-muted-foreground">
                custo médio por unidade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fornecedoresAtivos}</div>
              <p className="text-xs text-muted-foreground">
                fornecedores ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
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
            <TabsTrigger value="lista">Lista de Embalagens</TabsTrigger>
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
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    placeholder="Buscar embalagem..." 
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
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                  >
                    <option value="">Todos os fornecedores</option>
                    {state.fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Embalagens */}
            <div className="grid gap-4">
              {filteredEmbalagens.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma embalagem encontrada</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {state.embalagens.length === 0 
                        ? "Comece adicionando suas primeiras embalagens ao sistema."
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    {state.embalagens.length === 0 && (
                      <Button onClick={handleNewEmbalagem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeira Embalagem
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredEmbalagens.map((embalagem) => (
                  <Card key={embalagem.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Archive className="w-5 h-5" />
                            {embalagem.nome}
                          </CardTitle>
                          <CardDescription>
                            {embalagem.categoria?.nome} • {embalagem.fornecedorPrincipal?.nome}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={embalagem.ativo ? "default" : "secondary"}>
                            {embalagem.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditEmbalagem(embalagem)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteEmbalagem(embalagem)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Preço Principal</p>
                          <p className="text-lg font-bold text-primary">
                            {formatarMoeda(embalagem.precoPrincipal)}
                          </p>
                          <p className="text-xs text-muted-foreground">por unidade</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Custo por Unidade</p>
                          <p className="text-lg font-bold">
                            {formatarMoeda(embalagem.custoPorUnidade)}
                          </p>
                          <p className="text-xs text-muted-foreground">calculado automaticamente</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Fornecedor Alternativo</p>
                          <p className="text-sm">
                            {embalagem.fornecedorAlternativo?.nome || "Não definido"}
                          </p>
                          {embalagem.precoAlternativo && (
                            <p className="text-xs text-muted-foreground">
                              {formatarMoeda(embalagem.precoAlternativo)}
                            </p>
                          )}
                        </div>
                      </div>
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
                  Distribuição de custos médios por categoria de embalagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.categorias.map((categoria) => {
                    const embalagensCat = state.embalagens.filter(e => e.categoriaId === categoria.id);
                    const custoMedio = embalagensCat.length > 0 
                      ? embalagensCat.reduce((acc, e) => acc + e.custoPorUnidade, 0) / embalagensCat.length 
                      : 0;
                    
                    if (embalagensCat.length === 0) return null;
                    
                    return (
                      <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {embalagensCat.length} embalagens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatarMoeda(custoMedio)}</p>
                          <p className="text-sm text-muted-foreground">custo médio/un</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Análise por Fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle>Análise por Fornecedor</CardTitle>
                <CardDescription>
                  Comparativo de custos entre fornecedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.fornecedores.map((fornecedor) => {
                    const embalagensFornecedor = state.embalagens.filter(
                      e => e.fornecedorPrincipalId === fornecedor.id
                    );
                    const custoMedio = embalagensFornecedor.length > 0 
                      ? embalagensFornecedor.reduce((acc, e) => acc + e.custoPorUnidade, 0) / embalagensFornecedor.length 
                      : 0;
                    
                    if (embalagensFornecedor.length === 0) return null;
                    
                    return (
                      <div key={fornecedor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{fornecedor.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {embalagensFornecedor.length} embalagens fornecidas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatarMoeda(custoMedio)}</p>
                          <p className="text-sm text-muted-foreground">custo médio/un</p>
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

      <EmbalagemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        embalagem={editingEmbalagem}
      />
    </Layout>
  );
};

export default Embalagens;