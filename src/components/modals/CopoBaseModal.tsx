import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { CopoBaseForm } from "@/components/forms/CopoBaseForm";
import { useAppContext } from "@/contexts/AppContext";
import { CopoBaseFormData } from "@/types/forms";
import { CopoBase, CopoBaseInsumo } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoPorGrama } from "@/utils/calculations";

interface CopoBaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copoBase?: CopoBase;
}

export const CopoBaseModal = ({
  open,
  onOpenChange,
  copoBase,
}: CopoBaseModalProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CopoBaseFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();

      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);
      const insumoBase = state.insumos.find(i => i.id === data.insumoBaseId);

      // Create additional ingredients
      const insumos: CopoBaseInsumo[] = (data.insumos || []).map((ins, index) => ({
        id: `${Date.now()}-${index}`,
        copoBaseId: copoBase?.id || Date.now().toString(),
        insumoId: ins.insumoId,
        quantidade: ins.quantidade,
        custo: 0, // Will be calculated
        createdAt: now,
        updatedAt: now,
      }));

      if (copoBase) {
        // Update existing base cup
        const updatedCopoBase: CopoBase = {
          ...copoBase,
          ...data,
          categoria,
          insumoBase,
          insumos,
          updatedAt: now,
        };

        // Calculate costs
        const custoBase = insumoBase ? calcularCustoPorGrama(insumoBase, state.insumoFornecedores) * data.quantidadeBase : 0;

        const custoInsumos = insumos.reduce((total, ins) => {
          const insumo = state.insumos.find(i => i.id === ins.insumoId);
          if (insumo) {
            const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
            return total + (custoPorGrama * ins.quantidade);
          }
          return total;
        }, 0);

        const custoTotal = custoBase + custoInsumos;

        updatedCopoBase.custoBase = custoBase;
        updatedCopoBase.custoInsumos = custoInsumos;
        updatedCopoBase.custoTotal = custoTotal;

        // Update ingredient costs
        updatedCopoBase.insumos = insumos.map(ins => {
          const insumo = state.insumos.find(i => i.id === ins.insumoId);
          return {
            ...ins,
            custo: insumo ? calcularCustoPorGrama(insumo, state.insumoFornecedores) * ins.quantidade : 0,
          };
        });

        dispatch({ type: 'UPDATE_COPO_BASE', payload: updatedCopoBase });
        toast({
          title: "Copo base atualizado",
          description: "Copo base atualizado com sucesso!",
        });
      } else {
        // Create new base cup
        const newCopoBase: CopoBase = {
          ...data,
          id: Date.now().toString(),
          categoria,
          insumoBase,
          insumos,
          custoBase: 0,
          custoInsumos: 0,
          custoTotal: 0,
          createdAt: now,
          updatedAt: now,
        } as CopoBase;

        // Calculate costs
        const custoBase = insumoBase ? calcularCustoPorGrama(insumoBase, state.insumoFornecedores) * data.quantidadeBase : 0;

        const custoInsumos = insumos.reduce((total, ins) => {
          const insumo = state.insumos.find(i => i.id === ins.insumoId);
          if (insumo) {
            const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
            return total + (custoPorGrama * ins.quantidade);
          }
          return total;
        }, 0);

        const custoTotal = custoBase + custoInsumos;

        newCopoBase.custoBase = custoBase;
        newCopoBase.custoInsumos = custoInsumos;
        newCopoBase.custoTotal = custoTotal;

        // Update ingredient costs
        newCopoBase.insumos = insumos.map(ins => {
          const insumo = state.insumos.find(i => i.id === ins.insumoId);
          return {
            ...ins,
            copoBaseId: newCopoBase.id,
            custo: insumo ? calcularCustoPorGrama(insumo, state.insumoFornecedores) * ins.quantidade : 0,
          };
        });

        dispatch({ type: 'ADD_COPO_BASE', payload: newCopoBase });
        toast({
          title: "Copo base criado",
          description: "Novo copo base criado com sucesso!",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar copo base. Tente novamente.",
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
      title={copoBase ? "Editar Copo Base" : "Novo Copo Base"}
      description={
        copoBase 
          ? "Edite as informações do copo base" 
          : "Crie um novo copo base com insumo principal e embalagens"
      }
      size="xl"
    >
      <CopoBaseForm
        copoBase={copoBase}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};