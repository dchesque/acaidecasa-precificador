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
import { formatarMoeda, calcularCustoPorGrama } from "@/utils/calculations";
import { Plus, Trash2, Calculator, Package, Tags } from "lucide-react";
import { CategoriaModal } from "@/components/modals/CategoriaModal";
import { Categoria } from "@/types/database";

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
  const { state } = useAppContext();
  const [categoriaModalOpen, setCategoriaModalOpen] = React.useState(false);
  
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

  const handleCategoriaCreated = (novaCategoria: Categoria) => {
    form.setValue("categoriaId", novaCategoria.id);
    setCategoriaModalOpen(false);
  };

  const categorias = state.categorias.filter(c => c.ativo);
  const coposBase = state.coposBase.filter(c => c.ativo);
  const insumos = state.insumos.filter(i => i.ativo);
  const receitas = state.receitas.filter(r => r.ativo);

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
          const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
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
  }, [complementosSelecionados, insumos, receitas, state.insumoFornecedores]);

  const custoTotal = React.useMemo(() => {
    return custoCopoBase + custoComplementos;
  }, [custoCopoBase, custoComplementos]);

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
                        {categorias.map((categoria) => (
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
                      {coposBase.map((copoBase) => (
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

            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Custo do Copo Base</div>
              <div className="font-semibold">{formatarMoeda(custoCopoBase)}</div>
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const complemento = complementosSelecionados?.[index];
                      let custoUnitario = 0;
                      let custoTotalItem = 0;
                      let unidade = "";
                      let itemInfo = null;

                      if (complemento?.tipo === 'INSUMO' && complemento.insumoId) {
                        const insumo = insumos.find(i => i.id === complemento.insumoId);
                        if (insumo) {
                          custoUnitario = calcularCustoPorGrama(insumo, state.insumoFornecedores);
                          custoTotalItem = custoUnitario * (complemento.quantidade || 0);
                          unidade = insumo.unidadeMedida?.sigla || "g";
                          itemInfo = insumo;
                        }
                      } else if (complemento?.tipo === 'RECEITA' && complemento.receitaId) {
                        const receita = receitas.find(r => r.id === complemento.receitaId);
                        if (receita) {
                          custoUnitario = receita.custoPorGrama;
                          custoTotalItem = custoUnitario * (complemento.quantidade || 0);
                          unidade = "g";
                          itemInfo = receita;
                        }
                      }


                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`complementos.${index}.tipo`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="w-[120px]">
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
                          </TableCell>

                          <TableCell>
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
                                        placeholder="Selecione uma receita"
                                        options={receitas}
                                        renderOption={(receita) => ({
                                          value: receita.id,
                                          label: receita.nome,
                                          details: `Custo: R$ ${receita.custoPorGrama.toFixed(4)}/g`
                                        })}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </TableCell>

                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`complementos.${index}.quantidade`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="0"
                                        className="w-20 text-right"
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-700 mb-1">💡 Informação</div>
                <div className="text-xs text-blue-700">
                  Este combinado terá um custo total de {formatarMoeda(custoTotal)} considerando todos os insumos e complementos.
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


