"use client"
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceitaModal } from "@/components/modals/ReceitaModal";
import { useAppContext } from "@/contexts/AppContext";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Receita } from "@/types/database";
import { formatarMoeda, formatarCustoPorUnidade, formatarPorcentagem } from "@/utils/calculations";
import { Plus, ChefHat, Clock, Calculator, Edit, Trash2, Search, Users, Eye, Settings, Package, ChevronLeft, ChevronRight, Coffee, Utensils, ShoppingCart, Grid3X3, GripVertical, Cherry, Cake, Apple, Banana, Cookie, Pizza, Salad, Sandwich, IceCream, Milk, Wine, Zap, Heart, Star, Flame, Sparkles, Crown, Gift, Target, Palette, Tag, MenuSquare, DollarSign, TrendingUp, BarChart3, AlertTriangle, X } from "lucide-react";

const Receitas = () => {
  const { state, dispatch } = useAppContext();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | undefined>();
  const [viewingReceita, setViewingReceita] = useState<Receita | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("ChefHat");
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("ChefHat");
  const [editCategoryColor, setEditCategoryColor] = useState("#8B5CF6");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [iconScrollIndex, setIconScrollIndex] = useState(0);
  const [colorScrollIndex, setColorScrollIndex] = useState(0);

  // Configuração de ícones disponíveis para receitas (adaptado do Cardapio)
  const availableIcons = [
    { name: "ChefHat", icon: ChefHat },
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

  // Funções para gerenciamento de categorias inline (copiado do Cardapio)
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

    const iconComponent = availableIcons.find(icon => icon.name === newCategoryIcon)?.icon || ChefHat;

    const newCategory = {
      id: `categoria-receita-${Date.now()}`,
      nome: newCategoryName.trim(),
      descricao: `Categoria de receitas: ${newCategoryName.trim()}`,
      cor: newCategoryColor,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_CATEGORIA', payload: newCategory });

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("ChefHat");
    setNewCategoryColor("#8B5CF6");

    // Feedback visual de sucesso
    console.log("✅ Categoria de receita criada com sucesso:", newCategory.nome);
  };

  const handleEditCategory = (categoryId: string) => {
    const categoria = state.categorias.find(cat => cat.id === categoryId);
    if (categoria) {
      setEditingCategory(categoryId);
      setEditCategoryName(categoria.nome);
      setEditCategoryIcon("ChefHat");
      setEditCategoryColor(categoria.cor || "#8B5CF6");
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const iconComponent = availableIcons.find(icon => icon.name === editCategoryIcon)?.icon || ChefHat;

    const updatedCategory = {
      id: editingCategory,
      nome: editCategoryName.trim(),
      descricao: `Categoria de receitas: ${editCategoryName.trim()}`,
      cor: editCategoryColor,
      ativo: true,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategory });

    console.log("✅ Categoria de receita editada com sucesso:", editCategoryName.trim());

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("ChefHat");
    setEditCategoryColor("#8B5CF6");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("ChefHat");
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

  // Dados mockados temporários para desenvolvimento - Consistentes com Cardápio e Insumos
  const receitasMock = [
    // RECEITAS DE AÇAÍ
    {
      id: "REC001",
      nome: "Açaí da Casa",
      descricao: "Receita especial da casa com açaí premium, banana e granola",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Açaí", cor: "#8b5cf6", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 500,
      custoPorGrama: 0.0178, // R$ 0.0178 por grama (R$ 17.80/kg)
      custoTotal: 8.90,
      tempoPreparo: 5,
      instrucoes: "1. Bata o açaí congelado com a banana\n2. Sirva no copo\n3. Adicione a granola por cima\n4. Finalize com mel",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing1",
          receitaId: "REC001",
          insumoId: "INS001",
          quantidade: 250, // 250g de açaí
          custo: 3.13, // 250 * 0.0125
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing2",
          receitaId: "REC001",
          insumoId: "INS002",
          quantidade: 100, // 100g de banana
          custo: 0.32, // 100 * 0.0032
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing3",
          receitaId: "REC001",
          insumoId: "INS003",
          quantidade: 50, // 50g de granola
          custo: 0.45, // 50 * 0.0089
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS003", nome: "Granola Artesanal", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing4",
          receitaId: "REC001",
          insumoId: "INS004",
          quantidade: 30, // 30g de mel
          custo: 0.47, // 30 * 0.0155
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS004", nome: "Mel Orgânico", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "REC002",
      nome: "Smoothie Verde",
      descricao: "Smoothie verde nutritivo com aveia, banana e mel",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Smoothies", cor: "#10b981", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 500,
      custoPorGrama: 0.0144, // R$ 0.0144 por grama (R$ 14.40/kg)
      custoTotal: 7.20,
      tempoPreparo: 3,
      instrucoes: "1. Adicione a aveia no liquidificador\n2. Acrescente a banana picada\n3. Bata com água gelada\n4. Finalize com mel a gosto",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing5",
          receitaId: "REC002",
          insumoId: "INS005",
          quantidade: 80, // 80g de aveia
          custo: 0.38, // 80 * 0.0048
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS005", nome: "Aveia em Flocos", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing6",
          receitaId: "REC002",
          insumoId: "INS002",
          quantidade: 120, // 120g de banana
          custo: 0.38, // 120 * 0.0032
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing7",
          receitaId: "REC002",
          insumoId: "INS004",
          quantidade: 25, // 25g de mel
          custo: 0.39, // 25 * 0.0155
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "INS004", nome: "Mel Orgânico", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "REC003",
      nome: "Mix de Granola Premium",
      descricao: "Mix especial de granola com aveia e mel",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 400,
      custoPorGrama: 0.045,
      custoTotal: 18.00,
      tempoPreparo: 20,
      instrucoes: "1. Derreta o chocolate em banho-maria\n2. Aqueça o leite condensado\n3. Misture gradualmente\n4. Adicione a manteiga\n5. Mexa até obter consistência cremosa",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing3",
          receitaId: "rec2",
          insumoId: "ins8",
          quantidade: 200,
          custo: 14.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins8", nome: "Chocolate 70% Cacau", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing4",
          receitaId: "rec2",
          insumoId: "ins15",
          quantidade: 150,
          custo: 4.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins15", nome: "Leite Condensado", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec3",
      nome: "Creme de Paçoca",
      descricao: "Creme cremoso e doce sabor paçoca tradicional",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 350,
      custoPorGrama: 0.057,
      custoTotal: 20.00,
      tempoPreparo: 25,
      instrucoes: "1. Triture a paçoca até virar pó\n2. Aqueça o leite condensado\n3. Misture a paçoca triturada\n4. Cozinhe mexendo até encorpar\n5. Finalize com leite em pó",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing10",
          receitaId: "rec3",
          insumoId: "ins14",
          quantidade: 200,
          custo: 12.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins14", nome: "Paçoca Tradicional", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing11",
          receitaId: "rec3",
          insumoId: "ins15",
          quantidade: 150,
          custo: 8.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins15", nome: "Leite Condensado", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec4",
      nome: "Calda de Caramelo",
      descricao: "Calda dourada e cremosa de caramelo caseiro",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 300,
      custoPorGrama: 0.033,
      custoTotal: 10.00,
      tempoPreparo: 30,
      instrucoes: "1. Derreta o açúcar em panela até caramelizar\n2. Adicione o creme de leite aos poucos\n3. Mexa constantemente\n4. Cozinhe até engrossar\n5. Deixe esfriar antes de usar",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing12",
          receitaId: "rec4",
          insumoId: "ins7",
          quantidade: 200,
          custo: 6.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins7", nome: "Açúcar Cristal", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing13",
          receitaId: "rec4",
          insumoId: "ins16",
          quantidade: 100,
          custo: 4.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins16", nome: "Creme de Leite", unidadeMedida: { sigla: "ml" } }
        }
      ]
    },

    // MIX E COMPLEMENTOS
    {
      id: "rec5",
      nome: "Mix de Granola Especial",
      descricao: "Mix especial de granola com castanhas e frutas secas",
      categoriaId: "cat4",
      categoria: { id: "cat4", nome: "Mix", cor: "#10b981", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 600,
      custoPorGrama: 0.042,
      custoTotal: 25.00,
      tempoPreparo: 10,
      instrucoes: "1. Misture a granola com as castanhas\n2. Adicione as frutas secas\n3. Incorpore as sementes\n4. Mexa bem para homogeneizar\n5. Armazene em recipiente hermético",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing5",
          receitaId: "rec5",
          insumoId: "ins3",
          quantidade: 400,
          custo: 16.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins3", nome: "Granola Tradicional", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing6",
          receitaId: "rec5",
          insumoId: "ins10",
          quantidade: 150,
          custo: 7.50,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins10", nome: "Castanha do Pará", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing7",
          receitaId: "rec5",
          insumoId: "ins11",
          quantidade: 50,
          custo: 1.50,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins11", nome: "Uva Passa", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec6",
      nome: "Mix Tropical",
      descricao: "Mistura de frutas secas tropicais e coco",
      categoriaId: "cat4",
      categoria: { id: "cat4", nome: "Mix", cor: "#10b981", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 400,
      custoPorGrama: 0.065,
      custoTotal: 26.00,
      tempoPreparo: 5,
      instrucoes: "1. Corte as frutas secas em pedaços uniformes\n2. Misture com o coco ralado\n3. Adicione as castanhas picadas\n4. Armazene em local seco",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing14",
          receitaId: "rec6",
          insumoId: "ins17",
          quantidade: 200,
          custo: 18.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins17", nome: "Mix de Frutas Secas", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing15",
          receitaId: "rec6",
          insumoId: "ins18",
          quantidade: 150,
          custo: 6.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins18", nome: "Coco Ralado", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing16",
          receitaId: "rec6",
          insumoId: "ins10",
          quantidade: 50,
          custo: 2.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins10", nome: "Castanha do Pará", unidadeMedida: { sigla: "g" } }
        }
      ]
    },

    // ACOMPANHAMENTOS
    {
      id: "rec7",
      nome: "Farofa de Tapioca Doce",
      descricao: "Farofa crocante de tapioca com canela e açúcar mascavo",
      categoriaId: "cat5",
      categoria: { id: "cat5", nome: "Acompanhamentos", cor: "#8b5cf6", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 300,
      custoPorGrama: 0.020,
      custoTotal: 6.00,
      tempoPreparo: 8,
      instrucoes: "1. Torre a tapioca em frigideira seca\n2. Adicione canela em pó\n3. Incorpore o açúcar mascavo\n4. Mexa até dourar uniformemente\n5. Reserve em temperatura ambiente",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing8",
          receitaId: "rec7",
          insumoId: "ins12",
          quantidade: 250,
          custo: 4.50,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins12", nome: "Tapioca Granulada", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing9",
          receitaId: "rec7",
          insumoId: "ins13",
          quantidade: 5,
          custo: 1.50,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins13", nome: "Canela em Pó", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec8",
      nome: "Crumble de Biscoito",
      descricao: "Farofa crocante de biscoito tipo cookies",
      categoriaId: "cat5",
      categoria: { id: "cat5", nome: "Acompanhamentos", cor: "#8b5cf6", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 250,
      custoPorGrama: 0.040,
      custoTotal: 10.00,
      tempoPreparo: 12,
      instrucoes: "1. Triture os biscoitos até formar farelos grossos\n2. Misture com a manteiga derretida\n3. Torre em frigideira até dourar\n4. Deixe esfriar completamente\n5. Armazene em recipiente hermético",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing17",
          receitaId: "rec8",
          insumoId: "ins19",
          quantidade: 200,
          custo: 8.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins19", nome: "Biscoito Maisena", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing18",
          receitaId: "rec8",
          insumoId: "ins20",
          quantidade: 30,
          custo: 2.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins20", nome: "Manteiga", unidadeMedida: { sigla: "g" } }
        }
      ]
    },

    // FRUTAS PREPARADAS
    {
      id: "rec9",
      nome: "Banana Caramelizada",
      descricao: "Bananas em fatias douradas no açúcar mascavo",
      categoriaId: "cat6",
      categoria: { id: "cat6", nome: "Frutas", cor: "#ef4444", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 400,
      custoPorGrama: 0.035,
      custoTotal: 14.00,
      tempoPreparo: 15,
      instrucoes: "1. Descasque e corte as bananas em rodelas\n2. Aqueça uma frigideira com manteiga\n3. Adicione o açúcar mascavo\n4. Coloque as bananas quando caramelizar\n5. Cozinhe até dourar dos dois lados",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing19",
          receitaId: "rec9",
          insumoId: "ins21",
          quantidade: 300,
          custo: 9.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins21", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing20",
          receitaId: "rec9",
          insumoId: "ins22",
          quantidade: 50,
          custo: 3.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins22", nome: "Açúcar Mascavo", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing21",
          receitaId: "rec9",
          insumoId: "ins20",
          quantidade: 20,
          custo: 2.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins20", nome: "Manteiga", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "rec10",
      nome: "Compota de Frutas Vermelhas",
      descricao: "Mistura doce de morangos, framboesas e cerejas",
      categoriaId: "cat6",
      categoria: { id: "cat6", nome: "Frutas", cor: "#ef4444", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 500,
      custoPorGrama: 0.048,
      custoTotal: 24.00,
      tempoPreparo: 40,
      instrucoes: "1. Lave e corte todas as frutas\n2. Leve ao fogo com açúcar cristal\n3. Cozinhe em fogo baixo mexendo sempre\n4. Adicione suco de limão\n5. Cozinhe até consistência de geleia\n6. Deixe esfriar antes de armazenar",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing22",
          receitaId: "rec10",
          insumoId: "ins6",
          quantidade: 200,
          custo: 12.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins6", nome: "Morango Fresco", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing23",
          receitaId: "rec10",
          insumoId: "ins23",
          quantidade: 150,
          custo: 9.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins23", nome: "Framboesa", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing24",
          receitaId: "rec10",
          insumoId: "ins7",
          quantidade: 100,
          custo: 3.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins7", nome: "Açúcar Cristal", unidadeMedida: { sigla: "g" } }
        }
      ]
    },

    // RECEITA INATIVA PARA TESTE
    {
      id: "rec11",
      nome: "Molho de Amendoim (Descontinuado)",
      descricao: "Creme cremoso de amendoim - produto descontinuado",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Molhos", cor: "#f59e0b", ativo: true, createdAt: new Date(), updatedAt: new Date() },
      rendimento: 300,
      custoPorGrama: 0.055,
      custoTotal: 16.50,
      tempoPreparo: 18,
      instrucoes: "Produto descontinuado - não produzir",
      ativo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredientes: [
        {
          id: "ing25",
          receitaId: "rec11",
          insumoId: "ins24",
          quantidade: 250,
          custo: 15.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins24", nome: "Pasta de Amendoim", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ing26",
          receitaId: "rec11",
          insumoId: "ins15",
          quantidade: 50,
          custo: 1.50,
          createdAt: new Date(),
          updatedAt: new Date(),
          insumo: { id: "ins15", nome: "Leite Condensado", unidadeMedida: { sigla: "g" } }
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
    setViewingReceita(receita);
    setViewModalOpen(true);
  };

  const handleDeleteReceita = async (receita: Receita) => {
    const ok = await confirm({
      title: "Excluir receita",
      description: `Tem certeza que deseja excluir "${receita.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      dispatch({ type: 'DELETE_RECEITA', payload: receita.id });
    }
  };

  // Usando definições do topo (availableColors e availableIcons já declarados)


  // Usando funções do topo (sem duplicação)

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
            {formatarCustoPorUnidade(receita.custoPorGrama)}
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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCategoriesModalOpen(true)}
              className="flex items-center gap-2"
              title="Gerenciar categorias de receitas"
            >
              <Settings className="w-4 h-4" />
              Gerenciar Categorias
            </Button>
            <Button onClick={handleNewReceita} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Receita
            </Button>
          </div>
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
                      <React.Fragment key={`group-${group.categoria.id}`}>
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
                      </React.Fragment>
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
        </div>
      </div>

      <ReceitaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        receita={editingReceita}
        onOpenCategoriesModal={() => setCategoriesModalOpen(true)}
      />

      {/* Modal de Visualização Aprimorado */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-6 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  {viewingReceita?.nome}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {viewingReceita?.descricao || "Receita para preparo"}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={viewingReceita?.ativo ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {viewingReceita?.ativo ? "✓ Ativa" : "⊘ Inativa"}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {viewingReceita?.categoria?.nome || "Sem categoria"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {viewingReceita && (
            <div className="flex flex-col h-full max-h-[75vh] overflow-hidden">
              {/* Métricas Principais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-green-700">Rendimento</CardDescription>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-green-800">
                      {viewingReceita.rendimento}g
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-blue-700">Custo Total</CardDescription>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-blue-800">
                      {formatarMoeda(viewingReceita.custoTotal)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-purple-700">Custo por Grama</CardDescription>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-purple-800">
                      {formatarCustoPorUnidade(viewingReceita.custoPorGrama)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-orange-700">Tempo Preparo</CardDescription>
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-orange-800">
                      {viewingReceita.tempoPreparo || 0}min
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Conteúdo Principal com Scroll */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Análise de Custos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      Análise de Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800">
                          {viewingReceita.ingredientes?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Ingredientes</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">
                          {formatarPorcentagem((viewingReceita.custoTotal / (viewingReceita.rendimento / 100)) || 0)}
                        </div>
                        <div className="text-sm text-blue-600">Custo por 100g</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-800">
                          {formatarMoeda((viewingReceita.custoTotal * 3) || 0)}
                        </div>
                        <div className="text-sm text-green-600">Preço Sugerido (3x)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Ingredientes Detalhada */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-600" />
                      Ingredientes e Custos
                    </CardTitle>
                    <CardDescription>
                      Composição detalhada da receita com análise de custos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {viewingReceita.ingredientes?.map((ingrediente, index) => {
                        // Buscar dados do insumo no state para ter informações completas
                        const insumo = state.insumos.find(i => i.id === ingrediente.insumoId);
                        const percentualCusto = viewingReceita.custoTotal > 0
                          ? (ingrediente.custo / viewingReceita.custoTotal * 100)
                          : 0;

                        return (
                          <div key={ingrediente.id} className="group hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-semibold text-gray-800">
                                    {insumo?.nome || ingrediente.insumo?.nome || `Ingrediente ${index + 1}`}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {insumo?.descricao || "Ingrediente da receita"}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs">
                                      {insumo?.categoria?.nome || "Sem categoria"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Quantidade</div>
                                    <div className="font-semibold">
                                      {ingrediente.quantidade}{insumo?.unidadeMedida?.sigla || ingrediente.insumo?.unidadeMedida?.sigla || 'g'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Custo</div>
                                    <div className="font-bold text-green-700">
                                      {formatarMoeda(ingrediente.custo)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">% do Total</div>
                                    <div className="font-semibold text-blue-700">
                                      {formatarPorcentagem(percentualCusto)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Totalizador */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Calculator className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">Custo Total da Receita</div>
                              <div className="text-sm text-gray-600">
                                {viewingReceita.rendimento}g • {formatarCustoPorUnidade(viewingReceita.custoPorGrama)}/g
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">
                              {formatarMoeda(viewingReceita.custoTotal)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Total dos ingredientes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instruções de Preparo */}
                {viewingReceita.instrucoes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-orange-600" />
                        Instruções de Preparo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
                          {viewingReceita.instrucoes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informações Adicionais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      Informações Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Categoria:</span>
                        <Badge variant="outline" className="ml-2">
                          {viewingReceita.categoria?.nome || "Sem categoria"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={viewingReceita.ativo ? "default" : "secondary"} className="ml-2">
                          {viewingReceita.ativo ? "✓ Ativa" : "⊘ Inativa"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Criada em:</span>
                        <span className="ml-2 font-medium">
                          {new Date(viewingReceita.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Última atualização:</span>
                        <span className="ml-2 font-medium">
                          {new Date(viewingReceita.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              Visualização detalhada da receita
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setViewModalOpen(false);
                  if (viewingReceita) {
                    handleEditReceita(viewingReceita);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Receita
              </Button>
            </div>
          </div>
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
                    placeholder="Ex: Sobremesas Premium"
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
                    const IconComponent = ChefHat; // Fallback icon
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
    </Layout>
  );
};

export default Receitas;