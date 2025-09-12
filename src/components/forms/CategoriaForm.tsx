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
  // Roxos e Violetas
  "#8B5CF6", // Purple
  "#A855F7", // Purple-500
  "#9333EA", // Violet
  "#7C3AED", // Violet-600
  "#6366F1", // Indigo
  "#4F46E5", // Indigo-600
  
  // Azuis
  "#3B82F6", // Blue
  "#2563EB", // Blue-600
  "#1D4ED8", // Blue-700
  "#06B6D4", // Cyan
  "#0891B2", // Cyan-600
  "#0E7490", // Cyan-700
  
  // Verdes
  "#10B981", // Green
  "#059669", // Green-600
  "#047857", // Green-700
  "#84CC16", // Lime
  "#65A30D", // Lime-600
  "#16A34A", // Green-500
  
  // Amarelos e Laranjas
  "#F59E0B", // Yellow
  "#D97706", // Yellow-600
  "#B45309", // Yellow-700
  "#F97316", // Orange
  "#EA580C", // Orange-600
  "#DC2626", // Red-600
  
  // Vermelhos e Rosas
  "#EF4444", // Red
  "#DC2626", // Red-600
  "#B91C1C", // Red-700
  "#EC4899", // Pink
  "#DB2777", // Pink-600
  "#BE185D", // Pink-700
  
  // Neutros e Especiais
  "#6B7280", // Gray
  "#4B5563", // Gray-600
  "#374151", // Gray-700
  "#8B5A2B", // Brown
  "#92400E", // Amber-700
  "#1F2937", // Gray-800
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
                  <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-muted/20">
                    {cores.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-105 ${
                          field.value === cor
                            ? "border-foreground scale-110 shadow-lg"
                            : "border-muted hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => field.onChange(cor)}
                        title={cor}
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
                <div className="grid grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/20">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                        field.value === cor
                          ? "border-foreground scale-110 shadow-lg"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => field.onChange(cor)}
                      title={cor}
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