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
import { Combinado } from "@/types/database";
import { formatarMoeda, calcularMargem } from "@/utils/calculations";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dados mockados temporários - serão substituídos pelos dados do context
  const combinadosMock: Combinado[] = [
    {
      id: "1",
      nome: "Açaí Completo 500ml",
      descricao: "Açaí completo com granola, banana, morango e leite condensado",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true } as any,
      copoBaseId: "copo1",
      copoBase: {
        id: "copo1",
        nome: "Copo 500ml Premium",
        descricao: "Açaí batido premium 500ml",
        categoriaId: "cat1",
        categoria: { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true } as any,
        insumoBaseId: "ins1",
        insumoBase: null,
        quantidadeBase: 500,
        custoBase: 4.50,
        custoEmbalagens: 1.00,
        custoTotal: 5.50,
        ativo: true
      } as any,
      complementos: [
        {
          id: "comp1",
          combinadoId: "1",
          tipo: 'INSUMO' as const,
          insumoId: "ins2",
          insumo: {
            id: "ins2",
            nome: "Granola Crocante",
            descricao: "Granola especial crocante",
            categoriaId: "cat2",
            unidadeMedidaId: "un1",
            unidadeMedida: { id: "un1", nome: "Gramas", sigla: "g", tipo: 'PESO' as const, fatorConversao: 1 } as any,
            fornecedorCalculoId: "forn1",
            custoPorUnidade: 0.025, // R$ 0,025 por grama
            ativo: true
          } as any,
          quantidade: 30, // 30 gramas
          custo: 0.75
        } as any,
        {
          id: "comp2",
          combinadoId: "1",
          tipo: 'INSUMO' as const,
          insumoId: "ins3",
          insumo: {
            id: "ins3",
            nome: "Banana Prata",
            descricao: "Banana prata fatiada",
            categoriaId: "cat2",
            unidadeMedidaId: "un2",
            unidadeMedida: { id: "un2", nome: "Unidade", sigla: "un", tipo: 'UNIDADE' as const, fatorConversao: 1 } as any,
            fornecedorCalculoId: "forn2",
            custoPorUnidade: 0.80, // R$ 0,80 por unidade
            ativo: true
          } as any,
          quantidade: 1, // 1 unidade
          custo: 0.80
        } as any,
        {
          id: "comp3",
          combinadoId: "1",
          tipo: 'INSUMO' as const,
          insumoId: "ins4",
          insumo: {
            id: "ins4",
            nome: "Morango Fresco",
            descricao: "Morango fresco fatiado",
            categoriaId: "cat2",
            unidadeMedidaId: "un1",
            unidadeMedida: { id: "un1", nome: "Gramas", sigla: "g", tipo: 'PESO' as const, fatorConversao: 1 } as any,
            fornecedorCalculoId: "forn3",
            custoPorUnidade: 0.035, // R$ 0,035 por grama
            ativo: true
          } as any,
          quantidade: 50, // 50 gramas
          custo: 1.75
        } as any,
        {
          id: "comp4",
          combinadoId: "1",
          tipo: 'RECEITA' as const,
          receitaId: "rec1",
          receita: {
            id: "rec1",
            nome: "Calda de Leite Condensado",
            descricao: "Calda especial de leite condensado",
            categoriaId: "cat3",
            rendimento: 1000, // 1000 gramas
            custoPorGrama: 0.015, // R$ 0,015 por grama
            custoTotal: 15.00,
            tempoPreparo: 10,
            instrucoes: "Misturar leite condensado com creme de leite",
            ativo: true
          } as any,
          quantidade: 30, // 30 gramas
          custo: 0.45
        } as any
      ],
      custoCopoBase: 5.50,
      custoComplementos: 3.75,
      custoTotal: 9.25,
      ativo: true
    } as any,
    {
      id: "2",
      nome: "Açaí Fitness 300ml",
      descricao: "Açaí fit com granola light, banana e castanhas",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Saudável", cor: "#10b981", ativo: true } as any,
      copoBaseId: "copo2",
      copoBase: null,
      complementos: [],
      custoCopoBase: 4.20,
      custoComplementos: 2.80,
      custoTotal: 7.00,
      ativo: true
    } as any,
    {
      id: "3",
      nome: "Açaí Kids 200ml",
      descricao: "Açaí infantil com granola, banana e chocolate granulado",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Infantil", cor: "#f59e0b", ativo: true } as any,
      copoBaseId: "copo3",
      copoBase: null,
      complementos: [],
      custoCopoBase: 2.85,
      custoComplementos: 1.85,
      custoTotal: 4.70,
      ativo: true
    } as any,
    {
      id: "4",
      nome: "Açaí Power 700ml",
      descricao: "Açaí especial com múltiplos complementos",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true } as any,
      copoBaseId: "copo4",
      copoBase: null,
      complementos: [],
      custoCopoBase: 7.50,
      custoComplementos: 5.25,
      custoTotal: 12.75,
      ativo: true
    } as any
  ];

  // Use mock data for demonstration, fallback to real data if available
  const combinados = state.combinados.length > 0 ? state.combinados : combinadosMock;

  const filteredCombinados = combinados.filter((combinado) => {
    const matchesSearch = combinado.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || combinado.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categorias mockadas para demonstração
  const categoriasMock = [
    { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true },
    { id: "cat2", nome: "Saudável", cor: "#10b981", ativo: true },
    { id: "cat3", nome: "Infantil", cor: "#f59e0b", ativo: true }
  ];

  // Group combinados by category for the "by-category" view
  const combinadosByCategory = viewMode === "by-category" ?
    categoriasMock
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

  if (!isClient) {
    return null;
  }

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
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.totalCombinados}</div>
                <Package className="w-8 h-8 text-muted-foreground/20" />
              </div>
              {stats.combinadosInativos > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.combinadosInativos} inativos
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.categoriasComCombinados}</div>
                <Tags className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Com combinados ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Maior Custo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-600">
                  {formatarMoeda(stats.custoMaiorCombinado)}
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Combinado mais caro
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
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-destructive">
                  {formatarMoeda(stats.custoMedio)}
                </div>
                <Calculator className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por combinado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                  {categoriasMock.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
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
                  {filteredCombinados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum combinado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          // By category view - separated cards
          <div className="space-y-6">
            {combinadosByCategory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum combinado encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {combinados.length === 0
                      ? "Comece adicionando seus primeiros combinados ao sistema."
                      : "Tente ajustar os filtros para encontrar o que procura."
                    }
                  </p>
                  {combinados.length === 0 && (
                    <Button onClick={handleNewCombinado}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Combinado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              combinadosByCategory.map((group) => (
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
              ))
            )}
          </div>
        )}

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Combinado</DialogTitle>
            </DialogHeader>
            {viewingCombinado && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{viewingCombinado.nome}</h3>
                  <p className="text-sm text-muted-foreground">{viewingCombinado.descricao}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Categoria</p>
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: viewingCombinado.categoria?.cor + '20', 
                        color: viewingCombinado.categoria?.cor, 
                        borderColor: viewingCombinado.categoria?.cor 
                      }}
                    >
                      {viewingCombinado.categoria?.nome}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={viewingCombinado.ativo ? "default" : "secondary"}>
                      {viewingCombinado.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                {/* Composição Detalhada */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Composição do Combinado
                  </h4>
                  
                  {/* Copo Base */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Copo Base</span>
                        <Badge variant="outline">Base</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingCombinado.copoBase ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{viewingCombinado.copoBase.nome}</span>
                            <span className="text-sm text-muted-foreground">
                              {viewingCombinado.copoBase.descricao}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Custo Base: </span>
                              <span className="font-medium">{formatarMoeda(viewingCombinado.custoCopoBase)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Preço Sugerido: </span>
                              <span className="font-medium text-primary">
                                {viewingCombinado.copoBase.precoSugerido ? 
                                  formatarMoeda(viewingCombinado.copoBase.precoSugerido) : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Margem: </span>
                              <span className="font-medium text-green-600">
                                {viewingCombinado.copoBase.margem ? 
                                  `${viewingCombinado.copoBase.margem.toFixed(1)}%` : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="font-medium">Copo Base Padrão</span>
                          <div className="mt-1">
                            <span className="text-muted-foreground">Custo: </span>
                            <span className="font-medium">{formatarMoeda(viewingCombinado.custoCopoBase)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Complementos/Insumos */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Complementos e Insumos</span>
                        <Badge variant="outline">
                          {viewingCombinado.complementos?.length || 0} itens
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingCombinado.complementos && viewingCombinado.complementos.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Quantidade</TableHead>
                              <TableHead className="text-right">Custo Unit.</TableHead>
                              <TableHead className="text-right">Custo Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingCombinado.complementos.map((comp, index) => (
                              <TableRow key={comp.id || index}>
                                <TableCell>
                                  <Badge variant={comp.tipo === 'INSUMO' ? 'default' : 'secondary'} className="text-xs">
                                    {comp.tipo === 'INSUMO' ? 'Insumo' : 'Receita'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {comp.tipo === 'INSUMO' 
                                    ? (comp.insumo?.nome || 'Insumo não identificado')
                                    : (comp.receita?.nome || 'Receita não identificada')}
                                </TableCell>
                                <TableCell className="text-right">
                                  {comp.quantidade} 
                                  {comp.tipo === 'INSUMO' && comp.insumo?.unidadeMedida && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      {comp.insumo.unidadeMedida.sigla}
                                    </span>
                                  )}
                                  {comp.tipo === 'RECEITA' && (
                                    <span className="text-xs text-muted-foreground ml-1">g</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {comp.tipo === 'INSUMO' && comp.insumo?.custoPorUnidade ? 
                                    formatarMoeda(comp.insumo.custoPorUnidade) : 
                                    comp.tipo === 'RECEITA' && comp.receita?.custoPorGrama ?
                                    formatarMoeda(comp.receita.custoPorGrama) : '-'}
                                </TableCell>
                                <TableCell className="text-right font-medium text-destructive">
                                  {formatarMoeda(comp.custo)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-semibold bg-muted/50">
                              <TableCell colSpan={4}>Total dos Complementos</TableCell>
                              <TableCell className="text-right text-destructive">
                                {formatarMoeda(viewingCombinado.custoComplementos)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Nenhum complemento adicionado
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo de Custos */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Resumo de Custos
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Custos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Copo Base:</span>
                          <span className="font-medium">{formatarMoeda(viewingCombinado.custoCopoBase)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Complementos:</span>
                          <span className="font-medium">{formatarMoeda(viewingCombinado.custoComplementos)}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between">
                          <span className="font-semibold">Custo Total:</span>
                          <span className="font-bold text-destructive">
                            {formatarMoeda(viewingCombinado.custoTotal)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Informações Adicionais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <span className="font-medium">
                            <Badge variant={viewingCombinado.ativo ? "default" : "secondary"}>
                              {viewingCombinado.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Complexidade:</span>
                          <span className="font-medium text-blue-600">
                            {viewingCombinado.complementos?.length || 0} complementos
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            Custo final calculado baseado nos insumos e complementos selecionados.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit/Create Modal */}
        <CombinadoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          combinado={editingCombinado}
        />
      </div>
    </Layout>
  );
};

export default Combinados;