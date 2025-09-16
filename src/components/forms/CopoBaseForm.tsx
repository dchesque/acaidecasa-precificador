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
import { copoBaseSchema, CopoBaseFormData } from "@/types/forms";
import { CopoBase } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { formatarMoeda, calcularCustoPorGrama } from "@/utils/calculations";
import { Plus, Trash2, Calculator, Package, Coffee, Tags } from "lucide-react";
import { CategoriaModal } from "@/components/modals/CategoriaModal";
import { Categoria } from "@/types/database";

interface CopoBaseFormProps {
  copoBase?: CopoBase;
  onSubmit: (data: CopoBaseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CopoBaseForm = ({
  copoBase,
  onSubmit,
  onCancel,
  isLoading = false,
}: CopoBaseFormProps) => {
  const { state } = useAppContext();
  const [categoriaModalOpen, setCategoriaModalOpen] = React.useState(false);

  const form = useForm<CopoBaseFormData>({
    resolver: zodResolver(copoBaseSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoriaId: "",
      insumoBaseId: "",
      quantidadeBase: 0,
      ativo: true,
      insumos: [],
    },
  });

  // Reset form when copoBase changes (for edit mode)
  React.useEffect(() => {
    if (copoBase) {
      form.reset({
        nome: copoBase.nome,
        descricao: copoBase.descricao || "",
        categoriaId: copoBase.categoriaId || copoBase.categoria?.id || "",
        insumoBaseId: copoBase.insumoBaseId || copoBase.insumoBase?.id || "",
        quantidadeBase: copoBase.quantidadeBase ?? 0,
        ativo: copoBase.ativo,
        insumos: (copoBase.insumos ?? []).map((ins) => ({
          insumoId: ins.insumoId || ins.insumo?.id || "",
          quantidade: ins.quantidade ?? 0,
        })),
      });
    } else {
      // Reset for new copo base
      form.reset({
        nome: "",
        descricao: "",
        categoriaId: "",
        insumoBaseId: "",
        quantidadeBase: 0,
        ativo: true,
        insumos: [],
      });
    }
  }, [copoBase, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "insumos",
  });

  const handleSubmit = (data: CopoBaseFormData) => {
    onSubmit(data);
  };

  const handleCategoriaCreated = (novaCategoria: Categoria) => {
    form.setValue("categoriaId", novaCategoria.id);
    setCategoriaModalOpen(false);
  };

  const categorias = state.categorias.filter(c => c.ativo);
  const insumos = state.insumos.filter(i => i.ativo);

  // Component for searchable select
  const SearchableSelect = ({
    value,
    onValueChange,
    placeholder,
    options,
    renderOption
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: any[];
    renderOption: (item: any) => { value: string; label: string; details: string };
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
  const insumoBaseId = useWatch({
    control: form.control,
    name: "insumoBaseId"
  });

  const quantidadeBase = useWatch({
    control: form.control,
    name: "quantidadeBase"
  });

  const insumosSelecionados = useWatch({
    control: form.control,
    name: "insumos"
  });

  // Calculate costs using useMemo for optimization
  const custoBase = React.useMemo(() => {
    if (insumoBaseId && quantidadeBase > 0) {
      const insumo = insumos.find(i => i.id === insumoBaseId);
      if (insumo) {
        const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
        return custoPorGrama * quantidadeBase;
      }
    }
    return 0;
  }, [insumoBaseId, quantidadeBase, insumos, state.insumoFornecedores]);

  const custoInsumos = React.useMemo(() => {
    if (!insumosSelecionados) return 0;
    return insumosSelecionados.reduce((total, ins) => {
      if (ins.insumoId && ins.quantidade > 0) {
        const insumo = insumos.find(i => i.id === ins.insumoId);
        if (insumo) {
          const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
          return total + (custoPorGrama * ins.quantidade);
        }
      }
      return total;
    }, 0);
  }, [insumosSelecionados, insumos, state.insumoFornecedores]);

  const custoTotal = React.useMemo(() => {
    return custoBase + custoInsumos;
  }, [custoBase, custoInsumos]);

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
                  <Input placeholder="Nome do copo base" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCategoriaModalOpen(true)}
                    title="Adicionar nova categoria"
                  >
                    <Tags className="w-4 h-4" />
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
                  placeholder="Descrição do copo base"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Base Ingredient */}
        <Card>
          <CardHeader>
            <CardTitle>Insumo Base (Açaí/Cupuaçu/Sorvete)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insumoBaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insumo Base *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o insumo base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {insumos.map((insumo) => {
                          const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
                          return (
                            <SelectItem key={insumo.id} value={insumo.id}>
                              {insumo.nome} - R$ {custoPorGrama.toFixed(4)}/g
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidadeBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade (gramas) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="300"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Custo do Insumo Base</div>
              <div className="font-semibold">{formatarMoeda(custoBase)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Insumos Adicionais (Embalagens, etc)
                <Badge variant="secondary">{fields.length}</Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ insumoId: "", quantidade: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Insumo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const insumoSelecionado = insumosSelecionados?.[index];
                      let custoUnitario = 0;
                      let custoTotalItem = 0;
                      let unidade = "";

                      if (insumoSelecionado?.insumoId) {
                        const insumo = insumos.find(i => i.id === insumoSelecionado.insumoId);
                        if (insumo) {
                          custoUnitario = calcularCustoPorGrama(insumo, state.insumoFornecedores);
                          custoTotalItem = custoUnitario * (insumoSelecionado.quantidade || 0);
                          unidade = insumo.unidadeMedida?.sigla || "g";
                        }
                      }

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`insumos.${index}.insumoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <SearchableSelect
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      placeholder="Selecione um insumo"
                                      options={insumos}
                                      renderOption={(insumo) => {
                                        const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
                                        return {
                                          value: insumo.id,
                                          label: insumo.nome,
                                          details: `Custo: R$ ${custoPorGrama.toFixed(4)}/g`
                                        };
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`insumos.${index}.quantidade`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        className="w-20"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <span className="text-xs text-muted-foreground">{unidade}</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          <TableCell className="text-right text-sm">
                            {custoUnitario > 0 ? `R$ ${custoUnitario.toFixed(4)}` : "-"}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {custoTotalItem > 0 ? (
                              <span className="text-destructive">R$ {custoTotalItem.toFixed(4)}</span>
                            ) : (
                              "-"
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
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
                <p>Nenhum insumo adicional adicionado</p>
                <p className="text-sm">Clique em &quot;Adicionar Insumo&quot; para incluir embalagens e outros itens</p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">Custo dos Insumos Adicionais:</span>
              </div>
              <span className="font-bold text-lg">{formatarMoeda(custoInsumos)}</span>
            </div>

            {/* Cost Summary */}
            <div className="grid grid-cols-1 gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
              {/* Costs */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Resumo de Custos</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Insumo Base:</span>
                    <span className="font-semibold">{formatarMoeda(custoBase)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Insumos Adicionais:</span>
                    <span className="font-semibold">{formatarMoeda(custoInsumos)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <span className="font-semibold">Custo Total:</span>
                    <span className="text-lg font-bold text-destructive">
                      {formatarMoeda(custoTotal)}
                    </span>
                  </div>
                </div>
              </div>

              </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Copo Base Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Quando desativado, o copo base não aparecerá nas listas de seleção
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
            {isLoading ? "Salvando..." : copoBase ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>

      {/* Modal de Categoria */}
      <CategoriaModal
        open={categoriaModalOpen}
        onOpenChange={setCategoriaModalOpen}
        onCategoriaCreated={handleCategoriaCreated}
        compact={true}
      />
    </Form>
  );
};

