import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { combinadoSchema, CombinadoFormData } from "@/types/forms";
import { Combinado } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { formatarMoeda, calcularCustoPorGrama } from "@/utils/calculations";
import { Plus, Trash2 } from "lucide-react";

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
  
  const form = useForm<CombinadoFormData>({
    resolver: zodResolver(combinadoSchema),
    defaultValues: {
      nome: combinado?.nome || "",
      descricao: combinado?.descricao || "",
      categoriaId: combinado?.categoriaId || "",
      copoBaseId: combinado?.copoBaseId || "",
      ativo: combinado?.ativo ?? true,
      complementos: combinado?.complementos?.map(comp => ({
        tipo: comp.tipo,
        insumoId: comp.insumoId || "",
        receitaId: comp.receitaId || "",
        quantidade: comp.quantidade,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "complementos",
  });

  const handleSubmit = (data: CombinadoFormData) => {
    onSubmit(data);
  };

  const categorias = state.categorias.filter(c => c.ativo);
  const coposBase = state.coposBase.filter(c => c.ativo);
  const insumos = state.insumos.filter(i => i.ativo);
  const receitas = state.receitas.filter(r => r.ativo);

  const calcularCustoCopoBase = () => {
    const copoBaseId = form.watch("copoBaseId");
    if (copoBaseId) {
      const copoBase = coposBase.find(c => c.id === copoBaseId);
      return copoBase?.custoTotal || 0;
    }
    return 0;
  };

  const calcularCustoComplementos = () => {
    const complementos = form.watch("complementos") || [];
    return complementos.reduce((total, comp) => {
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
  };

  const calcularCustoTotal = () => {
    return calcularCustoCopoBase() + calcularCustoComplementos();
  };

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <div className="font-semibold">{formatarMoeda(calcularCustoCopoBase())}</div>
            </div>
          </CardContent>
        </Card>

        {/* Complements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Complementos
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ tipo: 'INSUMO', insumoId: "", receitaId: "", quantidade: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`complementos.${index}.tipo`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Tipo</FormLabel>}
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

                {form.watch(`complementos.${index}.tipo`) === 'INSUMO' ? (
                  <FormField
                    control={form.control}
                    name={`complementos.${index}.insumoId`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>Item</FormLabel>}
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um insumo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {insumos.map((insumo) => {
                              const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
                              return (
                                <SelectItem key={insumo.id} value={insumo.id}>
                                  {insumo.nome} ({formatarMoeda(custoPorGrama)}/g)
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
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
                        {index === 0 && <FormLabel>Item</FormLabel>}
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma receita" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {receitas.map((receita) => (
                              <SelectItem key={receita.id} value={receita.id}>
                                {receita.nome} ({formatarMoeda(receita.custoPorGrama)}/g)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name={`complementos.${index}.quantidade`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Quantidade (g)</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Custo dos Complementos</div>
              <div className="font-semibold">{formatarMoeda(calcularCustoComplementos())}</div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Custo Copo Base</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoCopoBase())}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Custo Complementos</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoComplementos())}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Custo Total</div>
                <div className="text-lg font-semibold text-primary">
                  {formatarMoeda(calcularCustoTotal())}
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
    </Form>
  );
};