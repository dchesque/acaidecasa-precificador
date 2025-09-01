import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { FornecedorForm } from "@/components/forms/FornecedorForm";
import { useAppContext } from "@/contexts/AppContext";
import { FornecedorFormData } from "@/types/forms";
import { Fornecedor } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface FornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
}

export const FornecedorModal = ({
  open,
  onOpenChange,
  fornecedor,
}: FornecedorModalProps) => {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FornecedorFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      if (fornecedor) {
        // Update existing supplier
        const updatedFornecedor: Fornecedor = {
          ...fornecedor,
          ...data,
          updatedAt: now,
        };
        dispatch({ type: 'UPDATE_FORNECEDOR', payload: updatedFornecedor });
        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor atualizado com sucesso!",
        });
      } else {
        // Create new supplier
        const newFornecedor: Fornecedor = {
          ...data,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        } as Fornecedor;
        dispatch({ type: 'ADD_FORNECEDOR', payload: newFornecedor });
        toast({
          title: "Fornecedor criado",
          description: "Novo fornecedor criado com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor. Tente novamente.",
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
      title={fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      description={
        fornecedor 
          ? "Edite as informações do fornecedor" 
          : "Adicione um novo fornecedor ao sistema"
      }
      size="lg"
    >
      <FornecedorForm
        fornecedor={fornecedor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};