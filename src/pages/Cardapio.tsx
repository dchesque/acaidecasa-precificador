"use client"
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
  Users
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
  const [editSelectedItem, setEditSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarPrecos, setMostrarPrecos] = useState(true);
  const [mostrarCustos, setMostrarCustos] = useState(false);
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
        { id: "001", nome: "Açaí 300ml", preco: 12.90, custo: 5.80, margem: 122.4, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "002", nome: "Açaí 500ml", preco: 18.90, custo: 8.50, margem: 122.4, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "003", nome: "Açaí 1L", preco: 32.90, custo: 15.20, margem: 116.4, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "011", nome: "Açaí com Granola 400ml", preco: 15.90, custo: 7.90, margem: 101.3, disponivel: true, tipo: "receita", fornecedor: null }
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
        { id: "004", nome: "Açaí Gourmet 300ml", preco: 16.90, custo: 7.20, margem: 134.7, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "005", nome: "Açaí Gourmet 500ml", preco: 24.90, custo: 11.50, margem: 116.5, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "012", nome: "Açaí Orgânico 300ml", preco: 19.90, custo: 9.50, margem: 109.5, disponivel: true, tipo: "receita", fornecedor: "Açaí Orgânico Ltda" },
        { id: "013", nome: "Açaí com Frutas Vermelhas", preco: 22.90, custo: 12.80, margem: 78.9, disponivel: false, tipo: "receita", fornecedor: null }
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
        { id: "006", nome: "Açaí Completo 500ml", preco: 22.90, custo: 10.75, margem: 113.0, disponivel: true, tipo: "combinado", fornecedor: null },
        { id: "007", nome: "Açaí Fitness 300ml", preco: 18.50, custo: 8.20, margem: 125.6, disponivel: true, tipo: "combinado", fornecedor: null },
        { id: "008", nome: "Açaí Kids 200ml", preco: 12.90, custo: 5.90, margem: 118.6, disponivel: false, tipo: "combinado", fornecedor: null },
        { id: "014", nome: "Super Açaí 700ml", preco: 28.90, custo: 14.20, margem: 103.5, disponivel: true, tipo: "combinado", fornecedor: null }
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
        { id: "009", nome: "Torta de Açaí", preco: 8.90, custo: 3.50, margem: 154.3, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "010", nome: "Sorvete de Açaí", preco: 6.90, custo: 2.80, margem: 146.4, disponivel: true, tipo: "receita", fornecedor: "Gelatos & Cia" },
        { id: "015", nome: "Mousse de Açaí", preco: 7.50, custo: 4.20, margem: 78.6, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "016", nome: "Paleta de Açaí", preco: 5.90, custo: 6.50, margem: -9.2, disponivel: true, tipo: "receita", fornecedor: "Paletas Artesanais" }
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
        { id: "017", nome: "Smoothie de Açaí 400ml", preco: 14.90, custo: 6.80, margem: 119.1, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "018", nome: "Suco de Açaí 300ml", preco: 9.90, custo: 4.20, margem: 135.7, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "019", nome: "Água Saborizada Açaí", preco: 4.50, custo: 1.80, margem: 150.0, disponivel: true, tipo: "receita", fornecedor: "AquaSabor" },
        { id: "020", nome: "Vitamina de Açaí 500ml", preco: 12.90, custo: 5.50, margem: 134.5, disponivel: true, tipo: "receita", fornecedor: null },
        { id: "021", nome: "Frappé de Açaí 350ml", preco: 16.90, custo: 7.80, margem: 116.7, disponivel: false, tipo: "receita", fornecedor: null }
      ]
    }
  ];

  // Estado para categorias gerenciadas - deve vir após a declaração de categorias
  const [managedCategorias, setManagedCategorias] = useState(categorias);

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setEditItemId(item.id || "");
    setEditItemName(item.nome || "");
    setEditItemPrice(item.preco?.toString() || "");
    setEditItemNotes("");
    setEditItemCategory("");
    setEditItemType("");
    setEditSelectedItem(null);
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
        `R$ ${item.preco.toFixed(2)}`
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
        custo: 12.50,
        fornecedorPadrao: "Amazônia Açaí Ltda",
        descricao: "Açaí premium de alta qualidade",
        unidade: "kg"
      },
      {
        id: "INS002",
        nome: "Banana Prata",
        custo: 3.20,
        fornecedorPadrao: "Frutas do Vale",
        descricao: "Banana prata fresca",
        unidade: "kg"
      },
      {
        id: "INS003",
        nome: "Granola Artesanal",
        custo: 8.90,
        fornecedorPadrao: "Cereais & Grãos",
        descricao: "Granola artesanal sem conservantes",
        unidade: "kg"
      },
      {
        id: "INS004",
        nome: "Mel Orgânico",
        custo: 15.50,
        fornecedorPadrao: "Apiário Dourado",
        descricao: "Mel orgânico puro",
        unidade: "kg"
      },
      {
        id: "INS005",
        nome: "Aveia em Flocos",
        custo: 4.80,
        fornecedorPadrao: "Cereais & Grãos",
        descricao: "Aveia em flocos finos",
        unidade: "kg"
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
            quantidade: "1 und",
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
            quantidade: "15ml",
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
            quantidade: "1 und",
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
      }
    ],
    receita: [
      {
        id: "REC001",
        nome: "Açaí da Casa",
        custo: 8.90,
        fornecedorPadrao: "Produção Própria",
        descricao: "Receita especial da casa",
        rendimento: "1 porção"
      },
      {
        id: "REC002",
        nome: "Smoothie Verde",
        custo: 7.20,
        fornecedorPadrao: "Produção Própria",
        descricao: "Smoothie verde nutritivo",
        rendimento: "1 porção"
      }
    ]
  };

  const filteredCategorias = managedCategorias
    .map(categoria => ({
      ...categoria,
      itens: categoria.itens.filter(item => {
        const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDisponivel = !apenasDisponiveis || item.disponivel;
        return matchesSearch && matchesDisponivel;
      })
    }))
    .filter(categoria => categoria.itens.length > 0);

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
                                {item.margem.toFixed(1)}%
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
                            {margemMedia.toFixed(1)}%
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
                <div className="grid grid-cols-5 gap-4 items-center">
                  <Input
                    placeholder="Buscar item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="col-span-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="apenas-disponiveis"
                      checked={apenasDisponiveis}
                      onCheckedChange={setApenasDisponiveis}
                    />
                    <Label htmlFor="apenas-disponiveis" className="text-sm">Apenas Disponíveis</Label>
                  </div>
                  <Button
                    variant={viewMode === "complete" ? "default" : "outline"}
                    onClick={() => setViewMode("complete")}
                    size="sm"
                    className="text-xs"
                  >
                    Visualização Completa
                  </Button>
                  <Button
                    variant={viewMode === "by-category" ? "default" : "outline"}
                    onClick={() => setViewMode("by-category")}
                    size="sm"
                    className="text-xs"
                  >
                    Por Categoria
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  💡 Use a coluna &quot;Simulação&quot; para testar novos preços rapidamente
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
                            <TableHead className="w-[8%] text-center py-3 text-xs font-medium text-muted-foreground">Qtd</TableHead>
                            <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Categoria</TableHead>
                            <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Custo</TableHead>
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
                                  {item.quantidade ? (
                                    <div className="text-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {item.quantidade}
                                      </span>
                                      <div className="text-xs text-muted-foreground">
                                        {item.unidade || 'un'}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
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
                                <TableCell className="text-center py-3">
                                  <span className="font-medium text-sm text-destructive">
                                    R$ {item.custo.toFixed(2)}
                                  </span>
                                </TableCell>
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
                                          R$ {item.preco.toFixed(2)}
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
                                    {item.margem.toFixed(1)}%
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
                                        {calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])).toFixed(1)}%
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
                        <TableHead className="w-[8%] text-center py-3 text-xs font-medium text-muted-foreground">Qtd</TableHead>
                        <TableHead className="w-[10%] text-center py-3 text-xs font-medium text-muted-foreground">Custo</TableHead>
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
                          <TableCell className="text-center py-3">
                            {item.quantidade ? (
                              <div className="text-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {item.quantidade}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {item.unidade || 'un'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <span className="font-medium text-sm text-destructive">
                              R$ {item.custo.toFixed(2)}
                            </span>
                          </TableCell>
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
                                    R$ {item.preco.toFixed(2)}
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
                              {item.margem.toFixed(1)}%
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
                                  {calcularMargemSimulacao(item.custo, parseFloat(simulacaoPrecos[item.nome])).toFixed(1)}%
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
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Detalhes do Item</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Informações completas sobre o item do cardápio
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedItem && (
            <div className="flex-1 overflow-y-auto py-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Seção Principal - Informações */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  {/* Informações Básicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nome do Item</label>
                            <p className="text-lg font-semibold mt-1">{selectedItem.nome}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-sm">
                                {selectedItem.categoria}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="mt-1">
                              <Badge
                                className={`${
                                  selectedItem.disponivel
                                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                                    : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                                }`}
                                variant="outline"
                              >
                                {selectedItem.disponivel ? "Disponível" : "Indisponível"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">ID do Item</label>
                            <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded mt-1">
                              {selectedItem.id || "Não definido"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                            <p className="text-lg mt-1 capitalize">
                              {selectedItem.tipo || "Item de cardápio"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Análise Financeira */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Análise Financeira
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <label className="text-sm font-medium text-red-700">CUSTO</label>
                          </div>
                          <p className="text-2xl font-bold text-red-700">
                            R$ {selectedItem.custo?.toFixed(2) || "0,00"}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <label className="text-sm font-medium text-green-700">PREÇO</label>
                          </div>
                          <p className="text-2xl font-bold text-green-700">
                            R$ {selectedItem.preco?.toFixed(2) || "0,00"}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <label className="text-sm font-medium text-blue-700">MARGEM</label>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">
                            {selectedItem.margem?.toFixed(1) || "0"}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-muted-foreground">Lucro por Unidade</label>
                            <p className="text-xl font-semibold text-green-600 mt-1">
                              R$ {((selectedItem.preco || 0) - (selectedItem.custo || 0)).toFixed(2)}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-muted-foreground">Classificação de Margem</label>
                            <p className="text-xl font-semibold mt-1">
                              <span className={`${
                                selectedItem.margem > 150 ? 'text-green-600' :
                                selectedItem.margem > 120 ? 'text-blue-600' :
                                selectedItem.margem > 100 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {selectedItem.margem > 150 ? 'Excelente' :
                                 selectedItem.margem > 120 ? 'Boa' :
                                 selectedItem.margem > 100 ? 'Regular' : 'Baixa'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Seção Lateral - Preview e Ações */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  {/* Preview do Item */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                        <MenuSquare className="w-5 h-5" />
                        Preview no Cardápio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{selectedItem.nome}</h4>
                            <p className="text-xs text-gray-600 mt-1">{selectedItem.categoria}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Badge
                                className={`text-xs ${
                                  selectedItem.disponivel
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                                variant="outline"
                              >
                                {selectedItem.disponivel ? "Disponível" : "Indisponível"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              R$ {selectedItem.preco?.toFixed(2) || "0,00"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Margem: {selectedItem.margem?.toFixed(1) || "0"}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações Rápidas */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => {
                          setViewModalOpen(false);
                          handleEditItem(selectedItem);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Item
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => {
                          setViewModalOpen(false);
                          handleDeleteItem(selectedItem);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Item
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Informações Adicionais */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">💡</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-900 text-sm">Dicas de Otimização</h4>
                          <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                            <li>• Margens ideais: 100-200%</li>
                            <li>• Monitore custos regularmente</li>
                            <li>• Ajuste preços conforme demanda</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setViewModalOpen(false);
              handleEditItem(selectedItem);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Editar Item do Cardápio</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Modifique as informações do item selecionado
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Seção Principal - Formulário */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                {/* Step 1: Informações Atuais */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</div>
                    <h3 className="font-semibold">Informações Atuais</h3>
                  </div>

                  {selectedItem && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Item Original</label>
                          <p className="font-semibold">{selectedItem.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Categoria Atual</label>
                          <p className="font-semibold">{selectedItem.categoria}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Preço Atual</label>
                          <p className="font-semibold text-green-600">R$ {selectedItem.preco?.toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge variant={selectedItem.disponivel ? "default" : "secondary"} className="text-xs">
                            {selectedItem.disponivel ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Novos Dados */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</div>
                    <h3 className="font-semibold">Editar Informações</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-item-id" className="text-sm font-medium">ID do Item no Cardápio</Label>
                      <Input
                        id="edit-item-id"
                        value={editItemId}
                        onChange={(e) => setEditItemId(e.target.value)}
                        placeholder="Ex: CARD001, AC300, COMBO01..."
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        ID único para identificar este item no cardápio
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-item-price" className="text-sm font-medium">Preço de Venda *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                        <Input
                          id="edit-item-price"
                          type="number"
                          value={editItemPrice}
                          onChange={(e) => setEditItemPrice(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-item-name" className="text-sm font-medium">Nome no Cardápio *</Label>
                    <Input
                      id="edit-item-name"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      placeholder="Nome que aparecerá no cardápio"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-item-notes" className="text-sm font-medium">Observações</Label>
                    <Textarea
                      id="edit-item-notes"
                      value={editItemNotes}
                      onChange={(e) => setEditItemNotes(e.target.value)}
                      placeholder="Observações adicionais sobre o item (alergias, ingredientes especiais, etc.)"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Mudança de Categoria */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Alterar Categoria (Opcional)</Label>
                    <div className="flex gap-2">
                      <Select value={editItemCategory} onValueChange={setEditItemCategory}>
                        <SelectTrigger className="flex-1 h-11">
                          <SelectValue placeholder="Manter categoria atual" />
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
                        className="h-11 px-3 text-xs"
                        title="Gerenciar categorias"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para manter a categoria atual ({selectedItem?.categoria})
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção Lateral - Preview e Comparação */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                {/* Comparação Antes/Depois */}
                {editItemName && editItemPrice && (
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                        <TrendingUp className="w-5 h-5" />
                        Comparação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Antes */}
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Antes</h5>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{selectedItem?.nome}</p>
                              <p className="text-xs text-gray-600">{selectedItem?.categoria}</p>
                            </div>
                            <p className="font-bold text-gray-700">R$ {selectedItem?.preco?.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Depois */}
                        <div className="p-3 bg-white rounded-lg border border-orange-200">
                          <h5 className="text-sm font-medium text-orange-700 mb-2">Depois</h5>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{editItemName}</p>
                              <p className="text-xs text-gray-600">
                                {editItemCategory ?
                                  managedCategorias.find(c => c.id === editItemCategory)?.nome :
                                  selectedItem?.categoria}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-600">R$ {parseFloat(editItemPrice).toFixed(2)}</p>
                              {selectedItem?.custo && (
                                <p className="text-xs text-orange-500">
                                  Margem: {(((parseFloat(editItemPrice) - selectedItem.custo) / selectedItem.custo) * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Análise da Mudança */}
                        {selectedItem?.preco && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="text-sm font-medium text-blue-700 mb-2">Análise da Mudança</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-600">Diferença de preço:</span>
                                <span className={`font-medium ${
                                  parseFloat(editItemPrice) > selectedItem.preco ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {parseFloat(editItemPrice) > selectedItem.preco ? '+' : ''}
                                  R$ {(parseFloat(editItemPrice) - selectedItem.preco).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-600">Variação:</span>
                                <span className={`font-medium ${
                                  parseFloat(editItemPrice) > selectedItem.preco ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {((parseFloat(editItemPrice) - selectedItem.preco) / selectedItem.preco * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Informações do Item Original */}
                {selectedItem && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Informações do Item Original
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-medium">CUSTO</p>
                            <p className="text-lg font-bold text-red-700">R$ {selectedItem.custo?.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium">MARGEM ATUAL</p>
                            <p className="text-lg font-bold text-blue-700">{selectedItem.margem?.toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={selectedItem.disponivel ? "default" : "secondary"} className="text-xs">
                              {selectedItem.disponivel ? "Disponível" : "Indisponível"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dicas */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">💡</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-900 text-sm">Dicas de Edição</h4>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                          <li>• Mantenha nomes claros e atrativos</li>
                          <li>• Considere o impacto nas margens</li>
                          <li>• Atualize preços conforme mercado</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  resetEditForm();
                }}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                disabled={!editItemName || !editItemPrice}
                onClick={() => {
                  const novoPreco = parseFloat(editItemPrice);
                  if (selectedItem && novoPreco && novoPreco > 0) {
                    setManagedCategorias(prev =>
                      prev.map(categoria => ({
                        ...categoria,
                        itens: categoria.itens.map(item =>
                          item.id === selectedItem.id
                            ? {
                                ...item,
                                nome: editItemName,
                                preco: novoPreco,
                                margem: ((novoPreco - item.custo) / item.custo) * 100
                              }
                            : item
                        )
                      }))
                    );
                  }
                  setEditModalOpen(false);
                  resetEditForm();
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
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Adicionar Novo Item ao Cardápio</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Configure um novo item para seu cardápio de forma rápida e fácil
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Seção Principal - Formulário */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                {/* Step 1: Categoria e Tipo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</div>
                    <h3 className="font-semibold">Categoria e Tipo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-select" className="text-sm font-medium">Categoria *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedItemCategory} onValueChange={setSelectedItemCategory}>
                          <SelectTrigger className="flex-1 h-11">
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
                          className="h-11 px-3 text-xs"
                          title="Gerenciar categorias"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item-type" className="text-sm font-medium">Tipo do Item *</Label>
                      <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                        <SelectTrigger className="h-11">
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
                      <Label htmlFor="item-search" className="text-sm font-medium">Buscar Item Existente</Label>
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
                          {mockData[selectedItemType as keyof typeof mockData]?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{item.nome}</span>
                                <span className="text-xs text-muted-foreground ml-2">{item.id}</span>
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
                  {selectedSearchItem && (
                    <div className="space-y-2">
                      <Label htmlFor="item-quantity" className="text-sm font-medium">
                        Quantidade *
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="item-quantity"
                          type="number"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                          placeholder="1"
                          step={selectedItemType === "insumo" ? "0.001" : "1"}
                          min="0.001"
                          className="h-11 flex-1"
                        />
                        <div className="text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded border min-w-[60px] text-center">
                          {selectedSearchItem.unidade || (selectedItemType === "insumo" ? "g" : "un")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedItemType === "insumo"
                          ? `Quantidade em ${selectedSearchItem.unidade || 'gramas'} conforme o insumo (ex: 0.2 para 200g se unidade for kg)`
                          : selectedItemType === "receita"
                          ? "Quantidade em gramas da receita utilizada"
                          : "Quantidade em unidades do item (copos base ou combinados)"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2: Detalhes do Item */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</div>
                    <h3 className="font-semibold">Detalhes do Item</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-id" className="text-sm font-medium">ID do Item no Cardápio</Label>
                      <Input
                        id="item-id"
                        value={itemId}
                        onChange={(e) => setItemId(e.target.value)}
                        placeholder="Ex: CARD001, AC300, COMBO01..."
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        ID único para identificar este item no cardápio (diferente do ID do insumo)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-price" className="text-sm font-medium">Preço de Venda *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                        <Input
                          id="item-price"
                          type="number"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="item-name" className="text-sm font-medium">Nome no Cardápio *</Label>
                    <Input
                      id="item-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Nome que aparecerá no cardápio"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="item-notes" className="text-sm font-medium">Observações</Label>
                    <Textarea
                      id="item-notes"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Observações adicionais sobre o item (alergias, ingredientes especiais, etc.)"
                      rows={3}
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
                              <p className="text-lg font-bold text-green-600">R$ {parseFloat(itemPrice).toFixed(2)}</p>
                              {selectedSearchItem && itemQuantity && (
                                <>
                                  <p className="text-xs text-gray-500">
                                    Qtd: {parseFloat(itemQuantity)}{selectedSearchItem.unidade}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Margem: {(((parseFloat(itemPrice) - (selectedSearchItem.custo * parseFloat(itemQuantity))) / (selectedSearchItem.custo * parseFloat(itemQuantity))) * 100).toFixed(1)}%
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
                                (selectedSearchItem.custo * parseFloat(itemQuantity)).toFixed(4) :
                                selectedSearchItem.custo?.toFixed(4) || '0.0000'
                              }
                            </p>
                            {itemQuantity && (
                              <p className="text-xs text-red-500">
                                {parseFloat(itemQuantity)}{selectedSearchItem.unidade} × R$ {selectedSearchItem.custo?.toFixed(4)}/{selectedSearchItem.unidade}
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
                                      {margem.toFixed(1)}%
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
                                  (parseFloat(itemPrice) - (selectedSearchItem.custo * parseFloat(itemQuantity))).toFixed(2)
                                  : (parseFloat(itemPrice) - selectedSearchItem.custo).toFixed(2)
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
                          <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{comp.insumo.nome}</p>
                                    <p className="text-xs text-gray-600">{comp.insumo.id}</p>
                                  </div>
                                </div>

                                <div className="ml-11 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm text-blue-700 font-medium">
                                      {comp.insumo.fornecedorPadrao}
                                    </span>
                                    <span className="text-xs text-gray-500">(Fornecedor)</span>
                                  </div>

                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Quantidade:</span>
                                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {comp.quantidade}{comp.insumo.unidade}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Custo/unidade:</span>
                                      <span>R$ {(comp.custo / comp.quantidade).toFixed(4)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right ml-4">
                                <div className="bg-white px-3 py-2 rounded-lg border shadow-sm">
                                  <p className="text-sm text-gray-600">Custo Total</p>
                                  <p className="text-lg font-bold text-red-700">R$ {comp.custo.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Totalizador */}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Calculator className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-lg text-gray-900">Custo Total do Produto</div>
                                <div className="text-sm text-gray-600">
                                  {selectedSearchItem.composicao.length} insumo{selectedSearchItem.composicao.length > 1 ? 's' : ''} •
                                  {itemQuantity && ` ${parseFloat(itemQuantity)} unidades`}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-700">
                                {itemQuantity ?
                                  `R$ ${calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity), selectedItemType).toFixed(4)}` :
                                  `R$ ${selectedSearchItem.custo.toFixed(4)}`
                                }
                              </div>
                              {itemQuantity && (
                                <div className="text-sm text-gray-600">
                                  R$ {selectedSearchItem.custo.toFixed(4)}/{selectedSearchItem.unidade} × {parseFloat(itemQuantity)}{selectedSearchItem.unidade}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resumo de Fornecedores Aprimorado */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <Users className="w-2.5 h-2.5 text-white" />
                            </div>
                            Fornecedores Envolvidos
                          </h5>
                          <div className="grid grid-cols-1 gap-2">
                            {Array.from(new Set(selectedSearchItem.composicao.map((comp: any) => comp.insumo.fornecedorPadrao)))
                              .map((fornecedor: string, index: number) => {
                                const itensDoFornecedor = selectedSearchItem.composicao.filter((comp: any) => comp.insumo.fornecedorPadrao === fornecedor);
                                const custoTotal = itensDoFornecedor.reduce((sum: number, comp: any) => sum + comp.custo, 0);
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span className="text-blue-900 font-medium text-sm">{fornecedor}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="text-blue-700">
                                        {itensDoFornecedor.length} item{itensDoFornecedor.length > 1 ? 's' : ''}
                                      </span>
                                      <span className="font-bold text-blue-900">
                                        R$ {custoTotal.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Análise de Margem */}
                {selectedSearchItem && itemPrice && itemQuantity && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Análise de Rentabilidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const custoCalculado = calcularCustoComQuantidade(selectedSearchItem, parseFloat(itemQuantity), selectedItemType);
                        const precoVenda = parseFloat(itemPrice);
                        const margem = calcularMargem(precoVenda, custoCalculado);
                        const lucroTotal = precoVenda - custoCalculado;
                        const classificacao = getMargemClassificacao(margem);

                        return (
                          <div className="space-y-4">
                            {/* Resumo Financeiro */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">CUSTO</p>
                                <p className="text-lg font-bold text-red-600">
                                  R$ {custoCalculado.toFixed(4)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">VENDA</p>
                                <p className="text-lg font-bold text-blue-600">
                                  R$ {precoVenda.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">LUCRO</p>
                                <p className={`text-lg font-bold ${getMargemColor(margem)}`}>
                                  R$ {lucroTotal.toFixed(4)}
                                </p>
                              </div>
                            </div>

                            {/* Indicador de Margem */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Margem de Lucro</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xl font-bold ${getMargemColor(margem)}`}>
                                    {margem.toFixed(1)}%
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

                              {/* Barra de Progresso da Margem */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    margem < 0 ? 'bg-red-500' :
                                    margem < 50 ? 'bg-orange-500' :
                                    margem < 100 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{width: `${Math.min(Math.max(margem, 0), 200)}%`}}
                                ></div>
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

                {/* Dicas */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">💡</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 text-sm">Dicas</h4>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• Use nomes claros e atrativos</li>
                          <li>• Considere margens entre 100-200%</li>
                          <li>• Adicione observações sobre alergias</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                disabled={!selectedItemCategory || !itemName || !itemPrice || (selectedSearchItem && !itemQuantity)}
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
                      quantidade: selectedSearchItem ? quantidade : undefined,
                      unidade: selectedSearchItem?.unidade || undefined,
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