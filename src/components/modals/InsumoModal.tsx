import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { InsumoForm } from "@/components/forms/InsumoForm";
import { useAppContext } from "@/contexts/AppContext";
import { useCalculations } from "@/hooks/useCalculations";
import { InsumoFormData } from "@/types/forms";
import { Insumo } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoPorGrama } from "@/utils/calculations";

interface InsumoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insumo?: Insumo;
}

export const InsumoModal = ({
  open,
  onOpenChange,
  insumo,
}: InsumoModalProps) => {
  const { state, dispatch } = useAppContext();
  const { recalcularInsumo } = useCalculations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InsumoFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);
      const unidadeMedida = state.unidadesMedida.find(u => u.id === data.unidadeMedidaId);
      const fornecedorPrincipal = state.fornecedores.find(f => f.id === data.fornecedorPrincipalId);
      const fornecedorAlternativo = data.fornecedorAlternativoId 
        ? state.fornecedores.find(f => f.id === data.fornecedorAlternativoId)
        : undefined;

      if (insumo) {
        // Update existing input
        const updatedInsumo: Insumo = {
          ...insumo,
          ...data,
          categoria,
          unidadeMedida,
          fornecedorPrincipal,
          fornecedorAlternativo,
          updatedAt: now,
        };

        // Calculate costs
        const custoPorGrama = calcularCustoPorGrama(updatedInsumo);
        updatedInsumo.custoPorGrama = custoPorGrama;
        updatedInsumo.custoPorUnidade = unidadeMedida?.tipo === 'UNIDADE' 
          ? data.precoPrincipal 
          : custoPorGrama;

        dispatch({ type: 'UPDATE_INSUMO', payload: updatedInsumo });
        toast({
          title: "Insumo atualizado",
          description: "Insumo atualizado com sucesso!",
        });
      } else {
        // Create new input
        const newInsumo: Insumo = {
          id: Date.now().toString(),
          ...data,
          categoria,
          unidadeMedida,
          fornecedorPrincipal,
          fornecedorAlternativo,
          custoPorGrama: 0,
          custoPorUnidade: 0,
          createdAt: now,
          updatedAt: now,
        };

        // Calculate costs
        const custoPorGrama = calcularCustoPorGrama(newInsumo);
        newInsumo.custoPorGrama = custoPorGrama;
        newInsumo.custoPorUnidade = unidadeMedida?.tipo === 'UNIDADE' 
          ? data.precoPrincipal 
          : custoPorGrama;

        dispatch({ type: 'ADD_INSUMO', payload: newInsumo });
        toast({
          title: "Insumo criado",
          description: "Novo insumo criado com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar insumo. Tente novamente.",
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
      title={insumo ? "Editar Insumo" : "Novo Insumo"}
      description={
        insumo 
          ? "Edite as informações do insumo" 
          : "Adicione um novo insumo ao sistema"
      }
      size="lg"
    >
      <InsumoForm
        insumo={insumo}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};