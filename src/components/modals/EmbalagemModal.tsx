import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { EmbalagemForm } from "@/components/forms/EmbalagemForm";
import { useAppContext } from "@/contexts/AppContext";
import { EmbalagemFormData } from "@/types/forms";
import { Embalagem } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoPorUnidade } from "@/utils/calculations";

interface EmbalagemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embalagem?: Embalagem;
}

export const EmbalagemModal = ({
  open,
  onOpenChange,
  embalagem,
}: EmbalagemModalProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EmbalagemFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);
      const fornecedorPrincipal = state.fornecedores.find(f => f.id === data.fornecedorPrincipalId);
      const fornecedorAlternativo = data.fornecedorAlternativoId 
        ? state.fornecedores.find(f => f.id === data.fornecedorAlternativoId)
        : undefined;

      if (embalagem) {
        // Update existing packaging
        const updatedEmbalagem: Embalagem = {
          ...embalagem,
          ...data,
          categoria,
          fornecedorPrincipal,
          fornecedorAlternativo,
          custoPorUnidade: calcularCustoPorUnidade({ precoPrincipal: data.precoPrincipal }),
          updatedAt: now,
        };

        dispatch({ type: 'UPDATE_EMBALAGEM', payload: updatedEmbalagem });
        toast({
          title: "Embalagem atualizada",
          description: "Embalagem atualizada com sucesso!",
        });
      } else {
        // Create new packaging
        const newEmbalagem: Embalagem = {
          id: Date.now().toString(),
          ...data,
          categoria,
          fornecedorPrincipal,
          fornecedorAlternativo,
          custoPorUnidade: calcularCustoPorUnidade({ precoPrincipal: data.precoPrincipal }),
          createdAt: now,
          updatedAt: now,
        };

        dispatch({ type: 'ADD_EMBALAGEM', payload: newEmbalagem });
        toast({
          title: "Embalagem criada",
          description: "Nova embalagem criada com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar embalagem. Tente novamente.",
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
      title={embalagem ? "Editar Embalagem" : "Nova Embalagem"}
      description={
        embalagem 
          ? "Edite as informações da embalagem" 
          : "Adicione uma nova embalagem ao sistema"
      }
      size="lg"
    >
      <EmbalagemForm
        embalagem={embalagem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};