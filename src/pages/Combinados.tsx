"use client"
import React, { useState, useEffect, Fragment } from "react";
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
import { CombinadoModal } from "@/components/modals/CombinadoModal";
import { CombinadoViewModal } from "@/components/modals/CombinadoViewModal";
import { useAppContext } from "@/contexts/AppContext";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Combinado, Categoria } from "@/types/database";
import { formatarMoeda, calcularPrecoVendaCombinado, verificarComboPrecoCompleto } from "@/utils/calculations";
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
  Settings,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  Coffee,
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

const Combinados = () => {
  const { state, dispatch, combinados, categorias, cardapio, getPrecoVendaItem, deleteCombinado } = useAppContext();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCombinado, setEditingCombinado] = useState<Combinado | undefined>();
  const [viewingCombinado, setViewingCombinado] = useState<Combinado | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");
  const [apenasPrecoCompleto, setApenasPrecoCompleto] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Estados para categorias inline (padrão cardápio)
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Layers");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("Layers");
  const [editCategoryColor, setEditCategoryColor] = useState("#8B5CF6");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [iconScrollIndex, setIconScrollIndex] = useState(0);
  const [colorScrollIndex, setColorScrollIndex] = useState(0);

  // Configuração de ícones disponíveis para combinados
  const availableIcons = [
    { name: "Layers", icon: Layers },
    { name: "Coffee", icon: Coffee },
    { name: "Cherry", icon: Cherry },
    { name: "Cake", icon: Cake },
    { name: "Package", icon: Package },
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
      id: `categoria-combinado-${Date.now()}`,
      nome: newCategoryName.trim(),
      descricao: `Categoria de combinados: ${newCategoryName.trim()}`,
      cor: newCategoryColor,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_CATEGORIA', payload: newCategory });

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("Layers");
    setNewCategoryColor("#8B5CF6");

    // Feedback visual de sucesso
    console.log("✅ Categoria de combinado criada com sucesso:", newCategory.nome);
  };

  const handleEditCategory = (categoryId: string) => {
    const categoria = state.categorias.find(cat => cat.id === categoryId);
    if (categoria) {
      setEditingCategory(categoryId);
      setEditCategoryName(categoria.nome);
      setEditCategoryIcon("Layers");
      setEditCategoryColor(categoria.cor || "#8B5CF6");
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const updatedCategory = {
      id: editingCategory,
      nome: editCategoryName.trim(),
      descricao: `Categoria de combinados: ${editCategoryName.trim()}`,
      cor: editCategoryColor,
      ativo: true,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategory });

    console.log("✅ Categoria de combinado editada com sucesso:", editCategoryName.trim());

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Layers");
    setEditCategoryColor("#8B5CF6");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Layers");
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
  const combinadosMock: Combinado[] = [
    {
      id: "COMB001",
      nome: "Açaí Completo 500ml",
      descricao: "Açaí premium com banana, granola e mel - nossa especialidade",
      categoriaId: "cat1",
      categoria: {
        id: "cat1",
        nome: "Premium",
        descricao: "Produtos premium da casa",
        cor: "#8b5cf6",
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      copoBaseId: "COPO002",
      copoBase: {
        id: "COPO002",
        nome: "Copo 500ml Tradicional",
        custoTotal: 6.20
      },
      complementos: [
        {
          id: "comp1",
          combinadoId: "COMB001",
          insumoId: "INS003",
          quantidade: 30,
          custo: 0.27, // 30 * 0.0089
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS003", nome: "Granola Artesanal", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "comp2",
          combinadoId: "COMB001",
          insumoId: "INS004",
          quantidade: 20,
          custo: 0.31, // 20 * 0.0155
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS004", nome: "Mel Orgânico", unidadeMedida: { sigla: "g" } }
        }
      ],
      custoCopoBase: 6.20,
      custoComplementos: 0.58, // 0.27 + 0.31
      custoTotal: 6.78,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "COMB002",
      nome: "Açaí Fitness 300ml",
      descricao: "Açaí saudável com aveia e granola - ideal para fitness",
      categoriaId: "cat2",
      categoria: {
        id: "cat2",
        nome: "Saudável",
        descricao: "Opções fitness e saudáveis",
        cor: "#10b981",
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      copoBaseId: "COPO001",
      copoBase: {
        id: "COPO001",
        nome: "Copo 300ml Premium",
        custoTotal: 4.50
      },
      complementos: [
        {
          id: "comp3",
          combinadoId: "COMB002",
          insumoId: "INS005",
          quantidade: 25,
          custo: 0.12, // 25 * 0.0048
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS005", nome: "Aveia em Flocos", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "comp4",
          combinadoId: "COMB002",
          insumoId: "INS003",
          quantidade: 20,
          custo: 0.18, // 20 * 0.0089
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS003", nome: "Granola Artesanal", unidadeMedida: { sigla: "g" } }
        }
      ],
      custoCopoBase: 4.50,
      custoComplementos: 0.30, // 0.12 + 0.18
      custoTotal: 4.80,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "COMB003",
      nome: "Smoothie Verde 400ml",
      descricao: "Smoothie nutritivo com aveia, banana e mel - energia natural",
      categoriaId: "cat3",
      categoria: {
        id: "cat3",
        nome: "Smoothies",
        descricao: "Smoothies nutritivos",
        cor: "#f59e0b",
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      copoBaseId: "COPO003",
      copoBase: {
        id: "COPO003",
        nome: "Copo 400ml Especial",
        custoTotal: 3.85
      },
      complementos: [
        {
          id: "comp5",
          combinadoId: "COMB003",
          insumoId: "INS005",
          quantidade: 40,
          custo: 0.19, // 40 * 0.0048
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS005", nome: "Aveia em Flocos", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "comp6",
          combinadoId: "COMB003",
          insumoId: "INS002",
          quantidade: 80,
          custo: 0.26, // 80 * 0.0032
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        }
      ],
      custoCopoBase: 3.85,
      custoComplementos: 0.45, // 0.19 + 0.26
      custoTotal: 4.30,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const filteredCombinados = combinados.filter((combinado) => {
    const matchesSearch = combinado.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || combinado.categoriaId === selectedCategory;
    const matchesPrecoCompleto = !apenasPrecoCompleto || verificarComboPrecoCompleto(combinado, cardapio);
    return matchesSearch && matchesCategory && matchesPrecoCompleto;
  });

  // Remove mock categories since we're using context

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

  const handleDeleteCombinado = async (combinado: Combinado) => {
    const ok = await confirm({
      title: "Excluir combinado",
      description: `Tem certeza que deseja excluir "${combinado.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      deleteCombinado(combinado.id);
    }
  };

  // Component to render a table row for a combinado
  const CombinadoTableRow = ({ combinado, showCategory = true }: { combinado: Combinado; showCategory?: boolean }) => {
    // Calcular preços de venda
    const resultadoPrecos = calcularPrecoVendaCombinado(combinado, cardapio);
    const temPrecoCompleto = verificarComboPrecoCompleto(combinado, cardapio);

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
        <TableCell>
          <div className="text-sm font-bold text-green-600">
            {resultadoPrecos.precoVendaTotal > 0 ? formatarMoeda(resultadoPrecos.precoVendaTotal) : "Incompleto"}
          </div>
          {resultadoPrecos.precoVendaTotal > 0 && (
            <div className="text-xs text-muted-foreground">
              {resultadoPrecos.itensComPreco}/{resultadoPrecos.totalItens} itens
            </div>
          )}
        </TableCell>
        <TableCell className="text-center">
          {temPrecoCompleto ? (
            <Badge variant="default" className="text-xs">
              ✓ Completo
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              ⚠ Incompleto
            </Badge>
          )}
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
      </TableRow>
    );
  };

  const stats = React.useMemo(() => {
    const combinadosAtivos = combinados.filter(c => c.ativo);
    const combinadosComPrecoCompleto = combinadosAtivos.filter(c => verificarComboPrecoCompleto(c, cardapio));

    const precosVenda = combinadosAtivos.map(c => {
      const resultado = calcularPrecoVendaCombinado(c, cardapio);
      return resultado.precoVendaTotal;
    }).filter(p => p > 0);

    return {
      totalCombinados: combinadosAtivos.length,
      combinadosInativos: combinados.filter(c => !c.ativo).length,
      categoriasComCombinados: new Set(combinadosAtivos.map(c => c.categoriaId)).size,
      custoMedio: combinadosAtivos.reduce((acc, c) => acc + c.custoTotal, 0) / (combinadosAtivos.length || 1),
      custoMaiorCombinado: combinadosAtivos.length > 0 ? Math.max(...combinadosAtivos.map(c => c.custoTotal)) : 0,
      combinadosComPrecoCompleto: combinadosComPrecoCompleto.length,
      percentualPrecoCompleto: combinadosAtivos.length > 0 ? (combinadosComPrecoCompleto.length / combinadosAtivos.length) * 100 : 0,
      precoVendaMedio: precosVenda.length > 0 ? precosVenda.reduce((acc, p) => acc + p, 0) / precosVenda.length : 0,
      maiorPrecoVenda: precosVenda.length > 0 ? Math.max(...precosVenda) : 0,
    };
  }, [combinados, cardapio]);


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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCategoriesModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gerenciar Categorias
            </Button>
            <Button onClick={handleNewCombinado} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Combinado
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Preços Completos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.combinadosComPrecoCompleto}</div>
              <p className="text-xs text-muted-foreground">
                {stats.percentualPrecoCompleto.toFixed(0)}% dos combinados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Preço Médio de Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.precoVendaMedio > 0 ? formatarMoeda(stats.precoVendaMedio) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                preço médio dos combinados
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Button
                  variant={apenasPrecoCompleto ? "default" : "outline"}
                  onClick={() => setApenasPrecoCompleto(!apenasPrecoCompleto)}
                  className="w-full"
                >
                  {apenasPrecoCompleto ? "✓ Preços Completos" : "Apenas Preços Completos"}
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
                          <TableHead>Preço Venda Total</TableHead>
                          <TableHead className="text-center">Status Preços</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
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
                              <TableHead>Preço Venda Total</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
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
                    placeholder="Ex: Combinados Premium"
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
                    const IconComponent = Layers; // Fallback icon
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
      <CombinadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        combinado={editingCombinado}
      />

      {/* View Modal */}
      <CombinadoViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        combinado={viewingCombinado}
      />
    </Layout>
  );
};

export default Combinados;
