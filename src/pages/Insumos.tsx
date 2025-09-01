import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsumoModal } from "@/components/modals/InsumoModal";
import { useAppContext } from "@/contexts/AppContext";
import { Insumo } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  Users,
  Calculator
} from "lucide-react";

const Insumos = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const filteredInsumos = state.insumos.filter((insumo) => {
    const matchesSearch = insumo.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || insumo.categoriaId === selectedCategory;
    const matchesSupplier = !selectedSupplier || insumo.fornecedorPrincipalId === selectedSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleNewInsumo = () => {
    setEditingInsumo(undefined);
    setModalOpen(true);
  };

  const handleEditInsumo = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setModalOpen(true);
  };

  const handleDeleteInsumo = (insumo: Insumo) => {
    if (window.confirm(`Tem certeza que deseja excluir "${insumo.nome}"?`)) {
      dispatch({ type: 'DELETE_INSUMO', payload: insumo.id });
    }
  };

  const stats = {
    totalInsumos: state.insumos.filter(i => i.ativo).length,
    custoMedio: state.insumos.length > 0 
      ? state.insumos.reduce((acc, i) => acc + (i.custoPorGrama || 0), 0) / state.insumos.length 
      : 0,
    fornecedoresAtivos: new Set(state.insumos.map(i => i.fornecedorPrincipalId)).size,
    categorias: new Set(state.insumos.map(i => i.categoriaId)).size,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Insumos</h1>
            <p className="text-muted-foreground mt-2">
              Gestão de insumos e análise de custos para precificação
            </p>
          </div>
          <Button onClick={handleNewInsumo} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Insumo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Insumos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInsumos}</div>
              <p className="text-xs text-muted-foreground">
                insumos cadastrados
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
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <TabsTrigger value="lista">Lista de Insumos</TabsTrigger>
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
                    placeholder="Buscar insumo..." 
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

            {/* Lista de Insumos */}
            <div className="grid gap-4">
              {filteredInsumos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum insumo encontrado</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {state.insumos.length === 0 
                        ? "Comece adicionando seus primeiros insumos ao sistema."
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    {state.insumos.length === 0 && (
                      <Button onClick={handleNewInsumo}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Insumo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredInsumos.map((insumo) => (
                  <Card key={insumo.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            {insumo.nome}
                          </CardTitle>
                          <CardDescription>
                            {insumo.categoria?.nome} • {insumo.fornecedorPrincipal?.nome}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={insumo.ativo ? "default" : "secondary"}>
                            {insumo.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditInsumo(insumo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteInsumo(insumo)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Preço Principal</p>
                          <p className="text-lg font-bold text-primary">
                            {formatarMoeda(insumo.precoPrincipal)}
                          </p>
                          <p className="text-xs text-muted-foreground">por {insumo.unidadeMedida?.sigla}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Custo por Grama</p>
                          <p className="text-lg font-bold">
                            {formatarMoeda(insumo.custoPorGrama || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">calculado automaticamente</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Unidade de Medida</p>
                          <p className="text-lg font-bold text-muted-foreground">
                            {insumo.unidadeMedida?.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">{insumo.unidadeMedida?.tipo}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Fornecedor Alternativo</p>
                          <p className="text-sm">
                            {insumo.fornecedorAlternativo?.nome || "Não definido"}
                          </p>
                          {insumo.precoAlternativo && (
                            <p className="text-xs text-muted-foreground">
                              {formatarMoeda(insumo.precoAlternativo)}
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
                  Distribuição de custos médios por categoria de insumos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.categorias.map((categoria) => {
                    const insumosCat = state.insumos.filter(i => i.categoriaId === categoria.id);
                    const custoMedio = insumosCat.length > 0 
                      ? insumosCat.reduce((acc, i) => acc + (i.custoPorGrama || 0), 0) / insumosCat.length 
                      : 0;
                    
                    return (
                      <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {insumosCat.length} insumos
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
                    const insumosFornecedor = state.insumos.filter(
                      i => i.fornecedorPrincipalId === fornecedor.id
                    );
                    const custoMedio = insumosFornecedor.length > 0 
                      ? insumosFornecedor.reduce((acc, i) => acc + (i.custoPorGrama || 0), 0) / insumosFornecedor.length 
                      : 0;
                    
                    if (insumosFornecedor.length === 0) return null;
                    
                    return (
                      <div key={fornecedor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{fornecedor.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {insumosFornecedor.length} insumos fornecidos
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
          </TabsContent>
        </Tabs>
      </div>

      <InsumoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        insumo={editingInsumo}
      />
    </Layout>
  );
};

export default Insumos;