"use client"
import React, { useState, Fragment } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopoBaseModal } from "@/components/modals/CopoBaseModal";
import { useAppContext } from "@/contexts/AppContext";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { CopoBase } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import {
  Plus,
  Coffee,
  Calculator,
  Edit,
  Trash2,
  Search,
  Package,
  Eye,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  Cherry,
  Cake,
  ShoppingCart,
  Apple,
  Banana,
  Cookie,
  Pizza,
  Salad,
  Sandwich,
  IceCream,
  Milk,
  Wine,
  Utensils,
  Heart,
  Star,
  Flame,
  Sparkles,
  Crown,
  Gift,
  Target,
  Tags
} from "lucide-react";
import { Label } from "@/components/ui/label";

const CoposBase = () => {
  const { state, dispatch } = useAppContext();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCopoBase, setEditingCopoBase] = useState<CopoBase | undefined>();
  const [viewingCopoBase, setViewingCopoBase] = useState<CopoBase | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Estados para categorias inline (padrão cardápio)
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Coffee");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("Coffee");
  const [editCategoryColor, setEditCategoryColor] = useState("#8B5CF6");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [iconScrollIndex, setIconScrollIndex] = useState(0);
  const [colorScrollIndex, setColorScrollIndex] = useState(0);

  // Configuração de ícones disponíveis para copos base
  const availableIcons = [
    { name: "Coffee", icon: Coffee },
    { name: "Package", icon: Package },
    { name: "Cherry", icon: Cherry },
    { name: "Cake", icon: Cake },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Apple", icon: Apple },
    { name: "Banana", icon: Banana },
    { name: "Cookie", icon: Cookie },
    { name: "Pizza", icon: Pizza },
    { name: "Salad", icon: Salad },
    { name: "Sandwich", icon: Sandwich },
    { name: "IceCream", icon: IceCream },
    { name: "Milk", icon: Milk },
    { name: "Wine", icon: Wine },
    { name: "Utensils", icon: Utensils },
    { name: "Heart", icon: Heart },
    { name: "Star", icon: Star },
    { name: "Flame", icon: Flame },
    { name: "Sparkles", icon: Sparkles },
    { name: "Crown", icon: Crown },
    { name: "Gift", icon: Gift },
    { name: "Target", icon: Target },
  ];

  const availableColors = [
    "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5A2B",
    "#06B6D4", "#84CC16", "#F97316", "#E11D48", "#7C3AED", "#059669", "#DC2626",
    "#2563EB", "#7C2D12", "#BE123C", "#9333EA", "#0D9488", "#EA580C", "#1D4ED8",
    "#92400E", "#BE185D", "#6366F1", "#047857", "#C2410C", "#1E40AF", "#A16207"
  ];

  // Configurações de visualização
  const iconsPerView = 5;
  const colorsPerView = 8;

  // Visualizações calculadas
  const visibleIcons = availableIcons.slice(iconScrollIndex, iconScrollIndex + iconsPerView);
  const visibleColors = availableColors.slice(colorScrollIndex, colorScrollIndex + colorsPerView);

  // Funções para gerenciamento de categorias inline (padrão cardápio)
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    // Verificar se já existe uma categoria com esse nome
    const categoryExists = state.categorias.some(cat =>
      cat.nome.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (categoryExists) {
      console.log("❌ Já existe uma categoria com esse nome:", newCategoryName.trim());
      return;
    }

    const newCategory = {
      id: `categoria-copo-base-${Date.now()}`,
      nome: newCategoryName.trim(),
      descricao: `Categoria de copos base: ${newCategoryName.trim()}`,
      cor: newCategoryColor,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_CATEGORIA', payload: newCategory });

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("Coffee");
    setNewCategoryColor("#8B5CF6");

    // Feedback visual de sucesso
    console.log("✅ Categoria de copo base criada com sucesso:", newCategory.nome);
  };

  const handleEditCategory = (categoryId: string) => {
    const categoria = state.categorias.find(cat => cat.id === categoryId);
    if (categoria) {
      setEditingCategory(categoryId);
      setEditCategoryName(categoria.nome);
      setEditCategoryIcon("Coffee");
      setEditCategoryColor(categoria.cor || "#8B5CF6");
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const updatedCategory = {
      id: editingCategory,
      nome: editCategoryName.trim(),
      descricao: `Categoria de copos base: ${editCategoryName.trim()}`,
      cor: editCategoryColor,
      ativo: true,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategory });

    console.log("✅ Categoria de copo base editada com sucesso:", editCategoryName.trim());

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Coffee");
    setEditCategoryColor("#8B5CF6");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Coffee");
    setEditCategoryColor("#8B5CF6");
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoria = state.categorias.find(cat => cat.id === categoryId);
    const ok = await confirm({
      title: "Excluir categoria",
      description: `Tem certeza que deseja excluir a categoria "${categoria?.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      dispatch({ type: 'DELETE_CATEGORIA', payload: categoryId });
    }
  };

  // Handlers para navegação de ícones e cores
  const handlePrevIcons = () => {
    setIconScrollIndex(prev => Math.max(0, prev - iconsPerView));
  };

  const handleNextIcons = () => {
    setIconScrollIndex(prev =>
      Math.min(availableIcons.length - iconsPerView, prev + iconsPerView)
    );
  };

  const handlePrevColors = () => {
    setColorScrollIndex(prev => Math.max(0, prev - colorsPerView));
  };

  const handleNextColors = () => {
    setColorScrollIndex(prev =>
      Math.min(availableColors.length - colorsPerView, prev + colorsPerView)
    );
  };

  // Dados mockados consistentes com outras páginas
  const coposBaseMock = [
    {
      id: "COPO001",
      nome: "Copo 300ml Premium",
      descricao: "Base de açaí premium 300ml com banana - tamanho ideal",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 200, // 200g de açaí
      custoBase: 2.50, // 200 * 0.0125
      custoInsumos: 2.00, // embalagem + complementos
      custoTotal: 4.50,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins1",
          insumoId: "INS006",
          quantidade: 1,
          custo: 0.35, // Copo 300ml
          insumo: { id: "INS006", nome: "Copo 300ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins2",
          insumoId: "INS002",
          quantidade: 80, // 80g banana
          custo: 0.26, // 80 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "COPO002",
      nome: "Copo 500ml Tradicional",
      descricao: "Base de açaí tradicional 500ml com banana e granola",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Tradicional", cor: "#06b6d4", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 350, // 350g de açaí
      custoBase: 4.38, // 350 * 0.0125
      custoInsumos: 1.82, // embalagem + complementos
      custoTotal: 6.20,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins3",
          insumoId: "INS007",
          quantidade: 1,
          custo: 0.48, // Copo 500ml
          insumo: { id: "INS007", nome: "Copo 500ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins4",
          insumoId: "INS002",
          quantidade: 100, // 100g banana
          custo: 0.32, // 100 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ins5",
          insumoId: "INS003",
          quantidade: 25, // 25g granola
          custo: 0.22, // 25 * 0.0089
          insumo: { id: "INS003", nome: "Granola Artesanal", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "COPO003",
      nome: "Copo 400ml Especial",
      descricao: "Base nutritiva com açaí, aveia e banana - opção saudável",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Saudável", cor: "#10b981", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 250, // 250g de açaí
      custoBase: 3.13, // 250 * 0.0125
      custoInsumos: 0.72, // embalagem + complementos
      custoTotal: 3.85,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins6",
          insumoId: "INS006", // Usando copo 300ml (mais próximo de 400ml)
          quantidade: 1,
          custo: 0.35,
          insumo: { id: "INS006", nome: "Copo 300ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins7",
          insumoId: "INS005",
          quantidade: 30, // 30g aveia
          custo: 0.14, // 30 * 0.0048
          insumo: { id: "INS005", nome: "Aveia em Flocos", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ins8",
          insumoId: "INS002",
          quantidade: 70, // 70g banana
          custo: 0.22, // 70 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        }
      ]
    }
  ];

  // Use mock data for development, fallback to real data if available
  const coposBaseData = state.coposBase.length > 0 ? state.coposBase : coposBaseMock;

  const filteredCoposBase = coposBaseData.filter((copoBase) => {
    const matchesSearch = copoBase.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || copoBase.categoriaId === selectedCategory;
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

  const handleViewCopoBase = (copoBase: CopoBase) => {
    setViewingCopoBase(copoBase);
    setViewModalOpen(true);
  };

  const handleDeleteCopoBase = async (copoBase: CopoBase) => {
    const ok = await confirm({
      title: "Excluir copo base",
      description: `Tem certeza que deseja excluir "${copoBase.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      dispatch({ type: 'DELETE_COPO_BASE', payload: copoBase.id });
    }
  };

  const stats = {
    totalCoposBase: coposBaseData.filter(c => c.ativo).length,
    custoMedio: coposBaseData.length > 0
      ? coposBaseData.reduce((acc, c) => acc + c.custoTotal, 0) / coposBaseData.length
      : 0,
    categorias: new Set(coposBaseData.map(c => c.categoriaId)).size,
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCategoriesModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gerenciar Categorias
            </Button>
            <Button onClick={handleNewCopoBase} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Copo Base
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
                    placeholder="Buscar copo base..."
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

            {/* Lista de Copos Base */}
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
            ) : viewMode === "complete" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização Completa</CardTitle>
                  <CardDescription>
                    Todos os copos base em formato de tabela
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Insumo Base</TableHead>
                        <TableHead>Qtd. Base</TableHead>
                        <TableHead>Custo Base</TableHead>
                        <TableHead>Custo Insumos</TableHead>
                        <TableHead>Custo Total</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoposBase.map((copoBase) => (
                        <TableRow key={copoBase.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-muted-foreground" />
                              {copoBase.nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: copoBase.categoria?.cor + '20',
                                borderColor: copoBase.categoria?.cor,
                                color: copoBase.categoria?.cor
                              }}
                            >
                              {copoBase.categoria?.nome}
                            </Badge>
                          </TableCell>
                          <TableCell>{copoBase.insumoBase?.nome}</TableCell>
                          <TableCell>
                            {copoBase.quantidadeBase}{copoBase.insumoBase?.unidadeMedida?.sigla || 'g'}
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(copoBase.custoBase)}
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(copoBase.custoInsumos)}
                          </TableCell>
                          <TableCell className="font-bold text-orange-600">
                            {formatarMoeda(copoBase.custoTotal)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={copoBase.ativo ? "default" : "secondary"}>
                              {copoBase.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {state.categorias
                  .filter(categoria => {
                    const coposBaseCategoria = filteredCoposBase.filter(cb => cb.categoriaId === categoria.id);
                    return coposBaseCategoria.length > 0;
                  })
                  .map((categoria) => {
                    const coposBaseCategoria = filteredCoposBase.filter(cb => cb.categoriaId === categoria.id);
                    const custoMedio = coposBaseCategoria.reduce((acc, cb) => acc + cb.custoTotal, 0) / coposBaseCategoria.length;

                    return (
                      <Card key={categoria.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.nome}
                                <Badge variant="secondary">{coposBaseCategoria.length}</Badge>
                              </CardTitle>
                              <CardDescription>
                                Custo médio: {formatarMoeda(custoMedio)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Insumo Base</TableHead>
                                <TableHead>Qtd. Base</TableHead>
                                <TableHead>Custo Base</TableHead>
                                <TableHead>Custo Insumos</TableHead>
                                <TableHead>Custo Total</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coposBaseCategoria.map((copoBase) => (
                                <TableRow key={copoBase.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Coffee className="w-4 h-4 text-muted-foreground" />
                                      {copoBase.nome}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      style={{
                                        backgroundColor: copoBase.categoria?.cor + '20',
                                        borderColor: copoBase.categoria?.cor,
                                        color: copoBase.categoria?.cor
                                      }}
                                    >
                                      {copoBase.categoria?.nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{copoBase.insumoBase?.nome}</TableCell>
                                  <TableCell>
                                    {copoBase.quantidadeBase}{copoBase.insumoBase?.unidadeMedida?.sigla || 'g'}
                                  </TableCell>
                                  <TableCell>
                                    {formatarMoeda(copoBase.custoBase)}
                                  </TableCell>
                                  <TableCell>
                                    {formatarMoeda(copoBase.custoInsumos)}
                                  </TableCell>
                                  <TableCell className="font-bold text-orange-600">
                                    {formatarMoeda(copoBase.custoTotal)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={copoBase.ativo ? "default" : "secondary"}>
                                      {copoBase.ativo ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Visualizar"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Editar"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Copo Base</DialogTitle>
          </DialogHeader>
          {viewingCopoBase && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">{viewingCopoBase.nome}</h3>
                <p className="text-sm text-muted-foreground">{viewingCopoBase.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Categoria</p>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: viewingCopoBase.categoria?.cor + '20',
                      color: viewingCopoBase.categoria?.cor,
                      borderColor: viewingCopoBase.categoria?.cor
                    }}
                  >
                    {viewingCopoBase.categoria?.nome}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={viewingCopoBase.ativo ? "default" : "secondary"}>
                    {viewingCopoBase.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              {/* Composição Detalhada */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Composição do Copo Base
                </h4>

                {/* Insumo Base */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Insumo Base</span>
                      <Badge variant="outline">Principal</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{viewingCopoBase.insumoBase?.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {viewingCopoBase.insumoBase?.descricao}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade: </span>
                          <span className="font-medium">
                            {viewingCopoBase.quantidadeBase}{viewingCopoBase.insumoBase?.unidadeMedida?.sigla}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Custo Base: </span>
                          <span className="font-medium text-destructive">
                            {formatarMoeda(viewingCopoBase.custoBase)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categoria: </span>
                          <span className="font-medium">
                            {viewingCopoBase.insumoBase?.categoria?.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insumos Adicionais */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Insumos Adicionais</span>
                      <Badge variant="outline">
                        {viewingCopoBase.insumos?.length || 0} itens
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewingCopoBase.insumos && viewingCopoBase.insumos.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Custo Unit.</TableHead>
                            <TableHead className="text-right">Custo Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingCopoBase.insumos.map((ins, index) => (
                            <TableRow key={ins.id || index}>
                              <TableCell className="font-medium">
                                {ins.insumo?.nome || 'Insumo não identificado'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: ins.insumo?.categoria?.cor + '20',
                                    borderColor: ins.insumo?.categoria?.cor,
                                    color: ins.insumo?.categoria?.cor
                                  }}
                                >
                                  {ins.insumo?.categoria?.nome}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {ins.quantidade}
                                {ins.insumo?.unidadeMedida && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {ins.insumo.unidadeMedida.sigla}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {ins.custo && ins.quantidade ?
                                  formatarMoeda(ins.custo / ins.quantidade) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium text-destructive">
                                {formatarMoeda(ins.custo)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-semibold bg-muted/50">
                            <TableCell colSpan={4}>Total dos Insumos Adicionais</TableCell>
                            <TableCell className="text-right text-destructive">
                              {formatarMoeda(viewingCopoBase.custoInsumos)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum insumo adicional
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Resumo de Custos */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Resumo Financeiro
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Custos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Insumo Base:</span>
                        <span className="font-medium">{formatarMoeda(viewingCopoBase.custoBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Insumos Adicionais:</span>
                        <span className="font-medium">{formatarMoeda(viewingCopoBase.custoInsumos)}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between">
                        <span className="font-semibold">Custo Total:</span>
                        <span className="font-bold text-destructive">
                          {formatarMoeda(viewingCopoBase.custoTotal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Categorias - Padrão Cardápio */}
      <Dialog open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Crie novas categorias, edite existentes e organize a ordem de exibição
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seção de Nova Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nova Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nome da Categoria</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Copos Premium"
                  />
                </div>

                <div>
                  <Label>Ícone</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-8 p-0"
                      onClick={handlePrevIcons}
                      disabled={iconScrollIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-5 gap-2 flex-1">
                      {visibleIcons.map((iconData) => {
                        const IconComponent = iconData.icon;
                        return (
                          <Button
                            key={iconData.name}
                            variant={newCategoryIcon === iconData.name ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => setNewCategoryIcon(iconData.name)}
                          >
                            <IconComponent className="w-4 h-4" />
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-8 p-0"
                      onClick={handleNextIcons}
                      disabled={iconScrollIndex >= availableIcons.length - iconsPerView}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Cor</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handlePrevColors}
                      disabled={colorScrollIndex === 0}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-8 gap-2 flex-1">
                      {visibleColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-2"
                          style={{
                            backgroundColor: color,
                            borderColor: newCategoryColor === color ? "#000" : "#e5e7eb"
                          }}
                          onClick={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleNextColors}
                      disabled={colorScrollIndex >= availableColors.length - colorsPerView}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Categoria
                </Button>

                {/* Feedback visual */}
                {newCategoryName.trim() && (
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                    Preview: <span style={{ color: newCategoryColor }}>●</span> {newCategoryName.trim()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção de Categorias Existentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Categorias Existentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingCategory && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-3">Editando Categoria</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-category-name">Nome</Label>
                        <Input
                          id="edit-category-name"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-6 p-0"
                            onClick={handlePrevIcons}
                            disabled={iconScrollIndex === 0}
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                          <div className="grid grid-cols-5 gap-2 flex-1">
                            {visibleIcons.map((iconData) => {
                              const IconComponent = iconData.icon;
                              return (
                                <Button
                                  key={iconData.name}
                                  variant={editCategoryIcon === iconData.name ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setEditCategoryIcon(iconData.name)}
                                >
                                  <IconComponent className="w-3 h-3" />
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-6 p-0"
                            onClick={handleNextIcons}
                            disabled={iconScrollIndex >= availableIcons.length - iconsPerView}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Cor</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handlePrevColors}
                            disabled={colorScrollIndex === 0}
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                          <div className="grid grid-cols-8 gap-2 flex-1">
                            {visibleColors.map((color) => (
                              <Button
                                key={color}
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 border-2"
                                style={{
                                  backgroundColor: color,
                                  borderColor: editCategoryColor === color ? "#000" : "#e5e7eb"
                                }}
                                onClick={() => setEditCategoryColor(color)}
                              />
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handleNextColors}
                            disabled={colorScrollIndex >= availableColors.length - colorsPerView}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateCategory}
                          size="sm"
                          disabled={!editCategoryName.trim()}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} size="sm">
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {state.categorias.map((categoria, index) => {
                    const IconComponent = Coffee; // Fallback icon
                    const isEditing = editingCategory === categoria.id;

                    return (
                      <div
                        key={categoria.id}
                        className={`flex items-center gap-3 p-2 border rounded-lg transition-all ${
                          isEditing ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="cursor-grab hover:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: categoria.cor || "#8B5CF6" }}
                        >
                          <IconComponent className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{categoria.nome}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEditCategory(categoria.id)}
                            disabled={isEditing}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(categoria.id)}
                            disabled={isEditing}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setCategoriesModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <CopoBaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        copoBase={editingCopoBase}
      />
    </Layout>
  );
};

export default CoposBase;