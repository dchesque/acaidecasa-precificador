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
import { InsumoModal } from "@/components/modals/InsumoModal";
import { useAppContext } from "@/contexts/AppContext";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Insumo } from "@/types/database";
import { formatarMoeda, formatarCustoPorUnidade, calcularCustoPorGrama, obterDadosFornecedorPadrao } from "@/utils/calculations";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  Users,
  Tags,
  Eye,
  Star,
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
  Flame,
  Sparkles,
  Crown,
  Gift,
  Target
} from "lucide-react";
import { Label } from "@/components/ui/label";

const Insumos = () => {
  const { state, dispatch } = useAppContext();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [categoriasModalOpen, setCategoriasModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | undefined>();
  const [viewingInsumo, setViewingInsumo] = useState<Insumo | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");
  const [isClient, setIsClient] = useState(false);

  // Estados para categorias inline (padrão cardápio)
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Package");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("Package");
  const [editCategoryColor, setEditCategoryColor] = useState("#8B5CF6");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [iconScrollIndex, setIconScrollIndex] = useState(0);
  const [colorScrollIndex, setColorScrollIndex] = useState(0);

  // Configuração de ícones disponíveis para insumos
  const availableIcons = [
    { name: "Package", icon: Package },
    { name: "Coffee", icon: Coffee },
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      id: `categoria-insumo-${Date.now()}`,
      nome: newCategoryName.trim(),
      descricao: `Categoria de insumos: ${newCategoryName.trim()}`,
      cor: newCategoryColor,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_CATEGORIA', payload: newCategory });

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("Package");
    setNewCategoryColor("#8B5CF6");

    // Feedback visual de sucesso
    console.log("✅ Categoria de insumo criada com sucesso:", newCategory.nome);
  };

  const handleEditCategory = (categoryId: string) => {
    const categoria = state.categorias.find(cat => cat.id === categoryId);
    if (categoria) {
      setEditingCategory(categoryId);
      setEditCategoryName(categoria.nome);
      setEditCategoryIcon("Package");
      setEditCategoryColor(categoria.cor || "#8B5CF6");
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const updatedCategory = {
      id: editingCategory,
      nome: editCategoryName.trim(),
      descricao: `Categoria de insumos: ${editCategoryName.trim()}`,
      cor: editCategoryColor,
      ativo: true,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategory });

    console.log("✅ Categoria de insumo editada com sucesso:", editCategoryName.trim());

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Package");
    setEditCategoryColor("#8B5CF6");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Package");
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

  // Dados mockados temporários para desenvolvimento (consistentes com Cardápio)
  const insumosMock = [
    {
      id: "INS001",
      nome: "Açaí Premium",
      descricao: "Açaí premium de alta qualidade da Amazônia",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Frutas", cor: "#8b5cf6", ativo: true },
      unidadeMedidaId: "um1",
      unidadeMedida: { id: "um1", nome: "Gramas", sigla: "g", tipo: "PESO" },
      fornecedorCalculoId: "forn1",
      ativo: true,
      observacoes: "Açaí premium congelado, alta qualidade",
      custo: 0.0125, // R$ 0.0125 por grama (R$ 12.50/kg)
      fornecedorPadrao: "Amazônia Açaí Ltda",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS002",
      nome: "Banana Prata",
      descricao: "Banana prata fresca selecionada",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Frutas", cor: "#8b5cf6", ativo: true },
      unidadeMedidaId: "um1",
      unidadeMedida: { id: "um1", nome: "Gramas", sigla: "g", tipo: "PESO" },
      fornecedorCalculoId: "forn2",
      ativo: true,
      observacoes: "Banana orgânica, ideal para vitaminas",
      custo: 0.0032, // R$ 0.0032 por grama (R$ 3.20/kg)
      fornecedorPadrao: "Frutas do Vale",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS003",
      nome: "Granola Artesanal",
      descricao: "Granola crocante artesanal sem conservantes",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Complementos", cor: "#f59e0b", ativo: true },
      unidadeMedidaId: "um1",
      unidadeMedida: { id: "um1", nome: "Gramas", sigla: "g", tipo: "PESO" },
      fornecedorCalculoId: "forn3",
      ativo: true,
      observacoes: "Granola artesanal com aveia, castanhas e mel",
      custo: 0.0089, // R$ 0.0089 por grama (R$ 8.90/kg)
      fornecedorPadrao: "Cereais & Grãos",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS004",
      nome: "Mel Orgânico",
      descricao: "Mel orgânico puro de flores silvestres",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Complementos", cor: "#f59e0b", ativo: true },
      unidadeMedidaId: "um1",
      unidadeMedida: { id: "um1", nome: "Gramas", sigla: "g", tipo: "PESO" },
      fornecedorCalculoId: "forn4",
      ativo: true,
      observacoes: "Mel orgânico certificado, sabor suave",
      custo: 0.0155, // R$ 0.0155 por grama (R$ 15.50/kg)
      fornecedorPadrao: "Apiário Dourado",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS005",
      nome: "Aveia em Flocos",
      descricao: "Aveia em flocos integral",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Complementos", cor: "#f59e0b", ativo: true },
      unidadeMedidaId: "um1",
      unidadeMedida: { id: "um1", nome: "Gramas", sigla: "g", tipo: "PESO" },
      fornecedorCalculoId: "forn3",
      ativo: true,
      observacoes: "Aveia integral rica em fibras",
      custo: 0.0048, // R$ 0.0048 por grama (R$ 4.80/kg)
      fornecedorPadrao: "Cereais & Grãos",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS006",
      nome: "Copo 300ml",
      descricao: "Copo plástico transparente 300ml",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Embalagens", cor: "#06b6d4", ativo: true },
      unidadeMedidaId: "um2",
      unidadeMedida: { id: "um2", nome: "Unidade", sigla: "un", tipo: "UNIDADE" },
      fornecedorCalculoId: "forn5",
      ativo: true,
      observacoes: "Copo descartável para porções menores",
      custo: 0.35, // R$ 0.35 por unidade
      fornecedorPadrao: "Embalagens Eco",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "INS007",
      nome: "Copo 500ml",
      descricao: "Copo plástico transparente 500ml",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Embalagens", cor: "#06b6d4", ativo: true },
      unidadeMedidaId: "um2",
      unidadeMedida: { id: "um2", nome: "Unidade", sigla: "un", tipo: "UNIDADE" },
      fornecedorCalculoId: "forn5",
      ativo: true,
      observacoes: "Copo descartável tamanho padrão",
      custo: 0.48, // R$ 0.48 por unidade
      fornecedorPadrao: "Embalagens Eco",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Use mock data for development, fallback to real data if available
  const insumosData = state.insumos.length > 0 ? state.insumos : insumosMock;

  const filteredInsumos = insumosData.filter((insumo) => {
    const matchesSearch = insumo.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || insumo.categoriaId === selectedCategory;
    const matchesSupplier = !selectedSupplier || selectedSupplier === "all" || insumo.fornecedorCalculoId === selectedSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  // Group insumos by category for the "by-category" view
  const insumosByCategory = viewMode === "by-category" ? 
    state.categorias
      .filter(categoria => categoria.ativo)
      .map(categoria => ({
        categoria,
        insumos: filteredInsumos.filter(insumo => insumo.categoriaId === categoria.id)
      }))
      .filter(group => group.insumos.length > 0)
    : [];

  const handleNewInsumo = () => {
    setEditingInsumo(undefined);
    setModalOpen(true);
  };

  const handleEditInsumo = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setModalOpen(true);
  };

  const handleViewInsumo = (insumo: Insumo) => {
    setViewingInsumo(insumo);
    setViewModalOpen(true);
  };

  const handleDeleteInsumo = async (insumo: Insumo) => {
    const ok = await confirm({
      title: "Excluir insumo",
      description: `Tem certeza que deseja excluir "${insumo.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      dispatch({ type: 'DELETE_INSUMO', payload: insumo.id });
    }
  };

  // Component to render a table row for an insumo
  const InsumoTableRow = ({ insumo, showCategory = true }: { insumo: Insumo; showCategory?: boolean }) => {
    const dadosFornecedor = obterDadosFornecedorPadrao(insumo, state.insumoFornecedores, state.fornecedores);
    
    return (
      <TableRow key={insumo.id}>
        <TableCell>
          <div className="font-medium">{insumo.nome}</div>
        </TableCell>
        {showCategory && (
          <TableCell>
            {insumo.categoria && (
              <Badge 
                variant="secondary" 
                className="text-xs" 
                style={{ 
                  backgroundColor: insumo.categoria.cor + '20', 
                  color: insumo.categoria.cor, 
                  borderColor: insumo.categoria.cor 
                }}
              >
                {insumo.categoria.nome}
              </Badge>
            )}
          </TableCell>
        )}
        <TableCell>
          <span className="text-sm">
            {dadosFornecedor.fornecedor?.nome || 'Sem fornecedor padrão'}
          </span>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {dadosFornecedor.quantidade} {insumo.unidadeMedida?.sigla}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatarMoeda(dadosFornecedor.precoPrincipal)}
            </span>
            {dadosFornecedor.insumoFornecedor && (
              <Badge 
                variant="outline"
                className={`text-xs ${
                  dadosFornecedor.insumoFornecedor.usarPrecoComDesconto && dadosFornecedor.insumoFornecedor.precoComDesconto 
                    ? "border-green-200 bg-green-50 text-green-700" 
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {dadosFornecedor.insumoFornecedor.usarPrecoComDesconto && dadosFornecedor.insumoFornecedor.precoComDesconto ? "Desconto" : "Bruto"}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-bold text-primary">
            {formatarCustoPorUnidade(dadosFornecedor.custoUnidade)}
          </div>
          <div className="text-xs text-muted-foreground">
            por {insumo.unidadeMedida?.sigla}
          </div>
        </TableCell>
        <TableCell className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewInsumo(insumo)}
            title="Visualizar"
            aria-label={`Visualizar insumo ${insumo.nome}`}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditInsumo(insumo)}
            title="Editar"
            aria-label={`Editar insumo ${insumo.nome}`}
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteInsumo(insumo)}
            title="Excluir"
            aria-label={`Excluir insumo ${insumo.nome}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="w-2 h-2 rounded-full mx-auto" 
             style={{backgroundColor: insumo.ativo ? '#22c55e' : '#6b7280'}} 
             title={insumo.ativo ? "Ativo" : "Inativo"}
        />
      </TableCell>
    </TableRow>
  );
};

  const stats = {
    totalInsumos: insumosData.filter(i => i.ativo).length,
    insumosInativos: insumosData.filter(i => !i.ativo).length,
    categoriasComInsumos: new Set(insumosData.filter(i => i.ativo).map(i => i.categoriaId)).size,
    fornecedoresAtivos: new Set(insumosData.filter(i => i.ativo).map(i => i.fornecedorCalculoId)).size,
    insumosSemFornecedor: insumosData.filter(i => i.ativo && !i.fornecedorCalculoId).length,
    custoMaisAlto: insumosData.length > 0
      ? Math.max(...insumosData.filter(i => i.ativo).map(i => calcularCustoPorGrama(i, state.insumoFornecedores)))
      : 0,
    custoMaisBaixo: insumosData.length > 0
      ? Math.min(...insumosData.filter(i => i.ativo).map(i => calcularCustoPorGrama(i, state.insumoFornecedores)))
      : 0,
    insumosComDesconto: state.insumoFornecedores.filter(inf =>
      inf.ativo && inf.usarPrecoComDesconto && inf.precoComDesconto && inf.precoComDesconto > 0
    ).length,
  };

  if (!isClient) {
    return null;
  }

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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setCategoriasModalOpen(true)} 
              className="flex items-center gap-2"
            >
              <Tags className="w-4 h-4" />
              Categorias
            </Button>
            <Button onClick={handleNewInsumo} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Insumo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insumos Ativos</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalInsumos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.insumosInativos > 0 && `${stats.insumosInativos} inativos`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Tags className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.categoriasComInsumos}</div>
              <p className="text-xs text-muted-foreground">
                categorias com insumos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Desconto</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.insumosComDesconto}</div>
              <p className="text-xs text-muted-foreground">
                insumos com desconto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Fornecedor</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.insumosSemFornecedor}</div>
              <p className="text-xs text-muted-foreground">
                {stats.insumosSemFornecedor > 0 ? "precisam de atenção" : "todos configurados"}
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
                    placeholder="Buscar insumo..." 
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
                  <Select value={selectedSupplier || undefined} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os fornecedores</SelectItem>
                      {state.fornecedores.map((fornecedor) => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={viewMode} onValueChange={(value) => setViewMode(value as "complete" | "by-category")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Modo de visualização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">🔍 Visualização Completa</SelectItem>
                      <SelectItem value="by-category">📁 Por Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Insumos */}
            {filteredInsumos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum insumo encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {insumosData.length === 0 
                      ? "Comece adicionando seus primeiros insumos ao sistema."
                      : "Tente ajustar os filtros para encontrar o que procura."
                    }
                  </p>
                  {insumosData.length === 0 && (
                    <Button onClick={handleNewInsumo}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Insumo
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "complete" ? (
              // Complete view (current)
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Custo/Unidade</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInsumos.map((insumo) => (
                      <InsumoTableRow key={insumo.id} insumo={insumo} showCategory={true} />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              // By category view - single unified table
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Custo/Unidade</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insumosByCategory.map((group, groupIndex) => (
                      <Fragment key={`group-${group.categoria.id}`}>
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
                                {group.insumos.length} {group.insumos.length === 1 ? 'item' : 'itens'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Category items */}
                        {group.insumos.map((insumo, insumoIndex) => (
                          <InsumoTableRow
                            key={`${group.categoria.id}-${insumo.id}`}
                            insumo={insumo}
                            showCategory={true}
                          />
                        ))}
                        {/* Spacer row between categories (except for last one) */}
                        {groupIndex < insumosByCategory.length - 1 && (
                          <TableRow key={`spacer-${group.categoria.id}`}>
                            <TableCell colSpan={8} className="p-0">
                              <div className="h-4"></div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
        </div>
      </div>

      <InsumoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        insumo={editingInsumo}
      />

      {/* Modal de Gerenciamento de Categorias - Padrão Cardápio */}
      <Dialog open={categoriasModalOpen} onOpenChange={setCategoriasModalOpen}>
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
                    placeholder="Ex: Frutas e Polpas"
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
                    const IconComponent = Package; // Fallback icon
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
                            aria-label={`Editar categoria ${categoria.nome}`}
                          >
                            <Edit className="w-3 h-3" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(categoria.id)}
                            disabled={isEditing}
                            aria-label={`Excluir categoria ${categoria.nome}`}
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
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
            <Button variant="outline" onClick={() => setCategoriasModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Visualizar Insumo
            </DialogTitle>
          </DialogHeader>
          
          {viewingInsumo && (
            <div className="space-y-6">
              {(() => {
                const dadosFornecedorPadrao = obterDadosFornecedorPadrao(
                  viewingInsumo,
                  state.insumoFornecedores,
                  state.fornecedores
                );
                
                return (
                  <>
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{viewingInsumo.nome}</h3>
                        <p className="text-muted-foreground">{viewingInsumo.descricao || "Sem descrição"}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={viewingInsumo.ativo ? "default" : "secondary"}>
                          {viewingInsumo.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>

                    {/* Categorização */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                        <p className="font-medium">{viewingInsumo.categoria?.nome}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Unidade de Medida</label>
                        <p className="font-medium">{viewingInsumo.unidadeMedida?.nome} ({viewingInsumo.unidadeMedida?.sigla})</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fornecedor Padrão</label>
                        <p className="font-medium">{dadosFornecedorPadrao.fornecedor?.nome || "Não definido"}</p>
                      </div>
                    </div>

                    {/* Fornecedor Padrão - Detalhes */}
                    {dadosFornecedorPadrao.fornecedor && dadosFornecedorPadrao.insumoFornecedor && (
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 text-blue-600 fill-current" />
                          <h4 className="font-semibold text-blue-800">Fornecedor Usado nos Cálculos</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Preço Bruto</label>
                            <p className="text-lg font-bold">{formatarMoeda(dadosFornecedorPadrao.insumoFornecedor.precoBruto)}</p>
                          </div>
                          {dadosFornecedorPadrao.insumoFornecedor.precoComDesconto && dadosFornecedorPadrao.insumoFornecedor.precoComDesconto > 0 && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Preço com Desconto</label>
                              <p className="text-lg font-bold text-green-600">{formatarMoeda(dadosFornecedorPadrao.insumoFornecedor.precoComDesconto)}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-blue-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Preço Usado nos Cálculos</label>
                              <p className="text-lg font-bold text-blue-700">
                                {formatarMoeda(dadosFornecedorPadrao.precoPrincipal)}
                              </p>
                            </div>
                            <Badge variant={dadosFornecedorPadrao.insumoFornecedor.usarPrecoComDesconto ? "destructive" : "secondary"}>
                              {dadosFornecedorPadrao.insumoFornecedor.usarPrecoComDesconto ? "Com Desconto" : "Bruto"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantidade e Custo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <label className="text-sm font-medium text-muted-foreground">Quantidade (Fornecedor Padrão)</label>
                        <p className="text-2xl font-bold">{dadosFornecedorPadrao.quantidade} {viewingInsumo.unidadeMedida?.sigla}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <label className="text-sm font-medium text-muted-foreground">Custo por Unidade</label>
                        <p className="text-2xl font-bold text-primary">
                          {formatarCustoPorUnidade(dadosFornecedorPadrao.custoUnidade)}
                        </p>
                        <p className="text-sm text-muted-foreground">por {viewingInsumo.unidadeMedida?.sigla}</p>
                      </div>
                    </div>

                    {/* Todos os Fornecedores */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Todos os Fornecedores</h4>
                      <div className="space-y-3">
                        {state.insumoFornecedores
                          .filter(inf => inf.insumoId === viewingInsumo.id && inf.ativo)
                          .map(insumoFornecedor => {
                            const fornecedor = state.fornecedores.find(f => f.id === insumoFornecedor.fornecedorId);
                            const precoParaCalculo = insumoFornecedor.usarPrecoComDesconto && insumoFornecedor.precoComDesconto 
                              ? insumoFornecedor.precoComDesconto 
                              : insumoFornecedor.precoBruto;
                            const custoPorUnidade = precoParaCalculo / insumoFornecedor.quantidadeComprada;
                            const isPadrao = insumoFornecedor.fornecedorId === viewingInsumo.fornecedorCalculoId;

                            return (
                              <div key={insumoFornecedor.id} className={`flex items-center justify-between p-3 rounded-lg border ${isPadrao ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                  {isPadrao && <Star className="h-4 w-4 text-blue-600 fill-current" />}
                                  <div>
                                    <p className="font-medium">{fornecedor?.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {insumoFornecedor.quantidadeComprada} {viewingInsumo.unidadeMedida?.sigla} • {formatarMoeda(precoParaCalculo)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{formatarCustoPorUnidade(custoPorUnidade)}</p>
                                  <p className="text-sm text-muted-foreground">por {viewingInsumo.unidadeMedida?.sigla}</p>
                                </div>
                              </div>
                            );
                          })
                        }
                        {state.insumoFornecedores.filter(inf => inf.insumoId === viewingInsumo.id && inf.ativo).length === 0 && (
                          <p className="text-muted-foreground text-center py-4">Nenhum fornecedor cadastrado</p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Insumos;
