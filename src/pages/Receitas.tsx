"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceitaModal } from "@/components/modals/ReceitaModal";
import { useAppContext } from "@/contexts/AppContext";
import { Receita } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { Plus, ChefHat, Clock, Calculator, Edit, Trash2, Search, Users, Eye } from "lucide-react";

const Receitas = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");

  // Dados mockados temporários para desenvolvimento
  const receitasMock = [
    {
      id: "rec1",
      nome: "Molho de Morango",
      descricao: "Molho doce de morango para cobertura",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true },
      tempoPreparo: 15,
      porcoes: 10,
      custoTotal: 12.50,
      custoPorGrama: 0.025,
      custoPorPorcao: 1.25,
      ativo: true,
      observacoes: "Molho artesanal",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing1",
          receitaId: "rec1",
          insumoId: "ins6",
          quantidade: 200,
          custo: 4.00,
          insumo: { id: "ins6", nome: "Morango", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing2",
          receitaId: "rec1",
          insumoId: "ins7",
          quantidade: 100,
          custo: 2.50,
          insumo: { id: "ins7", nome: "Açúcar", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec2",
      nome: "Caldinha de Chocolate",
      descricao: "Calda cremosa de chocolate",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true },
      tempoPreparo: 20,
      porcoes: 8,
      custoTotal: 18.00,
      custoPorGrama: 0.045,
      custoPorPorcao: 2.25,
      ativo: true,
      observacoes: "Chocolate belga",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing3",
          receitaId: "rec2",
          insumoId: "ins8",
          quantidade: 150,
          custo: 12.00,
          insumo: { id: "ins8", nome: "Chocolate", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing4",
          receitaId: "rec2",
          insumoId: "ins9",
          quantidade: 200,
          custo: 6.00,
          insumo: { id: "ins9", nome: "Leite", unidadeMedida: { sigla: "ml" } }
        }
      ]
    },
    {
      id: "rec3",
      nome: "Mix de Granola Especial",
      descricao: "Mix especial de granola com castanhas",
      categoriaId: "cat4",
      categoria: { id: "cat4", nome: "Mix", cor: "#10b981", ativo: true },
      tempoPreparo: 10,
      porcoes: 15,
      custoTotal: 25.00,
      custoPorGrama: 0.050,
      custoPorPorcao: 1.67,
      ativo: true,
      observacoes: "Granola premium",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing5",
          receitaId: "rec3",
          insumoId: "ins3",
          quantidade: 300,
          custo: 15.00,
          insumo: { id: "ins3", nome: "Granola Tradicional", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing6",
          receitaId: "rec3",
          insumoId: "ins10",
          quantidade: 200,
          custo: 10.00,
          insumo: { id: "ins10", nome: "Castanha", unidadeMedida: { sigla: "g" } }
        }
      ]
    }
  ];

  // Use mock data for development, fallback to real data if available
  const receitasData = state.receitas.length > 0 ? state.receitas : receitasMock;

  const filteredReceitas = receitasData.filter((receita) => {
    const matchesSearch = receita.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || receita.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group receitas by category for the "by-category" view
  const receitasByCategory = viewMode === "by-category" ?
    state.categorias
      .filter(categoria => categoria.ativo)
      .map(categoria => ({
        categoria,
        receitas: filteredReceitas.filter(receita => receita.categoriaId === categoria.id)
      }))
      .filter(group => group.receitas.length > 0)
    : [];

  const handleNewReceita = () => {
    setEditingReceita(undefined);
    setModalOpen(true);
  };

  const handleEditReceita = (receita: Receita) => {
    setEditingReceita(receita);
    setModalOpen(true);
  };

  const handleViewReceita = (receita: Receita) => {
    // TODO: Implementar modal de visualização se necessário
    console.log("Visualizando receita:", receita);
  };

  const handleDeleteReceita = (receita: Receita) => {
    if (window.confirm(`Tem certeza que deseja excluir "${receita.nome}"?`)) {
      dispatch({ type: 'DELETE_RECEITA', payload: receita.id });
    }
  };

  // Component to render a table row for a receita
  const ReceitaTableRow = ({ receita, showCategory = true }: { receita: Receita; showCategory?: boolean }) => {
    return (
      <TableRow key={receita.id}>
        <TableCell>
          <div className="font-medium">{receita.nome}</div>
          <div className="text-xs text-muted-foreground">{receita.descricao}</div>
        </TableCell>
        {showCategory && (
          <TableCell>
            {receita.categoria && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: receita.categoria.cor + '20',
                  color: receita.categoria.cor,
                  borderColor: receita.categoria.cor
                }}
              >
                {receita.categoria.nome}
              </Badge>
            )}
          </TableCell>
        )}
        <TableCell>
          <div className="text-sm">{receita.rendimento}g</div>
        </TableCell>
        <TableCell>
          <div className="text-sm">{receita.tempoPreparo || '-'}min</div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium">
            {formatarMoeda(receita.custoPorGrama)}
          </div>
          <div className="text-xs text-muted-foreground">por grama</div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-bold text-destructive">
            {formatarMoeda(receita.custoTotal)}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewReceita(receita)}
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditReceita(receita)}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteReceita(receita)}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="w-2 h-2 rounded-full mx-auto"
               style={{backgroundColor: receita.ativo ? '#22c55e' : '#6b7280'}}
               title={receita.ativo ? "Ativo" : "Inativo"}
          />
        </TableCell>
      </TableRow>
    );
  };

  const stats = {
    totalReceitas: receitasData.filter(r => r.ativo).length,
    custoMedio: receitasData.length > 0
      ? receitasData.reduce((acc, r) => acc + r.custoPorGrama, 0) / receitasData.length 
      : 0,
    tempoMedio: receitasData.length > 0
      ? receitasData.reduce((acc, r) => acc + (r.tempoPreparo || 0), 0) / receitasData.length 
      : 0,
    categorias: new Set(receitasData.map(r => r.categoriaId)).size,
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
                <div className="grid grid-cols-4 gap-4">
                  <Input
                    placeholder="Buscar receita..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {state.categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={viewMode === "complete" ? "default" : "outline"}
                    onClick={() => setViewMode("complete")}
                    className="w-full"
                  >
                    Visualização Completa
                  </Button>
                  <Button
                    variant={viewMode === "by-category" ? "default" : "outline"}
                    onClick={() => setViewMode("by-category")}
                    className="w-full"
                  >
                    Por Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table View */}
            {viewMode === "complete" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Receitas</CardTitle>
                  <CardDescription>
                    Visualização completa de todas as receitas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome / Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Rendimento</TableHead>
                        <TableHead>Tempo Preparo</TableHead>
                        <TableHead>Custo por Grama</TableHead>
                        <TableHead>Custo Total</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceitas.map((receita) => (
                        <ReceitaTableRow key={receita.id} receita={receita} />
                      ))}
                      {filteredReceitas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            Nenhuma receita encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              // By category view - single unified table
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome / Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Rendimento</TableHead>
                      <TableHead>Tempo Preparo</TableHead>
                      <TableHead>Custo por Grama</TableHead>
                      <TableHead>Custo Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                      <TableHead className="text-center w-16">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitasByCategory.map((group, groupIndex) => (
                      <>
                        {/* Category header row */}
                        <TableRow key={`category-${group.categoria.id}`} className="bg-muted/50">
                          <TableCell colSpan={8} className="font-semibold py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: group.categoria.cor }}
                              />
                              <span style={{ color: group.categoria.cor }}>
                                {group.categoria.nome}
                              </span>
                              <Badge variant="secondary" className="ml-2">
                                {group.receitas.length} {group.receitas.length === 1 ? 'item' : 'itens'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Category items */}
                        {group.receitas.map((receita) => (
                          <ReceitaTableRow
                            key={`${group.categoria.id}-${receita.id}`}
                            receita={receita}
                            showCategory={true}
                          />
                        ))}
                        {/* Spacer row between categories (except for last one) */}
                        {groupIndex < receitasByCategory.length - 1 && (
                          <TableRow key={`spacer-${group.categoria.id}`}>
                            <TableCell colSpan={8} className="p-0">
                              <div className="h-4"></div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                    {receitasByCategory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Nenhuma receita encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
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
                    const receitasCat = receitasData.filter(r => r.categoriaId === categoria.id);
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