import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { combinadoSchema, CombinadoFormData } from "@/types/forms";
import { Combinado } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { formatarMoeda, formatarCustoPorUnidade, calcularCustoPorGrama, calcularPrecoVendaCombinado, calcularEconomiaCombinado } from "@/utils/calculations";
import { Plus, Trash2, Calculator, Package, Tags, Settings, ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CombinadoFormProps {
  combinado?: Combinado;
  onSubmit: (data: CombinadoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CombinadoForm = ({
  combinado,
  onSubmit,
  onCancel,
  isLoading = false,
}: CombinadoFormProps) => {
  const { state, dispatch, categorias, coposBase, insumos, receitas, cardapio, insumoFornecedores, getPrecoVendaItem } = useAppContext();
  const confirm = useConfirm();
  const [categoriaModalOpen, setCategoriaModalOpen] = React.useState(false);

  // Estados para modal de categorias (padrão cardápio)
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryIcon, setNewCategoryIcon] = React.useState("Package");
  const [newCategoryColor, setNewCategoryColor] = React.useState("#8B5CF6");
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState("");
  const [editCategoryIcon, setEditCategoryIcon] = React.useState("Package");
  const [editCategoryColor, setEditCategoryColor] = React.useState("#8B5CF6");
  const [iconScrollIndex, setIconScrollIndex] = React.useState(0);
  const [colorScrollIndex, setColorScrollIndex] = React.useState(0);

  // Configuração de ícones disponíveis
  const availableIcons = [
    { name: "Package", icon: Package },
    { name: "Calculator", icon: Calculator },
    { name: "Plus", icon: Plus },
    { name: "Tags", icon: Tags },
    { name: "Settings", icon: Settings },
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
  
  const form = useForm<CombinadoFormData>({
    resolver: zodResolver(combinadoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoriaId: "",
      copoBaseId: "",
      ativo: true,
      complementos: [],
    },
  });

  // Reset form when combinado changes (for edit mode)
  React.useEffect(() => {
    if (combinado) {
      const categoriaId = combinado.categoriaId || combinado.categoria?.id || "";
      const copoBaseId = combinado.copoBaseId || combinado.copoBase?.id || "";
      const complementos = (combinado.complementos ?? []).map((comp) => ({
        tipo: comp.tipo,
        insumoId: comp.insumoId || comp.insumo?.id || "",
        receitaId: comp.receitaId || comp.receita?.id || "",
        quantidade: comp.quantidade ?? 0,
      }));

      form.reset({
        nome: combinado.nome,
        descricao: combinado.descricao || "",
        categoriaId,
        copoBaseId,
        ativo: combinado.ativo,
        complementos,
      });
    } else {
      // Reset for new combinado
      form.reset({
        nome: "",
        descricao: "",
        categoriaId: "",
        copoBaseId: "",
        ativo: true,
        complementos: [],
      });
    }
  }, [combinado, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "complementos",
  });

  const handleSubmit = (data: CombinadoFormData) => {
    onSubmit(data);
  };

  // Funções do modal de categorias (padrão cardápio)
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

    // Selecionar automaticamente a categoria recém-criada
    form.setValue("categoriaId", newCategory.id);

    // Reset form
    setNewCategoryName("");
    setNewCategoryIcon("Package");
    setNewCategoryColor("#8B5CF6");
    setCategoriaModalOpen(false);

    console.log("✅ Categoria de combinado criada com sucesso:", newCategory.nome);
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
      descricao: `Categoria de combinados: ${editCategoryName.trim()}`,
      cor: editCategoryColor,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategory });

    console.log("✅ Categoria de combinado editada com sucesso:", editCategoryName.trim());

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

  const categoriasAtivas = categorias.filter(c => c.ativo);
  const coposBaseAtivos = coposBase.filter(c => c.ativo);
  const insumosAtivos = insumos.filter(i => i.ativo);
  const receitasAtivas = receitas.filter(r => r.ativo);

  // Component for searchable select
  const SearchableSelect = <T,>({
    value,
    onValueChange,
    placeholder,
    options,
    renderOption
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: T[];
    renderOption: (item: T) => { value: string; label: string; details: string };
  }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {value
              ? (() => {
                  const item = options.find(opt => renderOption(opt).value === value);
                  return item ? renderOption(item).label : placeholder;
                })()
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const { value: optValue, label, details } = renderOption(option);
                  return (
                    <CommandItem
                      key={optValue}
                      value={`${label} ${details}`}
                      onSelect={() => {
                        onValueChange(optValue === value ? "" : optValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === optValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">{details}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  // Watch form values for real-time calculations
  const copoBaseId = useWatch({
    control: form.control,
    name: "copoBaseId"
  });

  const complementosSelecionados = useWatch({
    control: form.control,
    name: "complementos"
  });

  // Calculate costs using useMemo for optimization
  const custoCopoBase = React.useMemo(() => {
    if (copoBaseId) {
      const copoBase = coposBase.find(c => c.id === copoBaseId);
      return copoBase?.custoTotal || 0;
    }
    return 0;
  }, [copoBaseId, coposBase]);

  const custoComplementos = React.useMemo(() => {
    if (!complementosSelecionados) return 0;
    return complementosSelecionados.reduce((total, comp) => {
      if (comp.tipo === 'INSUMO' && comp.insumoId && comp.quantidade > 0) {
        const insumo = insumos.find(i => i.id === comp.insumoId);
        if (insumo) {
          const custoPorGrama = calcularCustoPorGrama(insumo, insumoFornecedores);
          return total + (custoPorGrama * comp.quantidade);
        }
      } else if (comp.tipo === 'RECEITA' && comp.receitaId && comp.quantidade > 0) {
        const receita = receitas.find(r => r.id === comp.receitaId);
        if (receita) {
          return total + (receita.custoPorGrama * comp.quantidade);
        }
      }
      return total;
    }, 0);
  }, [complementosSelecionados, insumos, receitas, insumoFornecedores]);

  const custoTotal = React.useMemo(() => {
    return custoCopoBase + custoComplementos;
  }, [custoCopoBase, custoComplementos]);

  // Cálculos de preços de venda
  const precoVendaCopoBase = React.useMemo(() => {
    if (copoBaseId) {
      return getPrecoVendaItem('COPO_BASE', copoBaseId);
    }
    return null;
  }, [copoBaseId, getPrecoVendaItem]);

  const precoVendaComplementos = React.useMemo(() => {
    if (!complementosSelecionados) return 0;
    return complementosSelecionados.reduce((total, comp) => {
      if (comp.tipo === 'INSUMO' && comp.insumoId && comp.quantidade > 0) {
        const precoVenda = getPrecoVendaItem('INSUMO', comp.insumoId);
        if (precoVenda) {
          // Preço de venda é unitário por complemento, não por quantidade
          return total + precoVenda;
        }
      } else if (comp.tipo === 'RECEITA' && comp.receitaId && comp.quantidade > 0) {
        const precoVenda = getPrecoVendaItem('RECEITA', comp.receitaId);
        if (precoVenda) {
          // Preço de venda é unitário por complemento, não por quantidade
          return total + precoVenda;
        }
      }
      return total;
    }, 0);
  }, [complementosSelecionados, getPrecoVendaItem]);

  const precoVendaTotal = React.useMemo(() => {
    const precoBase = precoVendaCopoBase || 0;
    return precoBase + precoVendaComplementos;
  }, [precoVendaCopoBase, precoVendaComplementos]);

  // Verificar se todos os itens têm preço no cardápio
  const temPrecoCompleto = React.useMemo(() => {
    if (!copoBaseId) return false;
    const baseTemPreco = precoVendaCopoBase !== null;
    const complementosComPreco = complementosSelecionados?.every(comp => {
      if (comp.tipo === 'INSUMO' && comp.insumoId) {
        return getPrecoVendaItem('INSUMO', comp.insumoId) !== null;
      } else if (comp.tipo === 'RECEITA' && comp.receitaId) {
        return getPrecoVendaItem('RECEITA', comp.receitaId) !== null;
      }
      return false;
    }) ?? true;
    return baseTemPreco && complementosComPreco;
  }, [copoBaseId, precoVendaCopoBase, complementosSelecionados, getPrecoVendaItem]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do combinado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriasAtivas.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCategoriaModalOpen(true)}
                    title="Adicionar nova categoria"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do combinado"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Base Cup Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Copo Base</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="copoBaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copo Base *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um copo base" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coposBaseAtivos.map((copoBase) => (
                        <SelectItem key={copoBase.id} value={copoBase.id}>
                          {copoBase.nome} ({formatarMoeda(copoBase.custoTotal)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Custo do Copo Base</div>
                  <div className="font-semibold text-destructive">{formatarMoeda(custoCopoBase)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Preço de Venda</div>
                  <div className="flex items-center gap-1">
                    {precoVendaCopoBase !== null ? (
                      <>
                        <div className="font-semibold text-green-600">{formatarMoeda(precoVendaCopoBase)}</div>
                        <span className="text-green-600 cursor-help" title="Disponível no cardápio">✓</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground text-sm">Não disponível</span>
                        <span className="text-red-500 cursor-help" title="Não encontrado no cardápio">✗</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Complementos
                <Badge variant="secondary">{fields.length}</Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ tipo: 'INSUMO', insumoId: "", receitaId: "", quantidade: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Complemento
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-auto">Item</TableHead>
                      <TableHead className="text-center w-24">Quantidade</TableHead>
                      <TableHead className="text-right w-32">Custo Total</TableHead>
                      <TableHead className="text-right w-36">Preço de Venda</TableHead>
                      <TableHead className="text-center w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const complemento = complementosSelecionados?.[index];
                      let custoUnitario = 0;
                      let custoTotalItem = 0;
                      let precoVendaUnitario: number | null = null;
                      let precoVendaTotalItem = 0;
                      let unidade = "";
                      let itemInfo = null;
                      let temPrecoCardapio = false;

                      if (complemento?.tipo === 'INSUMO' && complemento.insumoId) {
                        const insumo = insumos.find(i => i.id === complemento.insumoId);
                        if (insumo) {
                          custoUnitario = calcularCustoPorGrama(insumo, insumoFornecedores);
                          custoTotalItem = custoUnitario * (complemento.quantidade || 0);
                          precoVendaUnitario = getPrecoVendaItem('INSUMO', complemento.insumoId);
                          precoVendaTotalItem = precoVendaUnitario ? precoVendaUnitario : 0; // Preço unitário, não multiplicado
                          unidade = insumo.unidadeMedida?.sigla || "g";
                          itemInfo = insumo;
                          temPrecoCardapio = precoVendaUnitario !== null;
                        }
                      } else if (complemento?.tipo === 'RECEITA' && complemento.receitaId) {
                        const receita = receitas.find(r => r.id === complemento.receitaId);
                        if (receita) {
                          custoUnitario = receita.custoPorGrama;
                          custoTotalItem = custoUnitario * (complemento.quantidade || 0);
                          precoVendaUnitario = getPrecoVendaItem('RECEITA', complemento.receitaId);
                          precoVendaTotalItem = precoVendaUnitario ? precoVendaUnitario : 0; // Preço unitário, não multiplicado
                          unidade = "g";
                          itemInfo = receita;
                          temPrecoCardapio = precoVendaUnitario !== null;
                        }
                      }


                      return (
                        <TableRow key={field.id}>
                          {/* Item - inclui tipo e seleção */}
                          <TableCell className="py-3 align-middle">
                            <div className="flex gap-2 items-center">
                              <FormField
                                control={form.control}
                                name={`complementos.${index}.tipo`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="w-24 h-8 text-xs">
                                          <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="INSUMO">Insumo</SelectItem>
                                        <SelectItem value="RECEITA">Receita</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                {complemento?.tipo === 'INSUMO' ? (
                                  <FormField
                                    control={form.control}
                                    name={`complementos.${index}.insumoId`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <SearchableSelect
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                            placeholder="Selecionar insumo"
                                            options={insumos}
                                            renderOption={(insumo) => ({
                                              value: insumo.id,
                                              label: insumo.nome,
                                              details: `${formatarCustoPorUnidade(calcularCustoPorGrama(insumo, insumoFornecedores))}/g`
                                            })}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  <FormField
                                    control={form.control}
                                    name={`complementos.${index}.receitaId`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <SearchableSelect
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                            placeholder="Selecionar receita"
                                            options={receitas}
                                            renderOption={(receita) => ({
                                              value: receita.id,
                                              label: receita.nome,
                                              details: `${formatarCustoPorUnidade(receita.custoPorGrama)}/g`
                                            })}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Quantidade */}
                          <TableCell className="text-center py-3 align-middle">
                            <FormField
                              control={form.control}
                              name={`complementos.${index}.quantidade`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-center gap-1">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <span className="text-xs text-muted-foreground">{unidade}</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Custo Total */}
                          <TableCell className="text-right py-3 align-middle">
                            <div className="text-sm font-medium text-destructive">
                              {custoTotalItem > 0 ? formatarCustoPorUnidade(custoTotalItem) : "-"}
                            </div>
                          </TableCell>

                          {/* Preço de Venda */}
                          <TableCell className="text-right py-3 align-middle">
                            <div className="text-sm font-medium">
                              {precoVendaUnitario !== null ? (
                                <div className="flex items-center justify-end gap-1">
                                  <div className="text-green-600 font-medium">{formatarMoeda(precoVendaUnitario)}</div>
                                  {temPrecoCardapio ? (
                                    <span
                                      className="text-green-600 cursor-help"
                                      title="Disponível no cardápio para venda individual"
                                    >
                                      ✓
                                    </span>
                                  ) : (
                                    <span
                                      className="text-red-500 cursor-help"
                                      title="Não disponível no cardápio para venda individual"
                                    >
                                      ✗
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-muted-foreground text-xs">Não disponível</span>
                                  <span
                                    className="text-red-500 cursor-help"
                                    title="Item não encontrado no cardápio"
                                  >
                                    ✗
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Ações */}
                          <TableCell className="text-center py-3 align-middle">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              aria-label="Remover complemento"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum complemento adicionado</p>
                <p className="text-sm">Clique em &quot;Adicionar Complemento&quot; para começar</p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">Custo dos Complementos:</span>
              </div>
              <span className="font-bold text-destructive">{formatarMoeda(custoComplementos)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumo de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Copo Base:</span>
                    <span className="font-semibold">{formatarMoeda(custoCopoBase)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Complementos:</span>
                    <span className="font-semibold">{formatarMoeda(custoComplementos)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <span className="font-semibold">Custo Total:</span>
                    <span className="text-lg font-bold text-destructive">
                      {formatarMoeda(custoTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Preços de Venda
                {temPrecoCompleto && (
                  <Badge variant="default" className="ml-2">
                    Completo
                  </Badge>
                )}
                {!temPrecoCompleto && (
                  <Badge variant="secondary" className="ml-2">
                    Incompleto
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Copo Base:</span>
                    <span className="font-semibold">
                      {precoVendaCopoBase !== null ? (
                        <span className="text-green-600">{formatarMoeda(precoVendaCopoBase)}</span>
                      ) : (
                        <span className="text-muted-foreground">Não no cardápio</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Complementos:</span>
                    <span className="font-semibold">
                      {precoVendaComplementos > 0 ? (
                        <span className="text-green-600">{formatarMoeda(precoVendaComplementos)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                    <span className="font-semibold">Preço Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {precoVendaTotal > 0 ? formatarMoeda(precoVendaTotal) : "Incompleto"}
                    </span>
                  </div>
                </div>
                {temPrecoCompleto && precoVendaTotal > custoTotal && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-xs text-green-700 mb-1">💰 Economia para o cliente</div>
                    <div className="text-xs text-green-700">
                      Vendido separado: {formatarMoeda(precoVendaTotal)} | Como combo: {custoTotal > 0 ? "A definir" : formatarMoeda(custoTotal)}
                    </div>
                  </div>
                )}
                {!temPrecoCompleto && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-xs text-yellow-700 mb-1">⚠️ Preços incompletos</div>
                    <div className="text-xs text-yellow-700">
                      Alguns itens não estão disponíveis no cardápio. Adicione-os para calcular preços de venda.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Combinado Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Quando desativado, o combinado não aparecerá nas listas de seleção
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : combinado ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>

      {/* Modal de Gerenciar Categorias - Padrão Cardápio */}
      <Dialog open={categoriaModalOpen} onOpenChange={setCategoriaModalOpen}>
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
                  {categoriasAtivas.map((categoria) => {
                    const isEditing = editingCategory === categoria.id;

                    return (
                      <div
                        key={categoria.id}
                        className={`flex items-center gap-3 p-2 border rounded-lg transition-all ${
                          isEditing ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: categoria.cor || "#8B5CF6" }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
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
                            <Settings className="w-3 h-3" aria-hidden="true" />
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
            <Button variant="outline" onClick={() => setCategoriaModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
};


