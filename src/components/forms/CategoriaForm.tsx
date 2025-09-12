import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { categoriaSchema, CategoriaFormData } from "@/types/forms";
import { Categoria } from "@/types/database";

interface CategoriaFormProps {
  categoria?: Categoria;
  onSubmit: (data: CategoriaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  compact?: boolean; // Para versão compacta no step
}

const cores = [
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#06B6D4", // Cyan
  "#8B5A2B", // Brown
];

export const CategoriaForm = ({
  categoria,
  onSubmit,
  onCancel,
  isLoading = false,
  compact = false,
}: CategoriaFormProps) => {
  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: categoria?.nome || "",
      descricao: categoria?.descricao || "",
      cor: categoria?.cor || cores[0],
      ativo: categoria?.ativo ?? true,
    },
  });

  const handleSubmit = (data: CategoriaFormData) => {
    onSubmit(data);
  };

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Categoria *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Frutas, Cereais, Complementos..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex gap-2 flex-wrap">
                    {cores.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          field.value === cor
                            ? "border-foreground scale-110"
                            : "border-muted hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => field.onChange(cor)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Frutas, Cereais, Complementos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva esta categoria..."
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
          name="cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor da Categoria</FormLabel>
              <FormControl>
                <div className="flex gap-3 flex-wrap">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                        field.value === cor
                          ? "border-foreground scale-110"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => field.onChange(cor)}
                    />
                  ))}
                </div>
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
                <FormLabel className="text-base">Categoria Ativa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Quando desativada, não aparecerá nas listas de seleção
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
            {isLoading ? "Salvando..." : categoria ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};