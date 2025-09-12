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
import { copoBaseSchema, CopoBaseFormData } from "@/types/forms";
import { CopoBase } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { formatarMoeda, calcularCustoPorGrama } from "@/utils/calculations";
import { Plus, Trash2 } from "lucide-react";

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
  
  const form = useForm<CopoBaseFormData>({
    resolver: zodResolver(copoBaseSchema),
    defaultValues: {
      nome: copoBase?.nome || "",
      descricao: copoBase?.descricao || "",
      categoriaId: copoBase?.categoriaId || "",
      insumoBaseId: copoBase?.insumoBaseId || "",
      quantidadeBase: copoBase?.quantidadeBase || 0,
      ativo: copoBase?.ativo ?? true,
      embalagens: copoBase?.embalagens?.map(emb => ({
        embalagemId: emb.embalagemId,
        quantidade: emb.quantidade,
      })) || [{ embalagemId: "", quantidade: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "embalagens",
  });

  const handleSubmit = (data: CopoBaseFormData) => {
    onSubmit(data);
  };

  const categorias = state.categorias.filter(c => c.ativo);
  const insumos = state.insumos.filter(i => i.ativo);
  const embalagens = state.embalagens.filter(e => e.ativo);

  const calcularCustoBase = () => {
    const insumoBaseId = form.watch("insumoBaseId");
    const quantidadeBase = form.watch("quantidadeBase");
    
    if (insumoBaseId && quantidadeBase > 0) {
      const insumo = insumos.find(i => i.id === insumoBaseId);
      if (insumo) {
        const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
        return custoPorGrama * quantidadeBase;
      }
    }
    return 0;
  };

  const calcularCustoEmbalagens = () => {
    const embalagensSelecionadas = form.watch("embalagens");
    return embalagensSelecionadas.reduce((total, emb) => {
      if (emb.embalagemId && emb.quantidade > 0) {
        const embalagem = embalagens.find(e => e.id === emb.embalagemId);
        if (embalagem) {
          return total + (embalagem.custoPorUnidade * emb.quantidade);
        }
      }
      return total;
    }, 0);
  };

  const calcularCustoTotal = () => {
    return calcularCustoBase() + calcularCustoEmbalagens();
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
            <CardTitle>Insumo Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insumoBaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insumo *</FormLabel>
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

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Custo do Insumo Base</div>
              <div className="font-semibold">{formatarMoeda(calcularCustoBase())}</div>
            </div>
          </CardContent>
        </Card>

        {/* Packaging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Embalagens
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ embalagemId: "", quantidade: 1 })}
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
                  name={`embalagens.${index}.embalagemId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel>Embalagem</FormLabel>}
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma embalagem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {embalagens.map((embalagem) => (
                            <SelectItem key={embalagem.id} value={embalagem.id}>
                              {embalagem.nome} ({formatarMoeda(embalagem.custoPorUnidade)}/un)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`embalagens.${index}.quantidade`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      {index === 0 && <FormLabel>Qtd</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="1"
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

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Custo das Embalagens</div>
              <div className="font-semibold">{formatarMoeda(calcularCustoEmbalagens())}</div>
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
                <div className="text-sm text-muted-foreground">Custo Base</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoBase())}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Custo Embalagens</div>
                <div className="text-lg font-semibold">
                  {formatarMoeda(calcularCustoEmbalagens())}
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
    </Form>
  );
};