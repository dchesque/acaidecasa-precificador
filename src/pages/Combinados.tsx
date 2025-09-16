"use client"
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CombinadoModal } from "@/components/modals/CombinadoModal";
import { useAppContext } from "@/contexts/AppContext";
import { Combinado, Categoria } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import {
  Plus,
  Layers,
  Calculator,
  Edit,
  Trash2,
  Search,
  Eye,
  Package,
  TrendingUp,
  Tags,
  Coffee
} from "lucide-react";

const Combinados = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCombinado, setEditingCombinado] = useState<Combinado | undefined>();
  const [viewingCombinado, setViewingCombinado] = useState<Combinado | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");

  // Dados mockados simplificados para desenvolvimento
  const combinadosMock: Combinado[] = [
    {
      id: "1",
      nome: "Açaí Completo 500ml",
      descricao: "Açaí completo com granola, banana, morango e leite condensado",
      categoriaId: "cat1",
      categoria: {
        id: "cat1",
        nome: "Premium",
        descricao: "Produtos premium",
        cor: "#8b5cf6",
        ativo: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      copoBaseId: "copo1",
      copoBase: {
        id: "copo1",
        nome: "Copo 500ml Premium",
        custoTotal: 5.50
      },
      complementos: [],
      custoCopoBase: 5.50,
      custoComplementos: 1.25,
      custoTotal: 6.75,
      ativo: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: "2",
      nome: "Açaí Fitness 300ml",
      descricao: "Açaí fit com granola light, banana e castanhas",
      categoriaId: "cat2",
      categoria: {
        id: "cat2",
        nome: "Saudável",
        descricao: "Opções saudáveis",
        cor: "#10b981",
        ativo: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      copoBaseId: "copo2",
      copoBase: {
        id: "copo2",
        nome: "Copo 300ml Fitness",
        custoTotal: 4.20
      },
      complementos: [],
      custoCopoBase: 4.20,
      custoComplementos: 0,
      custoTotal: 4.20,
      ativo: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: "3",
      nome: "Açaí Kids 200ml",
      descricao: "Açaí infantil com granola, banana e chocolate granulado",
      categoriaId: "cat3",
      categoria: {
        id: "cat3",
        nome: "Infantil",
        descricao: "Para crianças",
        cor: "#f59e0b",
        ativo: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      copoBaseId: "copo3",
      copoBase: {
        id: "copo3",
        nome: "Copo 200ml Kids",
        custoTotal: 2.85
      },
      complementos: [],
      custoCopoBase: 2.85,
      custoComplementos: 0,
      custoTotal: 2.85,
      ativo: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ];

  // Use mock data for demonstration, fallback to real data if available
  const combinados = state.combinados.length > 0 ? state.combinados : combinadosMock;

  const filteredCombinados = combinados.filter((combinado) => {
    const matchesSearch = combinado.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || combinado.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categorias mockadas para demonstração
  const categoriasMock: Pick<Categoria, "id" | "nome" | "cor" | "ativo">[] = [
    { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true },
    { id: "cat2", nome: "Saudável", cor: "#10b981", ativo: true },
    { id: "cat3", nome: "Infantil", cor: "#f59e0b", ativo: true }
  ];

  const categorias = (state.categorias.length > 0 ? state.categorias : categoriasMock) as Pick<Categoria, "id" | "nome" | "cor" | "ativo">[];

  // Group combinados by category for the "by-category" view
  const combinadosByCategory = viewMode === "by-category" ?
    categorias
      .filter(categoria => categoria.ativo)
      .map(categoria => ({
        categoria,
        combinados: filteredCombinados.filter(combinado => combinado.categoriaId === categoria.id)
      }))
      .filter(group => group.combinados.length > 0)
    : [];



  const handleNewCombinado = () => {
    setEditingCombinado(undefined);
    setModalOpen(true);
  };

  const handleEditCombinado = (combinado: Combinado) => {
    setEditingCombinado(combinado);
    setModalOpen(true);
  };

  const handleViewCombinado = (combinado: Combinado) => {
    setViewingCombinado(combinado);
    setViewModalOpen(true);
  };

  const handleDeleteCombinado = (combinado: Combinado) => {
    if (window.confirm(`Tem certeza que deseja excluir "${combinado.nome}"?`)) {
      dispatch({ type: 'DELETE_COMBINADO', payload: combinado.id });
    }
  };

  // Component to render a table row for a combinado
  const CombinadoTableRow = ({ combinado, showCategory = true }: { combinado: Combinado; showCategory?: boolean }) => {
    return (
      <TableRow key={combinado.id}>
        <TableCell>
          <div className="font-medium">{combinado.nome}</div>
          <div className="text-xs text-muted-foreground">{combinado.descricao}</div>
        </TableCell>
        {showCategory && (
          <TableCell>
            {combinado.categoria && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: combinado.categoria.cor + '20',
                  color: combinado.categoria.cor,
                  borderColor: combinado.categoria.cor
                }}
              >
                {combinado.categoria.nome}
              </Badge>
            )}
          </TableCell>
        )}
        <TableCell>
          <div className="text-sm font-medium">
            {formatarMoeda(combinado.custoCopoBase)}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium">
            {formatarMoeda(combinado.custoComplementos)}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-bold text-destructive">
            {formatarMoeda(combinado.custoTotal)}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewCombinado(combinado)}
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditCombinado(combinado)}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteCombinado(combinado)}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="w-2 h-2 rounded-full mx-auto"
               style={{backgroundColor: combinado.ativo ? '#22c55e' : '#6b7280'}}
               title={combinado.ativo ? "Ativo" : "Inativo"}
          />
        </TableCell>
      </TableRow>
    );
  };

  const stats = {
    totalCombinados: combinados.filter(c => c.ativo).length,
    combinadosInativos: combinados.filter(c => !c.ativo).length,
    categoriasComCombinados: new Set(combinados.filter(c => c.ativo).map(c => c.categoriaId)).size,
    custoMedio: combinados.filter(c => c.ativo).reduce((acc, c) => acc + c.custoTotal, 0) / (combinados.filter(c => c.ativo).length || 1),
    custoMaiorCombinado: combinados.filter(c => c.ativo).length > 0 ? Math.max(...combinados.filter(c => c.ativo).map(c => c.custoTotal)) : 0,
  };


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
          <Button onClick={handleNewCombinado} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Combinado
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Combinados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCombinados}</div>
              <p className="text-xs text-muted-foreground">
                combinados ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedio)}</div>
              <p className="text-xs text-muted-foreground">
                custo médio por combinado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Combinado Mais Caro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMaiorCombinado)}</div>
              <p className="text-xs text-muted-foreground">
                maior custo individual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categoriasComCombinados}</div>
              <p className="text-xs text-muted-foreground">
                categorias com combinados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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
                  placeholder="Buscar combinado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
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

          {/* Lista de Combinados */}
          {filteredCombinados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum combinado encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Tente ajustar os filtros para encontrar o que procura.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "complete" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Combinados</CardTitle>
                    <CardDescription>
                      Todos os combinados cadastrados no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome / Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Custo Copo Base</TableHead>
                          <TableHead>Custo Complementos</TableHead>
                          <TableHead>Custo Total</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCombinados.map((combinado) => (
                          <CombinadoTableRow key={combinado.id} combinado={combinado} />
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {viewMode === "by-category" && (
                <div className="space-y-6">
                  {combinadosByCategory.map((group) => (
                    <Card key={group.categoria.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: group.categoria.cor }}
                              />
                              {group.categoria.nome}
                              <Badge variant="secondary">{group.combinados.length}</Badge>
                            </CardTitle>
                            <CardDescription>
                              {group.combinados.length} {group.combinados.length === 1 ? 'combinado' : 'combinados'} nesta categoria
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome / Descrição</TableHead>
                              <TableHead>Custo Copo Base</TableHead>
                              <TableHead>Custo Complementos</TableHead>
                              <TableHead>Custo Total</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.combinados.map((combinado) => (
                              <CombinadoTableRow
                                key={combinado.id}
                                combinado={combinado}
                                showCategory={false}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <CombinadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        combinado={editingCombinado}
      />
    </Layout>
  );
};

export default Combinados;
