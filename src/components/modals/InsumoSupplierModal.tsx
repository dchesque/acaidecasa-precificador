import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseModal } from "./BaseModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useAppContext } from "@/contexts/AppContext";
import { InsumoFornecedor } from "@/types/database";
import { formatarCustoPorUnidade } from "@/utils/calculations";
import { z } from "zod";

const insumoSupplierSchema = z
  .object({
    fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
    precoBruto: z.number().min(0.01, "Preço bruto deve ser maior que zero"),
    precoComDesconto: z.number().min(0).optional(),
    quantidadeComprada: z.number().min(0.001, "Quantidade deve ser maior que zero"),
    usarPrecoComDesconto: z.boolean().default(false),
    prazoEntrega: z.number().min(0).optional(),
    observacoes: z.string().optional(),
    ativo: z.boolean().default(true),
  })
  .refine(
    (data) =>
      !data.precoComDesconto ||
      data.precoComDesconto === 0 ||
      data.precoComDesconto <= data.precoBruto,
    {
      message: "Preço com desconto deve ser menor ou igual ao preço bruto",
      path: ["precoComDesconto"],
    }
  );

type InsumoSupplierFormData = z.infer<typeof insumoSupplierSchema>;

interface InsumoSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InsumoSupplierFormData) => void;
  editingSupplier?: InsumoFornecedor;
  excludedSupplierIds?: string[];
}

export const InsumoSupplierModal = ({
  open,
  onOpenChange,
  onSave,
  editingSupplier,
  excludedSupplierIds = [],
}: InsumoSupplierModalProps) => {
  const { state } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsumoSupplierFormData>({
    resolver: zodResolver(insumoSupplierSchema),
    defaultValues: {
      fornecedorId: editingSupplier?.fornecedorId || "",
      precoBruto: editingSupplier?.precoBruto || 0,
      precoComDesconto: editingSupplier?.precoComDesconto || 0,
      quantidadeComprada: editingSupplier?.quantidadeComprada || 1,
      usarPrecoComDesconto: editingSupplier?.usarPrecoComDesconto || false,
      prazoEntrega: editingSupplier?.prazoEntrega || 0,
      observacoes: editingSupplier?.observacoes || "",
      ativo: editingSupplier?.ativo ?? true,
    },
  });

  const availableSuppliers = state.fornecedores.filter(
    f => f.ativo && !excludedSupplierIds.includes(f.id)
  );

  const handleSubmit = async (data: InsumoSupplierFormData) => {
    setIsLoading(true);
    try {
      onSave(data);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Calculate cost per unit
  const precoBruto = form.watch("precoBruto") || 0;
  const precoComDesconto = form.watch("precoComDesconto") || 0;
  const quantidadeComprada = form.watch("quantidadeComprada") || 1;
  const usarPrecoComDesconto = form.watch("usarPrecoComDesconto") || false;

  const precoParaCalculo = usarPrecoComDesconto && precoComDesconto > 0 ? precoComDesconto : precoBruto;
  const custoPorUnidade = quantidadeComprada > 0 ? precoParaCalculo / quantidadeComprada : 0;

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={editingSupplier ? "Editar Fornecedor do Insumo" : "Adicionar Fornecedor ao Insumo"}
      description={
        editingSupplier 
          ? "Edite as informações do fornecedor para este insumo" 
          : "Adicione um novo fornecedor com preços específicos para este insumo"
      }
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fornecedorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableSuppliers.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        <div>
                          <div className="font-medium">{fornecedor.nome}</div>
                          {fornecedor.telefone && (
                            <div className="text-xs text-muted-foreground">{fornecedor.telefone}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="precoBruto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Bruto (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
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
              name="precoComDesconto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço com Desconto (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantidadeComprada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Comprada *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="1,000"
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
              name="prazoEntrega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Entrega (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="usarPrecoComDesconto"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Usar Preço com Desconto</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Quando ativado, o preço com desconto será usado nos cálculos
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

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações específicas sobre este fornecedor..."
                    className="resize-none"
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
                  <FormLabel className="text-base">Fornecedor Ativo</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Quando desativado, não aparecerá como opção para este insumo
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

          {/* Cost calculation preview */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Custo por unidade:</span>
              <span className="font-bold text-lg text-primary">
                {formatarCustoPorUnidade(custoPorUnidade)}/un
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Baseado em: {formatarCustoPorUnidade(precoParaCalculo)} ÷ {quantidadeComprada} = {formatarCustoPorUnidade(custoPorUnidade)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : editingSupplier ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </Form>
    </BaseModal>
  );
};