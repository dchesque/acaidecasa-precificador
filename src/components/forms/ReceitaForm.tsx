import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { receitaSchema, ReceitaFormData } from "@/types/forms";
import { Receita } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { formatarMoeda, calcularCustoPorGrama } from "@/utils/calculations";
import { Plus, Trash2 } from "lucide-react";

interface ReceitaFormProps {
  receita?: Receita;
  onSubmit: (data: ReceitaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReceitaForm = ({
  receita,
  onSubmit,
  onCancel,
  isLoading = false,
}: ReceitaFormProps) => {
  const { state } = useAppContext();
  
  const form = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      nome: receita?.nome || "",
      descricao: receita?.descricao || "",
      categoriaId: receita?.categoriaId || "",
      rendimento: receita?.rendimento || 0,
      tempoPreparo: receita?.tempoPreparo || 0,
      instrucoes: receita?.instrucoes || "",
      ativo: receita?.ativo ?? true,
      ingredientes: receita?.ingredientes?.map(ing => ({
        insumoId: ing.insumoId,
        quantidade: ing.quantidade,
      })) || [{ insumoId: "", quantidade: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredientes",
  });

  const handleSubmit = (data: ReceitaFormData) => {
    onSubmit(data);
  };

  const categorias = state.categorias.filter(c => c.ativo);
  const insumos = state.insumos.filter(i => i.ativo);

  const calcularCustoTotal = () => {
    const ingredientes = form.watch("ingredientes");
    return ingredientes.reduce((total, ingrediente) => {
      if (ingrediente.insumoId && ingrediente.quantidade > 0) {
        const insumo = insumos.find(i => i.id === ingrediente.insumoId);
        if (insumo) {
          const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
          return total + (custoPorGrama * ingrediente.quantidade);
        }
      }
      return total;
    }, 0);
  };

  const calcularCustoPorGrama = () => {
    const custoTotal = calcularCustoTotal();
    const rendimento = form.watch("rendimento");
    return rendimento > 0 ? custoTotal / rendimento : 0;
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
                  <Input placeholder="Nome da receita" {...field} />
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
                  placeholder="Descrição da receita"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rendimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rendimento (gramas) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="500"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempoPreparo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo de Preparo (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="15"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Ingredientes
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ insumoId: "", quantidade: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`ingredientes.${index}.insumoId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel>Insumo</FormLabel>}
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

                <FormField
                  control={form.control}
                  name={`ingredientes.${index}.quantidade`}
                  render={({ field }) => (
                    <FormItem className="w-32">
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
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Custo Total</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoTotal())}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Custo por Grama</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoPorGrama())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="instrucoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções de Preparo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instruções de preparo da receita"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Receita Ativa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Quando desativada, a receita não aparecerá nas listas de seleção
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
            {isLoading ? "Salvando..." : receita ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};