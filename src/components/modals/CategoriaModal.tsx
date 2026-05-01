import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { useAppContext } from "@/contexts/AppContext";
import { CategoriaFormData } from "@/types/forms";
import { Categoria } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { newId } from "@/lib/ids";

interface CategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: Categoria;
  compact?: boolean;
  onCategoriaCreated?: (categoria: Categoria) => void;
}

export const CategoriaModal = ({
  open,
  onOpenChange,
  categoria,
  compact = false,
  onCategoriaCreated,
}: CategoriaModalProps) => {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CategoriaFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      if (categoria) {
        // Update existing category
        const updatedCategoria: Categoria = {
          ...categoria,
          ...data,
          updatedAt: now,
        };
        dispatch({ type: 'UPDATE_CATEGORIA', payload: updatedCategoria });
        toast({
          title: "Categoria atualizada",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        // Create new category
        const newCategoria: Categoria = {
          ...data,
          id: newId(),
          createdAt: now,
          updatedAt: now,
        } as Categoria;
        dispatch({ type: 'ADD_CATEGORIA', payload: newCategoria });
        
        if (onCategoriaCreated) {
          onCategoriaCreated(newCategoria);
        }
        
        toast({
          title: "Categoria criada",
          description: "Nova categoria criada com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        compact 
          ? "Nova Categoria"
          : categoria 
            ? "Editar Categoria" 
            : "Nova Categoria"
      }
      description={
        compact
          ? "Crie uma nova categoria rapidamente"
          : categoria 
            ? "Edite as informações da categoria" 
            : "Adicione uma nova categoria ao sistema"
      }
      size={compact ? "md" : "lg"}
    >
      <CategoriaForm
        categoria={categoria}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        compact={compact}
      />
    </BaseModal>
  );
};