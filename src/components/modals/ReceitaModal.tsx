import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { ReceitaForm } from "@/components/forms/ReceitaForm";
import { useAppContext } from "@/contexts/AppContext";
import { useCalculations } from "@/hooks/useCalculations";
import { ReceitaFormData } from "@/types/forms";
import { Receita, ReceitaIngrediente } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoReceita, calcularCustoPorGrama } from "@/utils/calculations";
import { newId } from "@/lib/ids";

interface ReceitaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receita?: Receita;
  onOpenCategoriesModal?: () => void;
}

export const ReceitaModal = ({
  open,
  onOpenChange,
  receita,
  onOpenCategoriesModal,
}: ReceitaModalProps) => {
  const { state, dispatch } = useAppContext();
  const { recalcularReceita } = useCalculations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ReceitaFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);

      const receitaId = receita?.id ?? newId();
      // Create ingredients
      const ingredientes: ReceitaIngrediente[] = data.ingredientes.map((ing) => ({
        id: newId(),
        receitaId,
        insumoId: ing.insumoId,
        quantidade: ing.quantidade,
        custo: 0, // Will be calculated
        createdAt: now,
        updatedAt: now,
      }));

      if (receita) {
        // Update existing recipe
        const updatedReceita: Receita = {
          ...receita,
          ...data,
          categoria,
          ingredientes,
          updatedAt: now,
        };

        // Calculate costs
        const { custoTotal, custoPorGrama } = calcularCustoReceita(updatedReceita, state.insumos);
        updatedReceita.custoTotal = custoTotal;
        updatedReceita.custoPorGrama = custoPorGrama;

        // Update ingredient costs
        updatedReceita.ingredientes = ingredientes.map(ing => {
          const insumo = state.insumos.find(i => i.id === ing.insumoId);
          const custo = insumo ? calcularCustoPorGrama(insumo, state.insumoFornecedores) * ing.quantidade : 0;
          return {
            ...ing,
            custo,
          };
        });

        dispatch({ type: 'UPDATE_RECEITA', payload: updatedReceita });
        toast({
          title: "Receita atualizada",
          description: "Receita atualizada com sucesso!",
        });
      } else {
        // Create new recipe
        const newReceita: Receita = {
          ...data,
          id: receitaId,
          categoria,
          ingredientes,
          custoTotal: 0,
          custoPorGrama: 0,
          createdAt: now,
          updatedAt: now,
        } as Receita;

        // Calculate costs
        const { custoTotal, custoPorGrama } = calcularCustoReceita(newReceita, state.insumos);
        newReceita.custoTotal = custoTotal;
        newReceita.custoPorGrama = custoPorGrama;

        // Update ingredient costs
        newReceita.ingredientes = ingredientes.map(ing => {
          const insumo = state.insumos.find(i => i.id === ing.insumoId);
          const custo = insumo ? calcularCustoPorGrama(insumo, state.insumoFornecedores) * ing.quantidade : 0;
          return {
            ...ing,
            receitaId: newReceita.id,
            custo,
          };
        });

        dispatch({ type: 'ADD_RECEITA', payload: newReceita });
        toast({
          title: "Receita criada",
          description: "Nova receita criada com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar receita. Tente novamente.",
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
      title={receita ? "Editar Receita" : "Nova Receita"}
      description={
        receita 
          ? "Edite as informações da receita" 
          : "Crie uma nova receita com múltiplos ingredientes"
      }
      size="xl"
    >
      <ReceitaForm
        receita={receita}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        onOpenCategoriesModal={onOpenCategoriesModal}
      />
    </BaseModal>
  );
};