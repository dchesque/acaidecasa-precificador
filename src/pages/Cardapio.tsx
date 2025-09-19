"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarMoeda, formatarCustoPorUnidade, formatarPorcentagem } from "@/utils/calculations";
import {
  MenuSquare,
  Eye,
  Edit,
  Download,
  Upload,
  Trash2,
  Coffee,
  Cherry,
  Cake,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Plus,
  Check,
  X,
  Settings,
  GripVertical,
  Palette,
  ChevronLeft,
  ChevronRight,
  Apple,
  Banana,
  Cookie,
  Pizza,
  Salad,
  Sandwich,
  IceCream,
  Milk,
  Wine,
  Zap,
  Heart,
  Star,
  Flame,
  Sparkles,
  Crown,
  Gift,
  Target,
  AlertTriangle,
  TrendingDown,
  Calculator,
  Users,
  Tag,
  BarChart3,
  Info,
  FileText,
  Search,
  Link,
  Building2
} from "lucide-react";

const Cardapio = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Estados para edição
  const [editItemId, setEditItemId] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [editItemType, setEditItemType] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("");
  const [editItemUnit, setEditItemUnit] = useState("");
  const [editSelectedItem, setEditSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarPrecos, setMostrarPrecos] = useState(true);
  const [mostrarCustos, setMostrarCustos] = useState(true);
  const [mostrarMargens, setMostrarMargens] = useState(false);
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");
  const [simulacaoPrecos, setSimulacaoPrecos] = useState<{[key: string]: string}>({});
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
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
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [selectedItemCategory, setSelectedItemCategory] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [selectedSearchItem, setSelectedSearchItem] = useState<any>(null);
  const [itemSearchFilter, setItemSearchFilter] = useState("");
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");

  const handleSimulacaoChange = (itemNome: string, valor: string) => {
    setSimulacaoPrecos(prev => ({ ...prev, [itemNome]: valor }));
  };

  const calcularMargemSimulacao = (custoOriginal: number, novoPreco: number) => {
    if (!novoPreco || novoPreco <= 0) return 0;
    return ((novoPreco - custoOriginal) / custoOriginal) * 100;
  };

  // Função melhorada para calcular margem com validações
  const calcularMargem = (precoVenda: number, custoTotal: number) => {
    if (!precoVenda || !custoTotal || precoVenda <= 0 || custoTotal <= 0) return 0;
    return ((precoVenda - custoTotal) / custoTotal) * 100;
  };

  // Função para determinar cor da margem baseada no valor
  const getMargemColor = (margem: number) => {
    if (margem < 0) return "text-red-600"; // Prejuízo
    if (margem < 50) return "text-orange-600"; // Margem baixa
    if (margem < 100) return "text-yellow-600"; // Margem média
    return "text-green-600"; // Margem boa
  };

  // Função para classificar a margem
  const getMargemClassificacao = (margem: number) => {
    if (margem < 0) return "PREJUÍZO";
    if (margem < 50) return "BAIXA";
    if (margem < 100) return "MÉDIA";
    if (margem < 200) return "BOA";
    return "EXCELENTE";
  };

  // Função para converter unidades corretamente
  const calcularCustoComQuantidade = (item: any, quantidade: number, tipoItem: string) => {
    if (!item || !quantidade) return 0;

    // Para insumos, usar multiplicação direta na unidade original
    // Exemplo: 0.2 kg × R$ 3.20/kg = R$ 0.64
    return item.custo * quantidade;
  };

  const handleEditPrice = (itemNome: string, precoAtual: number) => {
    setEditingPrice(itemNome);
    setTempPrice(precoAtual.toString());
  };

  const handleSavePrice = (itemNome: string) => {
    const novoPreco = parseFloat(tempPrice);
    if (novoPreco && novoPreco > 0) {
      setManagedCategorias(prev =>
        prev.map(categoria => ({
          ...categoria,
          itens: categoria.itens.map(item =>
            item.nome === itemNome
              ? { ...item, preco: novoPreco, margem: ((novoPreco - item.custo) / item.custo) * 100 }
              : item
          )
        }))
      );
    }

    // Reset dos estados de edição
    setEditingPrice(null);
    setTempPrice("");
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setTempPrice("");
  };

  const getFornecedorDisplay = (item: any) => {
    if (item.fornecedor) {
      return { texto: item.fornecedor, cor: "text-blue-600", fundo: "bg-blue-50 border-blue-200" };
    }
    if (item.tipo === "receita" || item.tipo === "copo-base" || item.tipo === "combinado") {
      return { texto: "Produção Própria", cor: "text-green-600", fundo: "bg-green-50 border-green-200" };
    }
    return { texto: "Não definido", cor: "text-gray-600", fundo: "bg-gray-50 border-gray-200" };
  };

  const categorias = [
    {
      id: "tradicional",
      nome: "Açaí Tradicional",
      descricao: "Clássicos que todos amam",
      icon: Coffee,
      cor: "#8B5CF6",
      corBg: "#F3E8FF",
      itens: [
        { id: "001", nome: "Açaí 300ml", preco: 12.90, custo: 5.80, margem: 122.4, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "300ml", unidade: "ml", descricao: "Açaí tradicional cremoso", observacoes: "Servir bem gelado" },
        { id: "002", nome: "Açaí 500ml", preco: 18.90, custo: 8.50, margem: 122.4, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "500ml", unidade: "ml", descricao: "Açaí tradicional cremoso tamanho grande" },
        { id: "003", nome: "Açaí 1L", preco: 32.90, custo: 15.20, margem: 116.4, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "1000ml", unidade: "ml", descricao: "Açaí tradicional cremoso para compartilhar" },
        { id: "011", nome: "Açaí com Granola 400ml", preco: 15.90, custo: 7.90, margem: 101.3, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "400ml", unidade: "ml", descricao: "Açaí com granola crocante" }
      ]
    },
    {
      id: "premium",
      nome: "Açaí Premium",
      descricao: "Experiências gourmet exclusivas",
      icon: Cherry,
      cor: "#EC4899",
      corBg: "#FCE7F3",
      itens: [
        { id: "004", nome: "Açaí Gourmet 300ml", preco: 16.90, custo: 7.20, margem: 134.7, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "300ml", unidade: "ml", descricao: "Açaí premium com ingredientes gourmet", observacoes: "Produto premium" },
        { id: "005", nome: "Açaí Gourmet 500ml", preco: 24.90, custo: 11.50, margem: 116.5, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "500ml", unidade: "ml", descricao: "Açaí premium tamanho grande" },
        { id: "012", nome: "Açaí Orgânico 300ml", preco: 19.90, custo: 9.50, margem: 109.5, disponivel: true, tipo: "receita", fornecedor: "Açaí Orgânico Ltda", itemReferencia: "REC001", rendimento: "300ml", unidade: "ml", descricao: "Açaí 100% orgânico certificado" },
        { id: "013", nome: "Açaí com Frutas Vermelhas", preco: 22.90, custo: 12.80, margem: 78.9, disponivel: false, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "350ml", unidade: "ml", descricao: "Açaí com mix de frutas vermelhas", observacoes: "Temporariamente indisponível" }
      ]
    },
    {
      id: "combinados",
      nome: "Combinados",
      descricao: "Combinações perfeitas",
      icon: Package,
      cor: "#10B981",
      corBg: "#D1FAE5",
      itens: [
        { id: "006", nome: "Açaí Completo 500ml", preco: 22.90, custo: 10.75, margem: 113.0, disponivel: true, tipo: "combinado", fornecedor: null, itemReferencia: "COM001", rendimento: "500ml", unidade: "ml", descricao: "Açaí completo com todos os acompanhamentos", observacoes: "Nosso mais vendido" },
        { id: "007", nome: "Açaí Fitness 300ml", preco: 18.50, custo: 8.20, margem: 125.6, disponivel: true, tipo: "combinado", fornecedor: null, itemReferencia: "COM002", rendimento: "300ml", unidade: "ml", descricao: "Açaí fitness com ingredientes saudáveis" },
        { id: "008", nome: "Açaí Kids 200ml", preco: 12.90, custo: 5.90, margem: 118.6, disponivel: false, tipo: "combinado", fornecedor: null, itemReferencia: "COM001", rendimento: "200ml", unidade: "ml", descricao: "Açaí especial para crianças", observacoes: "Temporariamente indisponível" },
        { id: "014", nome: "Super Açaí 700ml", preco: 28.90, custo: 14.20, margem: 103.5, disponivel: true, tipo: "combinado", fornecedor: null, itemReferencia: "COM001", rendimento: "700ml", unidade: "ml", descricao: "Super açaí com porção extra" }
      ]
    },
    {
      id: "sobremesas",
      nome: "Sobremesas",
      descricao: "Doces irresistíveis",
      icon: Cake,
      cor: "#F59E0B",
      corBg: "#FEF3C7",
      itens: [
        { id: "009", nome: "Torta de Açaí", preco: 8.90, custo: 3.50, margem: 154.3, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "1un", unidade: "un", descricao: "Deliciosa torta gelada de açaí" },
        { id: "010", nome: "Sorvete de Açaí", preco: 6.90, custo: 2.80, margem: 146.4, disponivel: true, tipo: "receita", fornecedor: "Gelatos & Cia", itemReferencia: "REC001", rendimento: "100ml", unidade: "ml", descricao: "Sorvete cremoso de açaí artesanal" },
        { id: "015", nome: "Mousse de Açaí", preco: 7.50, custo: 4.20, margem: 78.6, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC001", rendimento: "150ml", unidade: "ml", descricao: "Mousse aerado de açaí" },
        { id: "016", nome: "Paleta de Açaí", preco: 5.90, custo: 6.50, margem: -9.2, disponivel: true, tipo: "receita", fornecedor: "Paletas Artesanais", itemReferencia: "REC001", rendimento: "1un", unidade: "un", descricao: "Paleta gelada de açaí natural", observacoes: "Margem negativa - revisar preço" },
        { id: "017", nome: "Smoothie Açaí + Banana", preco: 8.50, custo: 4.20, margem: 102.4, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "400ml", unidade: "ml", descricao: "Smoothie cremoso natural" },
        { id: "018", nome: "Bowl Fitness", preco: 15.90, custo: 8.50, margem: 87.1, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC003", rendimento: "350g", unidade: "g", descricao: "Açaí com toppings fitness" },
        { id: "019", nome: "Vitamina Energética", preco: 12.50, custo: 5.80, margem: 115.5, disponivel: false, tipo: "receita", fornecedor: null, itemReferencia: "REC004", rendimento: "500ml", unidade: "ml", descricao: "Vitamina com guaraná natural", observacoes: "Temporariamente indisponível" }
      ]
    },
    {
      id: "bebidas",
      nome: "Bebidas",
      descricao: "Refrescantes e saudáveis",
      icon: Coffee,
      cor: "#3B82F6",
      corBg: "#DBEAFE",
      itens: [
        { id: "017", nome: "Smoothie de Açaí 400ml", preco: 14.90, custo: 6.80, margem: 119.1, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "400ml", unidade: "ml", descricao: "Smoothie cremoso e nutritivo" },
        { id: "018", nome: "Suco de Açaí 300ml", preco: 9.90, custo: 4.20, margem: 135.7, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "300ml", unidade: "ml", descricao: "Suco natural de açaí puro" },
        { id: "019", nome: "Água Saborizada Açaí", preco: 4.50, custo: 1.80, margem: 150.0, disponivel: true, tipo: "receita", fornecedor: "AquaSabor", itemReferencia: "REC002", rendimento: "500ml", unidade: "ml", descricao: "Água mineral com sabor de açaí" },
        { id: "020", nome: "Vitamina de Açaí 500ml", preco: 12.90, custo: 5.50, margem: 134.5, disponivel: true, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "500ml", unidade: "ml", descricao: "Vitamina energizante com açaí" },
        { id: "021", nome: "Frappé de Açaí 350ml", preco: 16.90, custo: 7.80, margem: 116.7, disponivel: false, tipo: "receita", fornecedor: null, itemReferencia: "REC002", rendimento: "350ml", unidade: "ml", descricao: "Frappé gelado com gelo e açaí", observacoes: "Disponível apenas no verão" }
      ]
    },
    {
      id: "insumos-bases",
      nome: "Insumos & Bases",
      descricao: "Ingredientes e bases para produção",
      icon: Package,
      cor: "#6B7280",
      corBg: "#F9FAFB",
      itens: [
        { id: "I001", nome: "Açaí Premium (1kg)", preco: 12.50, custo: 12.50, margem: 0, disponivel: true, tipo: "insumo", fornecedor: "Amazônia Açaí Ltda", itemReferencia: "INS001", unidade: "g", descricao: "Açaí premium congelado", quantidade: 1000 },
        { id: "I002", nome: "Banana Prata (1kg)", preco: 3.20, custo: 3.20, margem: 0, disponivel: true, tipo: "insumo", fornecedor: "Frutas do Vale", itemReferencia: "INS002", unidade: "g", descricao: "Banana prata fresca selecionada", quantidade: 1000 },
        { id: "I003", nome: "Granola Premium (500g)", preco: 12.00, custo: 8.50, margem: 41.2, disponivel: true, tipo: "insumo", fornecedor: "Cereais da Terra", itemReferencia: "INS003", unidade: "g", descricao: "Granola artesanal com frutas", quantidade: 500 },
        { id: "I004", nome: "Mel Silvestre (250ml)", preco: 18.00, custo: 12.00, margem: 50.0, disponivel: true, tipo: "insumo", fornecedor: "Apiário Dourado", itemReferencia: "INS004", unidade: "ml", descricao: "Mel puro de abelhas silvestres", quantidade: 250 },
        { id: "I005", nome: "Leite Condensado (395g)", preco: 4.20, custo: 4.20, margem: 0, disponivel: false, tipo: "insumo", fornecedor: "Laticínios São João", itemReferencia: "INS005", unidade: "g", descricao: "Leite condensado tradicional", quantidade: 395 },
        { id: "CB01", nome: "Base 300ml Premium", preco: 4.50, custo: 4.50, margem: 0, disponivel: true, tipo: "copo-base", fornecedor: null, itemReferencia: "CB001", unidade: "un", descricao: "Base pronta de 300ml" },
        { id: "CB02", nome: "Base 500ml Tradicional", preco: 6.20, custo: 6.20, margem: 0, disponivel: true, tipo: "copo-base", fornecedor: null, itemReferencia: "CB002", unidade: "un", descricao: "Base pronta de 500ml", quantidade: 1 },
        { id: "CB03", nome: "Base 700ml Família", preco: 8.90, custo: 7.50, margem: 18.7, disponivel: true, tipo: "copo-base", fornecedor: null, itemReferencia: "CB003", unidade: "un", descricao: "Base pronta tamanho família", quantidade: 1 }
      ]
    }
  ];

  // Estado para categorias gerenciadas - deve vir após a declaração de categorias
  const [managedCategorias, setManagedCategorias] = useState(categorias);

  const handleViewItem = (item: any) => {
    // Se for copo-base, buscar a composição do mockData
    if (item.tipo === "copo-base") {
      const copoBaseData = mockData["copo-base"].find(cb => cb.id === item.itemReferencia);
      if (copoBaseData) {
        setSelectedItem({
          ...item,
          composicao: copoBaseData.composicao
        });
      } else {
        setSelectedItem(item);
      }
    } else if (item.tipo === "combinado") {
      // Se for combinado, buscar a composição do mockData
      const combinadoData = mockData["combinado"].find(c => c.id === item.itemReferencia);
      if (combinadoData) {
        setSelectedItem({
          ...item,
          composicao: combinadoData.composicao
        });
      } else {
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(item);
    }
    setViewModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);

    // Preencher campos automaticamente com dados do item
    setItemId(item.id || "");
    setItemName(item.nome || "");
    setItemPrice(item.preco?.toString() || "");
    setItemNotes("");

    // Definir categoria atual
    const categoriaAtual = managedCategorias.find(cat => cat.nome === item.categoria);
    setSelectedItemCategory(categoriaAtual?.nome || "");

    // Definir tipo baseado no item existente
    setSelectedItemType(item.tipo || "receita");

    // Se tiver referência a um item base, buscar e preencher
    if (item.itemReferencia) {
      const itemTipo = item.tipo || "receita";
      const itemBase = mockData[itemTipo as keyof typeof mockData]?.find(i => i.id === item.itemReferencia);
      if (itemBase) {
        setSelectedSearchItem(itemBase);
        setItemQuantity(item.quantidade?.toString() || "");
      }
    } else {
      setSelectedSearchItem(null);
      setItemQuantity("");
    }

    setEditModalOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const resetEditForm = () => {
    setEditItemId("");
    setEditItemName("");
    setEditItemPrice("");
    setEditItemNotes("");
    setEditItemCategory("");
    setEditItemType("");
    setEditItemQuantity("");
    setEditItemUnit("");
    setEditSelectedItem(null);
  };

  const resetNewItemForm = () => {
    setItemId("");
    setItemName("");
    setItemPrice("");
    setItemNotes("");
    setItemQuantity("");
    setSelectedItemCategory("");
    setSelectedItemType("");
    setSelectedSearchItem(null);
    setItemSearchFilter("");
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setManagedCategorias(prev =>
        prev.map(categoria => ({
          ...categoria,
          itens: categoria.itens.filter(item => item.id !== selectedItem.id)
        }))
      );
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const availableIcons = [
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
    { name: "Zap", icon: Zap },
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

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    // Verificar se já existe uma categoria com esse nome
    const categoryExists = managedCategorias.some(cat =>
      cat.nome.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (categoryExists) {
      console.log("❌ Já existe uma categoria com esse nome:", newCategoryName.trim());
      return;
    }

    const iconComponent = availableIcons.find(icon => icon.name === newCategoryIcon)?.icon || Package;

    const newCategory = {
      id: `categoria-${Date.now()}`,
      nome: newCategoryName.trim(),
      descricao: `Categoria ${newCategoryName.trim()}`,
      icon: iconComponent,
      cor: newCategoryColor,
      corBg: newCategoryColor + "20",
      itens: []
    };

    setManagedCategorias(prev => [...prev, newCategory]);

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("Package");
    setNewCategoryColor("#8B5CF6");

    // Feedback visual de sucesso
    console.log("✅ Categoria criada com sucesso:", newCategory.nome);
  };

  const handleEditCategory = (categoryId: string) => {
    const categoria = managedCategorias.find(cat => cat.id === categoryId);
    if (categoria) {
      setEditingCategory(categoryId);
      setEditCategoryName(categoria.nome);
      const iconName = availableIcons.find(icon => icon.icon === categoria.icon)?.name || "Package";
      setEditCategoryIcon(iconName);
      setEditCategoryColor(categoria.cor);
    }
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const iconComponent = availableIcons.find(icon => icon.name === editCategoryIcon)?.icon || Package;

    setManagedCategorias(prev => prev.map(cat =>
      cat.id === editingCategory
        ? {
            ...cat,
            nome: editCategoryName.trim(),
            icon: iconComponent,
            cor: editCategoryColor,
            corBg: editCategoryColor + "20"
          }
        : cat
    ));

    console.log("✅ Categoria editada com sucesso:", editCategoryName.trim());

    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Package");
    setEditCategoryColor("#8B5CF6");
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryIcon("Package");
    setEditCategoryColor("#8B5CF6");
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoria = managedCategorias.find(cat => cat.id === categoryId);
    setManagedCategorias(prev => prev.filter(cat => cat.id !== categoryId));
    console.log("🗑️ Categoria excluída:", categoria?.nome);
  };

  const moveCategory = (fromIndex: number, toIndex: number) => {
    setManagedCategorias(prev => {
      const newArray = [...prev];
      const [movedItem] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, movedItem);
      console.log("🔄 Categoria reordenada:", movedItem.nome, `de posição ${fromIndex} para ${toIndex}`);
      return newArray;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveCategory(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Configurações para rolagem
  const iconsPerView = 5;
  const colorsPerView = 8;

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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Título do documento
    doc.setFontSize(18);
    doc.text('Cardápio - Açaí de Casa', 14, 22);

    // Data da exportação
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    let currentY = 40;

    managedCategorias.forEach((categoria, categoriaIndex) => {
      // Filtrar itens da categoria
      const itensCategoria = categoria.itens.filter(item => !apenasDisponiveis || item.disponivel);

      if (itensCategoria.length === 0) return;

      // Verificar se precisa de nova página
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Título da categoria
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(categoria.nome, 14, currentY);
      currentY += 10;

      // Preparar dados da categoria
      const tableData = itensCategoria.map(item => [
        (item as any).codigo || item.id || '-',
        item.nome,
        formatarMoeda(item.preco)
      ]);

      // Criar tabela para esta categoria
      autoTable(doc, {
        head: [['Código', 'Item', 'Preço de Venda']],
        body: tableData,
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10, bottom: 10 }
      });

      // Atualizar posição Y para próxima categoria
      currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    // Salvar o PDF
    doc.save('cardapio-acai-de-casa.pdf');
  };

  const visibleIcons = availableIcons.slice(iconScrollIndex, iconScrollIndex + iconsPerView);
  const visibleColors = availableColors.slice(colorScrollIndex, colorScrollIndex + colorsPerView);

  // Tipos de itens
  const itemTypes = [
    { value: "insumo", label: "Insumo" },
    { value: "copo-base", label: "Copo Base" },
    { value: "combinado", label: "Combinado" },
    { value: "receita", label: "Receita" }
  ];

  // Dados mockados para os tipos
  const mockData = {
    insumo: [
      {
        id: "INS001",
        nome: "Açaí Premium",
        custo: 0.0125, // R$ 0.0125 por grama (R$ 12.50/kg convertido)
        fornecedorPadrao: "Amazônia Açaí Ltda",
        descricao: "Açaí premium de alta qualidade",
        unidade: "g"
      },
      {
        id: "INS002",
        nome: "Banana Prata",
        custo: 0.0032, // R$ 0.0032 por grama (R$ 3.20/kg convertido)
        fornecedorPadrao: "Frutas do Vale",
        descricao: "Banana prata fresca",
        unidade: "g"
      },
      {
        id: "INS003",
        nome: "Granola Artesanal",
        custo: 0.0089, // R$ 0.0089 por grama (R$ 8.90/kg convertido)
        fornecedorPadrao: "Cereais & Grãos",
        descricao: "Granola artesanal sem conservantes",
        unidade: "g"
      },
      {
        id: "INS004",
        nome: "Mel Orgânico",
        custo: 0.0155, // R$ 0.0155 por grama (R$ 15.50/kg convertido)
        fornecedorPadrao: "Apiário Dourado",
        descricao: "Mel orgânico puro",
        unidade: "g"
      },
      {
        id: "INS005",
        nome: "Aveia em Flocos",
        custo: 0.0048, // R$ 0.0048 por grama (R$ 4.80/kg convertido)
        fornecedorPadrao: "Cereais & Grãos",
        descricao: "Aveia em flocos finos",
        unidade: "g"
      },
      {
        id: "INS006",
        nome: "Morango",
        custo: 0.0065, // R$ 0.0065 por grama (R$ 6.50/kg convertido)
        fornecedorPadrao: "Frutas Frescas",
        descricao: "Morango fresco selecionado",
        unidade: "g",
        disponivel: true
      },
      {
        id: "INS007",
        nome: "Castanha-do-Pará",
        custo: 0.0320, // R$ 0.032 por grama (R$ 32.00/kg convertido)
        fornecedorPadrao: "Nuts & Castanhas",
        descricao: "Castanha-do-Pará premium",
        unidade: "g",
        disponivel: true
      }
    ],
    "copo-base": [
      {
        id: "CB001",
        nome: "Copo 300ml Premium",
        custo: 4.50,
        descricao: "Base premium de 300ml",
        composicao: [
          {
            insumo: {
              id: "INS001",
              nome: "Açaí Premium",
              fornecedorPadrao: "Amazônia Açaí Ltda"
            },
            quantidade: "200g",
            custo: 8.33
          },
          {
            insumo: {
              id: "INS002",
              nome: "Banana Prata",
              fornecedorPadrao: "Frutas do Vale"
            },
            quantidade: "50g",
            custo: 0.80
          }
        ]
      },
      {
        id: "CB002",
        nome: "Copo 500ml Tradicional",
        custo: 6.20,
        descricao: "Base tradicional de 500ml",
        composicao: [
          {
            insumo: {
              id: "INS001",
              nome: "Açaí Premium",
              fornecedorPadrao: "Amazônia Açaí Ltda"
            },
            quantidade: "350g",
            custo: 10.50
          },
          {
            insumo: {
              id: "INS002",
              nome: "Banana Prata",
              fornecedorPadrao: "Frutas do Vale"
            },
            quantidade: "70g",
            custo: 1.12
          }
        ]
      },
      {
        id: "CB003",
        nome: "Copo 700ml Família",
        custo: 8.90,
        descricao: "Base familiar de 700ml",
        composicao: [
          {
            insumo: {
              id: "INS001",
              nome: "Açaí Premium",
              fornecedorPadrao: "Amazônia Açaí Ltda"
            },
            quantidade: "500g",
            custo: 15.00
          },
          {
            insumo: {
              id: "INS002",
              nome: "Banana Prata",
              fornecedorPadrao: "Frutas do Vale"
            },
            quantidade: "100g",
            custo: 1.60
          },
          {
            insumo: {
              id: "INS006",
              nome: "Morango",
              fornecedorPadrao: "Frutas Frescas"
            },
            quantidade: "50g",
            custo: 0.80
          }
        ]
      }
    ],
    combinado: [
      {
        id: "COM001",
        nome: "Açaí Completo",
        custo: 15.80,
        descricao: "Açaí completo com todos os acompanhamentos",
        composicao: [
          {
            insumo: {
              id: "CB001",
              nome: "Copo 300ml Premium",
              fornecedorPadrao: "Produção Própria"
            },
            quantidade: "1un",
            custo: 4.50
          },
          {
            insumo: {
              id: "INS003",
              nome: "Granola Artesanal",
              fornecedorPadrao: "Cereais & Grãos"
            },
            quantidade: "30g",
            custo: 2.67
          },
          {
            insumo: {
              id: "INS004",
              nome: "Mel Orgânico",
              fornecedorPadrao: "Apiário Dourado"
            },
            quantidade: "15g",
            custo: 1.20
          }
        ]
      },
      {
        id: "COM002",
        nome: "Açaí Fitness",
        custo: 12.30,
        descricao: "Açaí fitness com ingredientes saudáveis",
        composicao: [
          {
            insumo: {
              id: "CB001",
              nome: "Copo 300ml Premium",
              fornecedorPadrao: "Produção Própria"
            },
            quantidade: "1un",
            custo: 4.50
          },
          {
            insumo: {
              id: "INS005",
              nome: "Aveia em Flocos",
              fornecedorPadrao: "Cereais & Grãos"
            },
            quantidade: "20g",
            custo: 1.80
          }
        ]
      },
      {
        id: "COM003",
        nome: "Açaí Premium",
        custo: 18.50,
        descricao: "Açaí premium com castanhas e frutas",
        composicao: [
          {
            insumo: {
              id: "CB002",
              nome: "Copo 500ml Tradicional",
              fornecedorPadrao: "Produção Própria"
            },
            quantidade: "1un",
            custo: 6.20
          },
          {
            insumo: {
              id: "INS006",
              nome: "Morango",
              fornecedorPadrao: "Frutas Frescas"
            },
            quantidade: "40g",
            custo: 2.60
          },
          {
            insumo: {
              id: "INS007",
              nome: "Castanha-do-Pará",
              fornecedorPadrao: "Nuts & Castanhas"
            },
            quantidade: "15g",
            custo: 4.80
          },
          {
            insumo: {
              id: "INS003",
              nome: "Granola Artesanal",
              fornecedorPadrao: "Cereais & Grãos"
            },
            quantidade: "25g",
            custo: 2.22
          }
        ]
      }
    ],
    receita: [
      {
        id: "REC001",
        nome: "Açaí da Casa",
        custo: 0.0178, // R$ 0.0178 por grama (R$ 17.80/kg convertido)
        fornecedorPadrao: "Produção Própria",
        descricao: "Receita especial da casa",
        rendimento: "500ml",
        unidade: "g"
      },
      {
        id: "REC002",
        nome: "Smoothie Verde",
        custo: 0.0144, // R$ 0.0144 por grama (R$ 14.40/kg convertido)
        fornecedorPadrao: "Produção Própria",
        descricao: "Smoothie verde nutritivo",
        rendimento: "500ml",
        unidade: "g"
      },
      {
        id: "REC003",
        nome: "Base Açaí Gourmet",
        custo: 0.0220, // R$ 0.022 por grama (R$ 22.00/kg convertido)
        fornecedorPadrao: "Produção Própria",
        descricao: "Base premium de açaí com frutas selecionadas",
        rendimento: "1000ml",
        unidade: "g",
        ingredientes: ["Açaí Premium 70%", "Banana Prata 20%", "Morango 10%"],
        tempoPreparo: "15min",
        temperaturaArmazenamento: "-18°C"
      }
    ]
  };

  // Aplicar filtros
  const filteredCategorias = managedCategorias.map(categoria => {
    let itensFilteredBySearch = categoria.itens;

    // Filtro por termo de busca
    if (searchTerm) {
      itensFilteredBySearch = categoria.itens.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.fornecedor && item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por disponibilidade
    if (apenasDisponiveis) {
      itensFilteredBySearch = itensFilteredBySearch.filter(item => item.disponivel);
    }

    return {
      ...categoria,
      itens: itensFilteredBySearch
    };
  }).filter(categoria => categoria.itens.length > 0); // Remove categorias vazias

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie seu cardápio completo
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4" />
              Exportar Cardápio
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setCategoriesModalOpen(true)}
            >
              <Settings className="w-4 h-4" />
              Categorias
            </Button>
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => setNewItemModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </Button>
          </div>
        </div>

        <div className="space-y-6">
            {/* KPIs Estratégicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const totalItens = managedCategorias.reduce((acc, cat) => acc + cat.itens.length, 0);

                // Top 3 itens mais rentáveis
                const todosItens = managedCategorias.flatMap(cat =>
                  cat.itens.map(item => ({ ...item, categoria: cat.nome }))
                );
                const topRentaveis = todosItens
                  .filter(item => item.disponivel)
                  .sort((a, b) => b.margem - a.margem)
                  .slice(0, 3);

                // Margem média
                const margemMedia = totalItens > 0 ?
                  todosItens.reduce((acc, item) => acc + item.margem, 0) / totalItens : 0;

                // Itens em risco
                const itensRisco = todosItens.filter(item =>
                  item.margem < 100 || !item.disponivel
                ).length;
                const itensMargemBaixa = todosItens.filter(item => item.margem < 100).length;
                const itensIndisponiveis = todosItens.filter(item => !item.disponivel).length;

                return (
                  <>
                    {/* 1. Top 3 Rentáveis */}
                    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500 bg-green-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div className="p-1 rounded-full bg-green-100 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                          </div>
                          <span className="text-green-700">Top 3 Rentáveis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1.5">
                          {topRentaveis.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                  {item.nome}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-green-600">
                                {formatarPorcentagem(item.margem)}
                              </div>
                            </div>
                          ))}
                        </div>
                        {topRentaveis.length === 0 && (
                          <p className="text-xs text-muted-foreground">Nenhum item disponível</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* 2. Margem Média */}
                    <Card className={`hover:shadow-md transition-all duration-300 border-l-4 ${
                      margemMedia >= 150 ? 'border-l-green-500 bg-green-50/50' :
                      margemMedia >= 100 ? 'border-l-yellow-500 bg-yellow-50/50' : 'border-l-red-500 bg-red-50/50'
                    }`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div className={`p-1 rounded-full ${
                            margemMedia >= 150 ? 'bg-green-100 text-green-600' :
                            margemMedia >= 100 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <Package className="w-3 h-3" />
                          </div>
                          <span className={
                            margemMedia >= 150 ? 'text-green-700' :
                            margemMedia >= 100 ? 'text-yellow-700' : 'text-red-700'
                          }>Margem Média</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className={`text-2xl font-bold ${
                            margemMedia >= 150 ? 'text-green-600' :
                            margemMedia >= 100 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formatarPorcentagem(margemMedia)}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            margemMedia >= 150 ? 'bg-green-100 text-green-700' :
                            margemMedia >= 100 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {margemMedia >= 150 ? 'EXCELENTE' :
                             margemMedia >= 100 ? 'BOA' : 'BAIXA'}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rentabilidade de {totalItens} itens
                        </p>
                      </CardContent>
                    </Card>

                    {/* 3. Quantidades */}
                    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500 bg-blue-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                            <ShoppingCart className="w-3 h-3" />
                          </div>
                          <span className="text-blue-700">Portfólio</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-600">
                            {totalItens}
                          </div>
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {managedCategorias.length} CATS
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalItens} itens no cardápio
                        </p>
                      </CardContent>
                    </Card>

                    {/* 4. Itens em Risco */}
                    <Card className={`hover:shadow-md transition-all duration-300 border-l-4 ${
                      itensMargemBaixa === 0 ? 'border-l-green-500 bg-green-50/50' :
                      itensMargemBaixa <= 2 ? 'border-l-yellow-500 bg-yellow-50/50' : 'border-l-red-500 bg-red-50/50'
                    }`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div className={`p-1 rounded-full ${
                            itensMargemBaixa === 0 ? 'bg-green-100 text-green-600' :
                            itensMargemBaixa <= 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <TrendingDown className="w-3 h-3" />
                          </div>
                          <span className={
                            itensMargemBaixa === 0 ? 'text-green-700' :
                            itensMargemBaixa <= 2 ? 'text-yellow-700' : 'text-red-700'
                          }>Margem Baixa</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className={`text-2xl font-bold ${
                            itensMargemBaixa === 0 ? 'text-green-600' :
                            itensMargemBaixa <= 2 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {itensMargemBaixa}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            itensMargemBaixa === 0 ? 'bg-green-100 text-green-700' :
                            itensMargemBaixa <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {itensMargemBaixa === 0 ? 'OK' :
                             itensMargemBaixa <= 2 ? 'ATENÇÃO' : 'CRÍTICO'}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {itensMargemBaixa === 0 ? 'Todas as margens OK' :
                           itensMargemBaixa === 1 ? 'item com margem &lt;100%' : 'itens com margem &lt;100%'}
                        </p>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>


            {/* Filtros e Controles */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <Input
                    placeholder="Buscar item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 max-w-md"
                  />
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="apenas-disponiveis"
                        checked={apenasDisponiveis}
                        onCheckedChange={setApenasDisponiveis}
                      />
                      <Label htmlFor="apenas-disponiveis" className="text-sm whitespace-nowrap">Apenas Disponíveis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mostrar-custos"
                        checked={mostrarCustos}
                        onCheckedChange={setMostrarCustos}
                      />
                      <Label htmlFor="mostrar-custos" className="text-sm whitespace-nowrap">Mostrar Custos</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "complete" ? "default" : "outline"}
                        onClick={() => setViewMode("complete")}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                      >
                        Visualização Completa
                      </Button>
                      <Button
                        variant={viewMode === "by-category" ? "default" : "outline"}
                        onClick={() => setViewMode("by-category")}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                      >
                        Por Categoria
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Itens do Cardápio */}
            {filteredCategorias.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MenuSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
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
                      <CardTitle>Lista Completa do Cardápio</CardTitle>
                      <CardDescription>
                        Todos os itens do cardápio em uma única visualização
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table className="border-0">
                        <TableHeader>
                          <TableRow className="border-b border-border/40">
                            <TableHead className="w-[5%] text-center py-3 text-xs font-medium text-muted-foreground">ID</TableHead>
                            <TableHead className="w-[18%] py-3 text-xs font-medium text-muted-foreground">Item</TableHead>
                            <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Categoria</TableHead>
                            {mostrarCustos && <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Custo</TableHead>}
                            <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Preço</TableHead>
                            <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Margem</TableHead>
                            <TableHead className="w-[15%] text-center py-3 text-xs font-medium text-muted-foreground">Simulação</TableHead>
                            <TableHead className="w-[15%] text-center py-3 text-xs font-medium text-muted-foreground">Ações</TableHead>
                            <TableHead className="w-[5%] text-center py-3 text-xs font-medium text-muted-foreground">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCategorias.flatMap(categoria =>
                            categoria.itens.map((item, itemIndex) => (
                              <TableRow
                                key={`${categoria.id}-${itemIndex}`}
                                className={`border-b border-border/30 hover:bg-muted/40 ${!item.disponivel ? 'opacity-50' : ''}`}
                              >
                                <TableCell className="text-center py-3">
                                  <span className="text-xs text-muted-foreground">{item.id}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="font-medium text-sm">{item.nome}</div>
                                  {(() => {
                                    const fornecedor = getFornecedorDisplay(item);
                                    return (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <Package className="w-2.5 h-2.5 text-muted-foreground" />
                                        <span className={`text-[10px] ${fornecedor.cor}`}>
                                          {fornecedor.texto}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                      borderColor: categoria.cor || '#E5E7EB',
                                      color: categoria.cor || '#374151'
                                    }}
                                  >
                                    {categoria.nome}
                                  </Badge>
                                </TableCell>
                                {mostrarCustos && (
                                  <TableCell className="text-center py-3">
                                    <span className="font-medium text-sm text-destructive">
                                      {formatarMoeda(item.custo)}
                                    </span>
                                  </TableCell>
                                )}
                                <TableCell className="text-center py-3">
                                  <div className="flex items-center gap-1 justify-center">
                                    {editingPrice === item.nome ? (
                                      <>
                                        <Input
                                          type="number"
                                          value={tempPrice}
                                          onChange={(e) => setTempPrice(e.target.value)}
                                          className="h-7 w-20 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          step="0.01"
                                          min="0"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                          onClick={() => handleSavePrice(item.nome)}
                                          title="Salvar"
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                          onClick={handleCancelEdit}
                                          title="Cancelar"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="font-medium text-sm text-primary">
                                          {formatarMoeda(item.preco)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                          onClick={() => handleEditPrice(item.nome, item.preco)}
                                          title="Editar preço"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <span className="font-medium text-sm text-green-600">
                                    {item.formatarPorcentagem(margem)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <div className="flex items-center gap-2 justify-center">
                                    <Input
                                      type="number"
                                      placeholder="R$ 0,00"
                                      className="h-8 w-20 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      step="0.01"
                                      min="0"
                                      value={simulacaoPrecos[item.nome] || ''}
                                      onChange={(e) => handleSimulacaoChange(item.nome, e.target.value)}
                                    />
                                    {simulacaoPrecos[item.nome] && parseFloat(simulacaoPrecos[item.nome]) > 0 && (
                                      <span className={`text-xs font-medium ${
                                        calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])) > item.margem
                                          ? 'text-green-600'
                                          : calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])) < item.margem
                                          ? 'text-red-600'
                                          : 'text-gray-600'
                                      }`}>
                                        {formatarPorcentagem(calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])))}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center gap-1 justify-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleViewItem({...item, categoria: categoria.nome})}
                                      title="Visualizar"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditItem({...item, categoria: categoria.nome})}
                                      title="Editar"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleDeleteItem({...item, categoria: categoria.nome})}
                                      title="Excluir"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <Badge
                                    className={`text-xs ${
                                      item.disponivel
                                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                                        : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                                    }`}
                                    variant="outline"
                                  >
                                    {item.disponivel ? "Disponível" : "Indisponível"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {viewMode === "by-category" && (
                  <div className="space-y-6">
                    {filteredCategorias.map((categoria, index) => {
                      const Icon = categoria.icon || MenuSquare;
                      return (
                    <Card key={categoria.id || index} className="overflow-hidden">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-md"
                        style={{ backgroundColor: categoria.corBg || '#F3F4F6' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: categoria.cor || '#6B7280' }} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">{categoria.nome}</CardTitle>
                        <CardDescription className="text-sm">
                          {categoria.descricao || `${categoria.itens.length} itens nesta categoria`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: categoria.cor || '#E5E7EB',
                          color: categoria.cor || '#374151'
                        }}
                      >
                        {categoria.itens.filter(item => item.disponivel).length}/{categoria.itens.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="border-0">
                    <TableHeader>
                      <TableRow className="border-b border-border/40">
                        <TableHead className="w-[5%] text-center py-3 text-xs font-medium text-muted-foreground">ID</TableHead>
                        <TableHead className="w-[18%] py-3 text-xs font-medium text-muted-foreground">Item</TableHead>
                        {mostrarCustos && <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Custo</TableHead>}
                        <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Preço</TableHead>
                        <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Margem</TableHead>
                        <TableHead className="w-[15%] text-center py-3 text-xs font-medium text-muted-foreground">Simulação</TableHead>
                        <TableHead className="w-[15%] text-center py-3 text-xs font-medium text-muted-foreground">Ações</TableHead>
                        <TableHead className="w-[15%] text-center py-3 text-xs font-medium text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoria.itens.map((item, itemIndex) => (
                        <TableRow
                          key={itemIndex}
                          className={`border-b border-border/30 hover:bg-muted/40 ${!item.disponivel ? 'opacity-50' : ''}`}
                        >
                          <TableCell className="text-center py-3">
                            <span className="text-xs text-muted-foreground">{item.id}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-medium text-sm">{item.nome}</div>
                            {(() => {
                              const fornecedor = getFornecedorDisplay(item);
                              return (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Package className="w-2.5 h-2.5 text-muted-foreground" />
                                  <span className={`text-[10px] ${fornecedor.cor}`}>
                                    {fornecedor.texto}
                                  </span>
                                </div>
                              );
                            })()}
                          </TableCell>
                          {mostrarCustos && (
                            <TableCell className="text-center py-3">
                              <span className="font-medium text-sm text-destructive">
                                {formatarMoeda(item.custo)}
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="text-center py-3">
                            <div className="flex items-center gap-1 justify-center">
                              {editingPrice === item.nome ? (
                                <>
                                  <Input
                                    type="number"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="h-7 w-20 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    step="0.01"
                                    min="0"
                                    autoFocus
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                    onClick={() => handleSavePrice(item.nome)}
                                    title="Salvar"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    onClick={handleCancelEdit}
                                    title="Cancelar"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="font-medium text-sm text-primary">
                                    {formatarMoeda(item.preco)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                    onClick={() => handleEditPrice(item.nome, item.preco)}
                                    title="Editar preço"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <span className="font-medium text-sm text-green-600">
                              {formatarPorcentagem(item.margem)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <Input
                                type="number"
                                placeholder="R$ 0,00"
                                className="h-8 w-20 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                step="0.01"
                                min="0"
                                value={simulacaoPrecos[item.nome] || ''}
                                onChange={(e) => handleSimulacaoChange(item.nome, e.target.value)}
                              />
                              {simulacaoPrecos[item.nome] && parseFloat(simulacaoPrecos[item.nome]) > 0 && (
                                <span className={`text-xs font-medium ${
                                  calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])) > item.margem
                                    ? 'text-green-600'
                                    : calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])) < item.margem
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}>
                                  {formatarPorcentagem(calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])))}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewItem({...item, categoria: categoria.nome})}
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditItem({...item, categoria: categoria.nome})}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteItem({...item, categoria: categoria.nome})}
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Badge
                              className={`text-xs ${
                                item.disponivel
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                                  : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                              }`}
                              variant="outline"
                            >
                              {item.disponivel ? "Disponível" : "Indisponível"}
                            </Badge>
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
              </>
            )}
        </div>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-2 border-b">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Eye className="w-3 h-3 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Visualizar Item do Cardápio</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Informações e análise do item
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-3">
            {selectedItem && (
              <div className="space-y-3">
                {/* MODAL CONDICIONAL BASEADO NO TIPO */}

                {/* ==================== MODAL PARA INSUMO ==================== */}
                {selectedItem.tipo === "insumo" && (
                  <>
                    {/* Header do Insumo */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-green-800">{selectedItem.nome}</h3>
                          <p className="text-sm text-green-600">Insumo • {selectedItem.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cards Principais do Insumo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Custo por Unidade */}
                      <Card className="border-red-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-red-700">Custo Unitário</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">{formatarCustoPorUnidade(selectedItem.custo || 0) || '0.0000'}</p>
                            <p className="text-xs text-muted-foreground">por {selectedItem.unidade === 'g' ? 'grama' : selectedItem.unidade === 'ml' ? 'ml' : 'unidade'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Preço de Venda */}
                      <Card className="border-green-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-green-700">Preço de Venda</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{formatarMoeda(selectedItem.preco || 0) || '0.00'}</p>
                            <p className="text-xs text-muted-foreground">valor de venda</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quantidade */}
                      <Card className="border-purple-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-purple-700">Quantidade</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{selectedItem.quantidade || '1000'}</p>
                            <p className="text-xs text-muted-foreground">{selectedItem.unidade === 'g' ? 'gramas' : selectedItem.unidade === 'ml' ? 'ml' : 'unidades'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Status */}
                      <Card className={`${selectedItem.disponivel ? 'border-green-200' : 'border-gray-300'}`}>
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                              selectedItem.disponivel ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${selectedItem.disponivel ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              {selectedItem.disponivel ? 'Disponível' : 'Indisponível'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Card do Fornecedor */}
                    <Card className="border-blue-200">
                      <CardHeader className="pb-1 pt-3">
                        <CardTitle className="text-xs text-blue-700 flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          Fornecedor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-blue-800">{selectedItem.fornecedor || selectedItem.fornecedorPadrao || 'Não definido'}</p>
                            <p className="text-xs text-muted-foreground">Fornecedor principal para este insumo</p>
                          </div>
                          {selectedItem.fornecedor && (
                            <Badge variant="outline" className="bg-blue-50">Exclusivo</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detalhes do Insumo */}
                    <Card>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-xs flex items-center gap-2">
                          <Info className="w-3 h-3" />
                          Informações Detalhadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Categoria:</span>
                              <Badge variant="outline">{selectedItem.categoria}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Unidade de Medida:</span>
                              <span className="font-medium">{selectedItem.unidade === 'g' ? 'gramas' : selectedItem.unidade === 'ml' ? 'mililitros' : 'unidades'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ID do Insumo:</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedItem.id}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Custo Total:</span>
                              <span className="font-medium text-red-600">
                                {formatarMoeda((selectedItem.custo || 0) * (selectedItem.quantidade || 1000))}
                              </span>
                            </div>
                            {selectedItem.margem !== undefined && selectedItem.margem !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Margem de Lucro:</span>
                                <span className={`font-medium ${
                                  selectedItem.margem > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {selectedItem.formatarPorcentagem(margem)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo:</span>
                              <Badge variant="outline" className="bg-green-50">Matéria-prima</Badge>
                            </div>
                          </div>
                        </div>

                        {selectedItem.descricao && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="font-medium text-xs mb-1">Descrição:</h4>
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{selectedItem.descricao}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* ==================== MODAL PARA COPO BASE ==================== */}
                {selectedItem.tipo === "copo-base" && (
                  <>
                    {/* Header do Copo Base */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-purple-800">{selectedItem.nome}</h3>
                          <p className="text-sm text-purple-600">Copo Base • {selectedItem.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Card className="border-red-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="text-center">
                            <p className="text-base font-bold text-red-600">{formatarMoeda(selectedItem.custo || 0)}</p>
                            <p className="text-xs text-muted-foreground">Custo Total</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-green-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="text-center">
                            <p className="text-base font-bold text-green-600">{formatarMoeda(selectedItem.preco || 0)}</p>
                            <p className="text-xs text-muted-foreground">Preço de Venda</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="text-center">
                            <p className="text-base font-bold text-blue-600">{formatarPorcentagem(selectedItem.margem || 0)}</p>
                            <p className="text-xs text-muted-foreground">Margem</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-yellow-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="text-center">
                            <p className="text-base font-bold text-yellow-600">{formatarMoeda((selectedItem.preco || 0) - (selectedItem.custo || 0))}</p>
                            <p className="text-xs text-muted-foreground">Lucro</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Composição Detalhada */}
                    {selectedItem.composicao && (
                      <Card>
                        <CardHeader className="pb-2 pt-3">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Package className="w-3 h-3 text-purple-600" />
                            Composição do Copo Base
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{selectedItem.composicao.length} insumos utilizados</p>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="space-y-2">
                            {selectedItem.composicao.map((comp: any, index: number) => (
                              <div key={index} className="border rounded p-3 bg-gradient-to-r from-gray-50 to-gray-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-900">{comp.insumo.nome}</h4>
                                      <p className="text-xs text-gray-600">
                                        {comp.quantidade} • {comp.insumo.fornecedorPadrao || 'Fornecedor não informado'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-sm text-red-600">{formatarMoeda(comp.custo)}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatarCustoPorUnidade(comp.custo / parseFloat(comp.quantidade))}/un
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                                <span className="font-semibold text-sm text-red-800">Total da Composição:</span>
                                <span className="text-lg font-bold text-red-700">{formatarMoeda(selectedItem.custo || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* ==================== MODAL PARA COMBINADO ==================== */}
                {selectedItem.tipo === "combinado" && (
                  <>
                    {/* Header do Combinado */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Cherry className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-orange-800">{selectedItem.nome}</h3>
                          <p className="text-sm text-orange-600">Combinado • {selectedItem.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Similar ao copo base mas com estrutura de combinado */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Card className="border-red-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="text-center">
                            <p className="text-base font-bold text-red-600">{formatarMoeda(selectedItem.custo || 0)}</p>
                            <p className="text-xs text-muted-foreground">Custo Total</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-green-200">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-base font-bold text-green-600">{formatarMoeda(selectedItem.preco || 0)}</p>
                            <p className="text-xs text-muted-foreground">Preço de Venda</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-base font-bold text-blue-600">{formatarPorcentagem(selectedItem.margem || 0)}</p>
                            <p className="text-xs text-muted-foreground">Margem</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-yellow-200">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-base font-bold text-yellow-600">{formatarMoeda((selectedItem.preco || 0) - (selectedItem.custo || 0))}</p>
                            <p className="text-xs text-muted-foreground">Lucro</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Estrutura do Combinado */}
                    {selectedItem.composicao && (
                      <Card>
                        <CardHeader className="pb-2 pt-3">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Package className="w-3 h-3 text-orange-600" />
                            Estrutura do Combinado
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">Composição completa com {selectedItem.composicao.length} elementos</p>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="space-y-2">
                            {selectedItem.composicao.map((comp: any, index: number) => (
                              <div key={index} className="border rounded p-3 bg-gradient-to-r from-orange-50 to-amber-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-900">{comp.insumo.nome}</h4>
                                      <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-600">Qtd: {comp.quantidade}</span>
                                        <span className="text-blue-600">• {comp.insumo.fornecedorPadrao || 'Sem fornecedor'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-sm text-red-600">{formatarMoeda(comp.custo)}</p>
                                    <p className="text-xs text-gray-500">
                                      Custo unitário: {formatarCustoPorUnidade(comp.custo / parseFloat(comp.quantidade))}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                                <span className="font-semibold text-sm text-red-800">Custo Total do Combinado:</span>
                                <span className="text-xl font-bold text-red-700">{formatarMoeda(selectedItem.custo || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* ==================== MODAL PARA RECEITA ==================== */}
                {(selectedItem.tipo === "receita" || !selectedItem.tipo) && (
                  <>
                    {/* Header da Receita */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Cake className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-blue-800">{selectedItem.nome}</h3>
                          <p className="text-sm text-blue-600">Receita • {selectedItem.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cards Principais da Receita */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Card className="border-red-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-red-700">Custo de Produção</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">{formatarMoeda(selectedItem.custo || 0) || '0.00'}</p>
                            <p className="text-xs text-muted-foreground">por unidade</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-green-700">Preço de Venda</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{formatarMoeda(selectedItem.preco || 0) || '0.00'}</p>
                            <p className="text-xs text-muted-foreground">valor sugerido</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200">
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-xs text-blue-700">Margem de Lucro</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center">
                            <p className={`text-lg font-bold ${
                              (selectedItem.margem || 0) >= 100 ? 'text-green-600' :
                              (selectedItem.margem || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {formatarPorcentagem(selectedItem.margem || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">margem calculada</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detalhes da Receita */}
                    <Card>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-xs flex items-center gap-2">
                          <Info className="w-3 h-3 text-blue-600" />
                          Informações da Receita
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Categoria:</span>
                              <Badge variant="outline">{selectedItem.categoria}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${selectedItem.disponivel ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium">{selectedItem.disponivel ? "Disponível" : "Indisponível"}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo de Produção:</span>
                              <span className="font-medium text-green-600">Produção Própria</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {selectedItem.quantidade && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rendimento:</span>
                                <span className="font-medium">{selectedItem.quantidade}{selectedItem.unidade || 'un'}</span>
                              </div>
                            )}
                            {selectedItem.itemReferencia && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Baseado em:</span>
                                <span className="font-medium text-blue-600">#{selectedItem.itemReferencia}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lucro por Unidade:</span>
                              <span className={`font-medium ${
                                ((selectedItem.preco || 0) - (selectedItem.custo || 0)) > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatarMoeda((selectedItem.preco || 0) - (selectedItem.custo || 0))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedItem.descricao && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-sm mb-2">Descrição da Receita:</h4>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">{selectedItem.descricao}</p>
                          </div>
                        )}

                        {selectedItem.itemReferencia && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Link className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Baseado em Item Existente</span>
                              </div>
                              <p className="text-xs text-blue-700">
                                Esta receita utiliza <strong>#{selectedItem.itemReferencia}</strong> como base
                                {selectedItem.quantidade && selectedItem.unidade && (
                                  <span> em quantidade de <strong>{selectedItem.quantidade}{selectedItem.unidade}</strong></span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Observações (comum a todos os tipos) */}
                {selectedItem.observacoes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Observações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">{selectedItem.observacoes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewModalOpen(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setViewModalOpen(false);
                handleEditItem(selectedItem);
              }}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Item
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setViewModalOpen(false);
                handleDeleteItem(selectedItem);
              }}
              className="px-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição - Estrutura idêntica ao modal de criação */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Editar Item do Cardápio</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Modifique as informações do item selecionado
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            {/* Card de Referência com Valores Atuais - Compacto no topo */}
            {selectedItem && (
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 mb-4">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
                    <Info className="w-4 h-4" />
                    Valores Atuais de Referência
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Item</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{selectedItem.nome}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Preço</p>
                      <p className="text-xs font-bold text-green-600">{formatarMoeda(selectedItem.preco || 0)}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Custo</p>
                      <p className="text-xs font-bold text-red-600">{formatarMoeda(selectedItem.custo || 0)}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Margem</p>
                      <p className="text-xs font-bold text-blue-600">{formatarPorcentagem(selectedItem.margem || 0)}</p>
                    </div>
                    {selectedItem.quantidade && (
                      <div className="text-center p-2 bg-white rounded border">
                        <p className="text-[10px] text-gray-500 uppercase">Qtd</p>
                        <p className="text-xs font-bold text-purple-600">{selectedItem.quantidade}{selectedItem.unidade}</p>
                      </div>
                    )}
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Categoria</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{selectedItem.categoria}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Tipo</p>
                      <p className="text-xs font-bold text-gray-700">{selectedItem.tipo}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <p className="text-[10px] text-gray-500 uppercase">Status</p>
                      <Badge variant={selectedItem.disponivel ? "default" : "secondary"} className="text-[10px] h-5">
                        {selectedItem.disponivel ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-12 gap-4">
              {/* Seção Principal - Formulário */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                {/* Categoria e Tipo */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm">Categoria e Tipo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="category-select" className="text-xs font-medium">Categoria *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedItemCategory} onValueChange={setSelectedItemCategory}>
                          <SelectTrigger className="flex-1 h-9">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {managedCategorias.map((categoria) => {
                              const Icon = categoria.icon;
                              return (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded-sm flex items-center justify-center"
                                      style={{ backgroundColor: categoria.corBg }}
                                    >
                                      <Icon className="w-2.5 h-2.5" style={{ color: categoria.cor }} />
                                    </div>
                                    {categoria.nome}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCategoriesModalOpen(true)}
                          className="h-9 px-2 text-xs"
                          title="Gerenciar categorias"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item-type" className="text-xs font-medium">Tipo do Item *</Label>
                      <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Pesquisa do Item */}
                  {selectedItemType && (
                    <div className="space-y-2">
                      <Label htmlFor="item-search" className="text-xs font-medium">Buscar Item Existente</Label>
                      <Select
                        value={selectedSearchItem?.id || ""}
                        onValueChange={(value) => {
                          const item = mockData[selectedItemType as keyof typeof mockData]?.find(i => i.id === value);
                          setSelectedSearchItem(item);
                          if (item) {
                            setItemName(item.nome);
                            setItemQuantity("");
                          }
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Buscar item existente (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Buscar item..."
                                value={itemSearchFilter}
                                onChange={(e) => setItemSearchFilter(e.target.value)}
                                className="h-8 pl-7 text-xs"
                              />
                            </div>
                          </div>
                          {mockData[selectedItemType as keyof typeof mockData]
                            ?.filter((item) =>
                              item.nome.toLowerCase().includes(itemSearchFilter.toLowerCase()) ||
                              item.id.toLowerCase().includes(itemSearchFilter.toLowerCase())
                            )
                            ?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">{item.nome}</span>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs text-muted-foreground">{formatarCustoPorUnidade(item.custo || 0)}</span>
                                  <span className="text-xs text-blue-600 font-medium">/{item.unidade || (selectedItemType === "insumo" ? "g" : "un")}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecione um item existente para aproveitar as informações de custo
                      </p>
                    </div>
                  )}

                  {/* Campo Quantidade */}
                  {(selectedSearchItem || selectedItemType === "receita") && (
                    <div className="space-y-2">
                      <Label htmlFor="item-quantity" className="text-xs font-medium">
                        Quantidade *
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="item-quantity"
                          type="number"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                          placeholder="1"
                          step={selectedItemType === "insumo" ? "0.001" : selectedItemType === "receita" ? "0.1" : "1"}
                          min="0.001"
                          className="h-9 flex-1"
                        />
                        <div className="text-xs text-muted-foreground bg-gray-50 px-2 py-2 rounded border min-w-[50px] text-center">
                          {selectedSearchItem?.unidade ||
                           (selectedItemType === "insumo" ? "g" :
                            selectedItemType === "receita" ? "ml" : "un")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalhes do Item */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm">Detalhes do Item</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="item-id" className="text-xs font-medium">ID do Item no Cardápio</Label>
                      <Input
                        id="item-id"
                        value={itemId}
                        onChange={(e) => setItemId(e.target.value)}
                        placeholder=""
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        ID para identificar o item do cardápio no sistema de vendas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-price" className="text-xs font-medium">Preço de Venda *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                        <Input
                          id="item-price"
                          type="number"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="item-name" className="text-xs font-medium">Nome no Cardápio *</Label>
                    <Input
                      id="item-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Nome que aparecerá no cardápio"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="item-notes" className="text-xs font-medium">Observações</Label>
                    <Textarea
                      id="item-notes"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Observações adicionais sobre o item"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Lateral - Preview e Informações */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                {/* Preview do Item */}
                {itemName && itemPrice && selectedItemCategory && (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                        <Eye className="w-5 h-5" />
                        Preview do Cardápio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{itemName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {selectedItemCategory && (() => {
                                  const categoria = managedCategorias.find(c => c.id === selectedItemCategory);
                                  if (categoria) {
                                    const Icon = categoria.icon;
                                    return (
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="w-4 h-4 rounded-sm flex items-center justify-center"
                                          style={{ backgroundColor: categoria.corBg }}
                                        >
                                          <Icon className="w-2.5 h-2.5" style={{ color: categoria.cor }} />
                                        </div>
                                        <span className="text-xs text-gray-600">{categoria.nome}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              {itemNotes && (
                                <p className="text-xs text-gray-500 mt-1 italic">{itemNotes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{formatarMoeda(parseFloat(itemPrice))}</p>
                              {selectedSearchItem && itemQuantity && (
                                <>
                                  <p className="text-xs text-gray-500">
                                    Qtd: {parseFloat(itemQuantity)}{selectedSearchItem.unidade}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Margem: {formatarPorcentagem(((parseFloat(itemPrice) - (selectedSearchItem.custo * parseFloat(itemQuantity))) / (selectedSearchItem.custo * parseFloat(itemQuantity))) * 100)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informações de Custo */}
                {selectedSearchItem && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Informações Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-medium">CUSTO TOTAL</p>
                            <p className="text-lg font-bold text-red-700">
                              R$ {itemQuantity ?
                                formatarCustoPorUnidade(selectedSearchItem.custo * parseFloat(itemQuantity)) :
                                formatarCustoPorUnidade(selectedSearchItem.custo || 0) || '0.0000'
                              }
                            </p>
                            {itemQuantity && (
                              <p className="text-xs text-red-500">
                                {parseFloat(itemQuantity)}{selectedSearchItem.unidade} × R$ {formatarCustoPorUnidade(selectedSearchItem.custo || 0)}/{selectedSearchItem.unidade}
                              </p>
                            )}
                          </div>
                          {itemPrice && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs text-green-600 font-medium">MARGEM</p>
                              {(() => {
                                const custoCalculado = calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity) || 1, selectedItemType);
                                const margem = calcularMargem(parseFloat(itemPrice), custoCalculado);
                                const classificacao = getMargemClassificacao(margem);

                                return (
                                  <>
                                    <p className={`text-lg font-bold ${getMargemColor(margem)}`}>
                                      {formatarPorcentagem(margem)}
                                    </p>
                                    <p className={`text-xs font-medium ${getMargemColor(margem)}`}>
                                      {classificacao}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-red-500">*</span>
              <span>Campos obrigatórios</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  resetNewItemForm();
                }}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                disabled={!selectedItemCategory || !itemName || !itemPrice || (selectedSearchItem && !itemQuantity) || (selectedItemType === "receita" && !itemQuantity)}
                onClick={() => {
                  const preco = parseFloat(itemPrice);
                  const quantidade = parseFloat(itemQuantity) || 1;

                  // Calcular custo baseado na quantidade se item foi selecionado
                  let custoCalculado = preco * 0.4; // Fallback: estima custo como 40% do preço

                  if (selectedSearchItem) {
                    custoCalculado = calcularCustoComQuantidade(selectedSearchItem, quantidade, selectedItemType);
                  }

                  if (selectedItem && selectedItemCategory && itemName && preco && preco > 0) {
                    // Atualizar o item existente
                    setManagedCategorias(prev =>
                      prev.map(categoria => {
                        // Remove o item da categoria atual
                        const itensLimpos = categoria.itens.filter(item => item.id !== selectedItem.id);

                        // Se esta é a nova categoria, adiciona o item atualizado
                        if (categoria.nome === selectedItemCategory) {
                          const itemAtualizado = {
                            ...selectedItem,
                            id: itemId || selectedItem.id,
                            nome: itemName,
                            preco: preco,
                            custo: custoCalculado,
                            margem: ((preco - custoCalculado) / custoCalculado) * 100,
                            categoria: categoria.nome,
                            tipo: selectedItemType || selectedItem.tipo,
                            fornecedor: selectedSearchItem?.fornecedorPadrao || selectedItem.fornecedor,
                            quantidade: selectedSearchItem ? quantidade : selectedItem.quantidade,
                            unidade: selectedSearchItem?.unidade || selectedItem.unidade,
                            itemReferencia: selectedSearchItem?.id || selectedItem.itemReferencia
                          };
                          return { ...categoria, itens: [...itensLimpos, itemAtualizado] };
                        }

                        // Para outras categorias, apenas remove o item se necessário
                        return { ...categoria, itens: itensLimpos };
                      })
                    );

                    setEditModalOpen(false);
                    resetNewItemForm();
                  }
                }}
                className="px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item do cardápio?
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedItem.nome}</p>
                <p className="text-sm text-muted-foreground">Categoria: {selectedItem.categoria}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Categorias */}
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
                          onClick={handleSaveEditCategory}
                          size="sm"
                          disabled={!editCategoryName.trim()}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={handleCancelEditCategory} size="sm">
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {managedCategorias.map((categoria, index) => {
                    const IconComponent = categoria.icon;
                    const isEditing = editingCategory === categoria.id;
                    const isDragging = draggedIndex === index;

                    return (
                      <div
                        key={categoria.id}
                        draggable={!isEditing}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-2 border rounded-lg transition-all ${
                          isEditing ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                        } ${
                          isDragging ? 'opacity-50 scale-95 bg-muted border-dashed' : ''
                        } ${
                          !isEditing ? 'cursor-move' : ''
                        }`}
                      >
                        <div className="cursor-grab hover:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: categoria.cor }}
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

      {/* Modal de Adicionar Novo Item */}
      <Dialog open={newItemModalOpen} onOpenChange={setNewItemModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Adicionar Item ao Cardápio</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Configure um novo item de forma rápida
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Seção Principal - Formulário */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                {/* Categoria e Tipo */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm">Categoria e Tipo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="category-select" className="text-xs font-medium">Categoria *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedItemCategory} onValueChange={setSelectedItemCategory}>
                          <SelectTrigger className="flex-1 h-9">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {managedCategorias.map((categoria) => {
                              const Icon = categoria.icon;
                              return (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded-sm flex items-center justify-center"
                                      style={{ backgroundColor: categoria.corBg }}
                                    >
                                      <Icon className="w-2.5 h-2.5" style={{ color: categoria.cor }} />
                                    </div>
                                    {categoria.nome}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCategoriesModalOpen(true)}
                          className="h-9 px-2 text-xs"
                          title="Gerenciar categorias"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item-type" className="text-xs font-medium">Tipo do Item *</Label>
                      <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Pesquisa do Item */}
                  {selectedItemType && (
                    <div className="space-y-2">
                      <Label htmlFor="item-search" className="text-xs font-medium">Buscar Item Existente</Label>
                      <Select
                        value={selectedSearchItem?.id || ""}
                        onValueChange={(value) => {
                          const item = mockData[selectedItemType as keyof typeof mockData]?.find(i => i.id === value);
                          setSelectedSearchItem(item);
                          if (item) {
                            setItemName(item.nome);
                            // Resetar quantidade quando trocar de item
                            setItemQuantity("");
                          }
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Buscar item existente (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Buscar item..."
                                value={itemSearchFilter}
                                onChange={(e) => setItemSearchFilter(e.target.value)}
                                className="h-8 pl-7 text-xs"
                              />
                            </div>
                          </div>
                          {mockData[selectedItemType as keyof typeof mockData]
                            ?.filter((item) =>
                              item.nome.toLowerCase().includes(itemSearchFilter.toLowerCase()) ||
                              item.id.toLowerCase().includes(itemSearchFilter.toLowerCase())
                            )
                            ?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">{item.nome}</span>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs text-muted-foreground">{formatarCustoPorUnidade(item.custo || 0)}</span>
                                  <span className="text-xs text-blue-600 font-medium">/{item.unidade || (selectedItemType === "insumo" ? "g" : "un")}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecione um item existente para aproveitar as informações de custo
                      </p>
                    </div>
                  )}

                  {/* Campo Quantidade - Movido para depois da busca */}
                  {(selectedSearchItem || selectedItemType === "receita") && (
                    <div className="space-y-2">
                      <Label htmlFor="item-quantity" className="text-xs font-medium">
                        Quantidade *
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="item-quantity"
                          type="number"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                          placeholder="1"
                          step={selectedItemType === "insumo" ? "0.001" : selectedItemType === "receita" ? "0.1" : "1"}
                          min="0.001"
                          className="h-9 flex-1"
                        />
                        <div className="text-xs text-muted-foreground bg-gray-50 px-2 py-2 rounded border min-w-[50px] text-center">
                          {selectedSearchItem?.unidade ||
                           (selectedItemType === "insumo" ? "g" :
                            selectedItemType === "receita" ? "ml" : "un")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedItemType === "insumo"
                          ? `Quantidade em ${selectedSearchItem?.unidade === 'g' ? 'gramas' : selectedSearchItem?.unidade === 'ml' ? 'ml' : selectedSearchItem?.unidade || 'gramas'}`
                          : selectedItemType === "receita"
                          ? "Quantidade em ml da receita utilizada"
                          : "Quantidade em unidades do item (copos base ou combinados)"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Detalhes do Item */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm">Detalhes do Item</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="item-id" className="text-xs font-medium">ID do Item no Cardápio</Label>
                      <Input
                        id="item-id"
                        value={itemId}
                        onChange={(e) => setItemId(e.target.value)}
                        placeholder=""
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        ID para identificar o item do cardápio no sistema de vendas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-price" className="text-xs font-medium">Preço de Venda *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                        <Input
                          id="item-price"
                          type="number"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="item-name" className="text-xs font-medium">Nome no Cardápio *</Label>
                    <Input
                      id="item-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Nome que aparecerá no cardápio"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="item-notes" className="text-xs font-medium">Observações</Label>
                    <Textarea
                      id="item-notes"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Observações adicionais sobre o item"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Lateral - Preview e Informações */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                {/* Preview do Item */}
                {itemName && itemPrice && selectedItemCategory && (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                        <Eye className="w-5 h-5" />
                        Preview do Cardápio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{itemName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {selectedItemCategory && (() => {
                                  const categoria = managedCategorias.find(c => c.id === selectedItemCategory);
                                  if (categoria) {
                                    const Icon = categoria.icon;
                                    return (
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="w-4 h-4 rounded-sm flex items-center justify-center"
                                          style={{ backgroundColor: categoria.corBg }}
                                        >
                                          <Icon className="w-2.5 h-2.5" style={{ color: categoria.cor }} />
                                        </div>
                                        <span className="text-xs text-gray-600">{categoria.nome}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              {itemNotes && (
                                <p className="text-xs text-gray-500 mt-1 italic">{itemNotes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{formatarMoeda(parseFloat(itemPrice))}</p>
                              {selectedSearchItem && itemQuantity && (
                                <>
                                  <p className="text-xs text-gray-500">
                                    Qtd: {parseFloat(itemQuantity)}{selectedSearchItem.unidade}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Margem: {formatarPorcentagem(((parseFloat(itemPrice) - (selectedSearchItem.custo * parseFloat(itemQuantity))) / (selectedSearchItem.custo * parseFloat(itemQuantity))) * 100)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informações de Custo */}
                {selectedSearchItem && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Informações Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-medium">CUSTO TOTAL</p>
                            <p className="text-lg font-bold text-red-700">
                              R$ {itemQuantity ?
                                formatarCustoPorUnidade(selectedSearchItem.custo * parseFloat(itemQuantity)) :
                                formatarCustoPorUnidade(selectedSearchItem.custo || 0) || '0.0000'
                              }
                            </p>
                            {itemQuantity && (
                              <p className="text-xs text-red-500">
                                {parseFloat(itemQuantity)}{selectedSearchItem.unidade} × R$ {formatarCustoPorUnidade(selectedSearchItem.custo || 0)}/{selectedSearchItem.unidade}
                              </p>
                            )}
                          </div>
                          {itemPrice && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs text-green-600 font-medium">MARGEM</p>
                              {(() => {
                                const custoCalculado = calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity) || 1, selectedItemType);
                                const margem = calcularMargem(parseFloat(itemPrice), custoCalculado);
                                const classificacao = getMargemClassificacao(margem);

                                return (
                                  <>
                                    <p className={`text-lg font-bold ${getMargemColor(margem)}`}>
                                      {formatarPorcentagem(margem)}
                                    </p>
                                    <p className={`text-xs font-medium ${getMargemColor(margem)}`}>
                                      {classificacao}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fornecedor Padrão:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="font-medium">
                                {selectedSearchItem.fornecedorPadrao || "Produção Própria"}
                              </span>
                            </div>
                          </div>
                          {selectedSearchItem.descricao && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Descrição:</span>
                              <span className="font-medium text-xs text-right max-w-[200px]">
                                {selectedSearchItem.descricao}
                              </span>
                            </div>
                          )}
                          {selectedSearchItem.unidade && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Unidade:</span>
                              <span className="font-medium">
                                {selectedSearchItem.unidade}
                              </span>
                            </div>
                          )}
                          {itemPrice && (
                            <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t">
                              <span className="text-muted-foreground">Lucro total:</span>
                              <span className="font-medium text-green-600">
                                R$ {itemQuantity ?
                                  formatarMoeda(parseFloat(itemPrice) - (selectedSearchItem.custo * parseFloat(itemQuantity)))
                                  : formatarMoeda(parseFloat(itemPrice) - selectedSearchItem.custo)
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Composição (para combinados e copo base) */}
                {selectedSearchItem?.composicao && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Composição do {selectedItemType === "copo-base" ? "Copo Base" : "Combinado"}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Insumos que compõem este produto
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedSearchItem.composicao.map((comp: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">{comp.insumo.nome}</p>
                                    <p className="text-xs text-blue-600">
                                      <span className="font-medium">{comp.insumo.fornecedorPadrao}</span>
                                    </p>
                                  </div>
                                  <div className="text-right ml-2">
                                    <p className="text-xs text-gray-600">
                                      {comp.quantidade}{comp.insumo.unidade}
                                    </p>
                                    <p className="text-sm font-bold text-red-600">
                                      {formatarMoeda(comp.custo)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Totalizador Compacto */}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                                <Calculator className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-gray-900">Custo Total do Produto</div>
                                <div className="text-xs text-gray-600">
                                  {selectedSearchItem.composicao.length} insumo{selectedSearchItem.composicao.length > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-red-700">
                                {itemQuantity ?
                                  formatarMoeda(calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity), selectedItemType)) :
                                  formatarMoeda(selectedSearchItem.custo)
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Análise de Rentabilidade */}
                {itemPrice && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Análise de Rentabilidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const precoVenda = parseFloat(itemPrice);
                        let custoCalculado;
                        let margem;
                        let lucroTotal;
                        let classificacao;

                        // Se há item selecionado, calcular com base nele
                        if (selectedSearchItem && itemQuantity) {
                          custoCalculado = calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity), selectedItemType);
                          margem = calcularMargem(precoVenda, custoCalculado);
                          lucroTotal = precoVenda - custoCalculado;
                          classificacao = getMargemClassificacao(margem);
                        } else if (selectedItemType === "receita" && itemQuantity) {
                          // Para receitas sem item base: custo estimado por grama
                          const custoGrama = precoVenda * 0.4 / parseFloat(itemQuantity); // Custo estimado por grama
                          custoCalculado = custoGrama * parseFloat(itemQuantity);
                          margem = calcularMargem(precoVenda, custoCalculado);
                          lucroTotal = precoVenda - custoCalculado;
                          classificacao = getMargemClassificacao(margem);
                        } else {
                          // Análise básica: estimar custo como 40% do preço
                          custoCalculado = precoVenda * 0.4;
                          margem = calcularMargem(precoVenda, custoCalculado);
                          lucroTotal = precoVenda - custoCalculado;
                          classificacao = getMargemClassificacao(margem);
                        }

                        return (
                          <div className="space-y-2">
                            {/* Indicador se é estimativa */}
                            {!(selectedSearchItem && itemQuantity) && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="text-xs text-blue-600">
                                  💡 Análise estimada {selectedItemType === "receita" && itemQuantity
                                    ? `(custo baseado em 40% do preço para ${itemQuantity}g)`
                                    : "(custo baseado em 40% do preço)"
                                  }
                                </p>
                              </div>
                            )}

                            {/* Resumo Financeiro */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">CUSTO</p>
                                <p className="text-sm font-bold text-red-600">
                                  {formatarMoeda(custoCalculado)}
                                </p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">VENDA</p>
                                <p className="text-sm font-bold text-blue-600">
                                  {formatarMoeda(precoVenda)}
                                </p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">LUCRO</p>
                                <p className={`text-sm font-bold ${getMargemColor(margem)}`}>
                                  {formatarMoeda(lucroTotal)}
                                </p>
                              </div>
                            </div>

                            {/* Indicador de Margem */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Margem de Lucro</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xl font-bold ${getMargemColor(margem)}`}>
                                    {formatarPorcentagem(margem)}
                                  </span>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    margem < 0 ? 'bg-red-100 text-red-700' :
                                    margem < 50 ? 'bg-orange-100 text-orange-700' :
                                    margem < 100 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {classificacao}
                                  </span>
                                </div>
                              </div>


                              {/* Recomendações */}
                              <div className="mt-3 text-xs">
                                {margem < 0 && (
                                  <p className="text-red-600 bg-red-50 p-2 rounded">
                                    ⚠️ ATENÇÃO: Este item está em prejuízo! O preço de venda é menor que o custo.
                                  </p>
                                )}
                                {margem >= 0 && margem < 50 && (
                                  <p className="text-orange-600 bg-orange-50 p-2 rounded">
                                    💡 Margem baixa. Considere aumentar o preço ou reduzir custos.
                                  </p>
                                )}
                                {margem >= 50 && margem < 100 && (
                                  <p className="text-yellow-600 bg-yellow-50 p-2 rounded">
                                    ✅ Margem aceitável, mas há espaço para melhorar.
                                  </p>
                                )}
                                {margem >= 100 && (
                                  <p className="text-green-600 bg-green-50 p-2 rounded">
                                    🎯 Excelente margem! Este item tem boa rentabilidade.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-red-500">*</span>
              <span>Campos obrigatórios</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setNewItemModalOpen(false);
                  resetNewItemForm();
                }}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                disabled={!selectedItemCategory || !itemName || !itemPrice || (selectedSearchItem && !itemQuantity) || (selectedItemType === "receita" && !itemQuantity)}
                onClick={() => {
                  const preco = parseFloat(itemPrice);
                  const quantidade = parseFloat(itemQuantity) || 1;

                  // Calcular custo baseado na quantidade se item foi selecionado
                  let custoCalculado = preco * 0.4; // Fallback: estima custo como 40% do preço

                  if (selectedSearchItem) {
                    custoCalculado = calcularCustoComQuantidade(selectedSearchItem, quantidade, selectedItemType);
                  }

                  if (selectedItemCategory && itemName && preco && preco > 0) {
                    const novoItem = {
                      id: itemId || `item_${Date.now()}`,
                      nome: itemName,
                      preco: preco,
                      custo: custoCalculado,
                      margem: ((preco - custoCalculado) / custoCalculado) * 100,
                      disponivel: true,
                      tipo: selectedItemType || "receita",
                      fornecedor: selectedSearchItem?.fornecedorPadrao || null,
                      quantidade: selectedSearchItem ? quantidade : (selectedItemType === "receita" && itemQuantity ? parseFloat(itemQuantity) : undefined),
                      unidade: selectedSearchItem?.unidade || (selectedItemType === "receita" ? "ml" : undefined),
                      itemReferencia: selectedSearchItem?.id || undefined
                    };

                    setManagedCategorias(prev =>
                      prev.map(categoria =>
                        categoria.nome === selectedItemCategory
                          ? { ...categoria, itens: [...categoria.itens, novoItem] }
                          : categoria
                      )
                    );
                  }
                  setNewItemModalOpen(false);
                  resetNewItemForm();
                }}
                className="px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Cardápio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cardapio;