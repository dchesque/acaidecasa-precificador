import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { InsumoFormSteps, InsumoSubmitData } from "@/components/forms/InsumoFormSteps";
import { useAppContext } from "@/contexts/AppContext";
import { Insumo, InsumoFornecedor } from "@/types/database";
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (submitData: InsumoSubmitData) => {
    setIsLoading(true);
    try {
      const { formData, suppliers } = submitData;
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === formData.categoriaId);
      const unidadeMedida = state.unidadesMedida.find(u => u.id === formData.unidadeMedidaId);

      if (insumo) {
        // Update existing insumo
        const updatedInsumo: Insumo = {
          ...insumo,
          ...formData,
          categoria,
          unidadeMedida,
          updatedAt: now,
        };

        dispatch({ type: 'UPDATE_INSUMO', payload: updatedInsumo });

        // Update suppliers for this insumo
        // First, remove old suppliers for this insumo
        const existingSupplierIds = state.insumoFornecedores
          .filter(inf => inf.insumoId === insumo.id)
          .map(inf => inf.id);
        
        existingSupplierIds.forEach(id => {
          dispatch({ type: 'DELETE_INSUMO_FORNECEDOR', payload: id });
        });

        // Then add the new suppliers
        suppliers.forEach(supplier => {
          const supplierToSave: InsumoFornecedor = {
            ...supplier,
            insumoId: insumo.id,
            id: supplier.id || Date.now().toString() + Math.random().toString(),
            createdAt: supplier.createdAt || now,
            updatedAt: now,
          };
          dispatch({ type: 'ADD_INSUMO_FORNECEDOR', payload: supplierToSave });
        });

        toast({
          title: "Insumo atualizado",
          description: "Insumo e fornecedores atualizados com sucesso!",
        });
      } else {
        // Create new insumo
        const newInsumoId = Date.now().toString();
        const newInsumo: Insumo = {
          ...formData,
          id: newInsumoId,
          categoria,
          unidadeMedida,
          createdAt: now,
          updatedAt: now,
        } as Insumo;

        dispatch({ type: 'ADD_INSUMO', payload: newInsumo });

        // Add suppliers for the new insumo
        suppliers.forEach((supplier, index) => {
          const supplierToSave: InsumoFornecedor = {
            ...supplier,
            id: (Date.now() + index).toString(),
            insumoId: newInsumoId,
            createdAt: now,
            updatedAt: now,
          };
          dispatch({ type: 'ADD_INSUMO_FORNECEDOR', payload: supplierToSave });
        });

        toast({
          title: "Insumo criado",
          description: "Novo insumo e fornecedores criados com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving insumo:', error);
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
      size="xl"
    >
      <InsumoFormSteps
        insumo={insumo}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};