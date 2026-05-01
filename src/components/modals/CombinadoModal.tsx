import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { CombinadoForm } from "@/components/forms/CombinadoForm";
import { useAppContext } from "@/contexts/AppContext";
import { CombinadoFormData } from "@/types/forms";
import { Combinado, CombinadoComplemento } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoCombo, calcularCustoPorGrama } from "@/utils/calculations";
import { newId } from "@/lib/ids";

interface CombinadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combinado?: Combinado;
}

export const CombinadoModal = ({
  open,
  onOpenChange,
  combinado,
}: CombinadoModalProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CombinadoFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);
      const copoBase = state.coposBase.find(c => c.id === data.copoBaseId);

      const combinadoId = combinado?.id ?? newId();
      // Create complement items
      const complementos: CombinadoComplemento[] = (data.complementos || []).map((comp) => ({
        id: newId(),
        combinadoId,
        tipo: comp.tipo,
        insumoId: comp.tipo === 'INSUMO' ? comp.insumoId : undefined,
        receitaId: comp.tipo === 'RECEITA' ? comp.receitaId : undefined,
        quantidade: comp.quantidade,
        custo: 0, // Will be calculated
        createdAt: now,
        updatedAt: now,
      }));

      if (combinado) {
        // Update existing combo
        const updatedCombinado: Combinado = {
          ...combinado,
          ...data,
          categoria,
          copoBase,
          complementos,
          updatedAt: now,
        };

        // Calculate costs
        const { custoCopoBase, custoComplementos, custoTotal } = calcularCustoCombo(
          updatedCombinado,
          state.coposBase,
          state.insumos,
          state.receitas,
          state.insumoFornecedores
        );

        updatedCombinado.custoCopoBase = custoCopoBase;
        updatedCombinado.custoComplementos = custoComplementos;
        updatedCombinado.custoTotal = custoTotal;

        // Update complement costs
        updatedCombinado.complementos = complementos.map(comp => {
          let custo = 0;
          if (comp.tipo === 'INSUMO' && comp.insumoId) {
            const insumo = state.insumos.find(i => i.id === comp.insumoId);
            if (insumo) {
              const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
              custo = custoPorGrama * comp.quantidade;
            }
          } else if (comp.tipo === 'RECEITA' && comp.receitaId) {
            const receita = state.receitas.find(r => r.id === comp.receitaId);
            custo = receita ? receita.custoPorGrama * comp.quantidade : 0;
          }
          return { ...comp, custo };
        });

        dispatch({ type: 'UPDATE_COMBINADO', payload: updatedCombinado });
        toast({
          title: "Combinado atualizado",
          description: "Combinado atualizado com sucesso!",
        });
      } else {
        // Create new combo
        const newCombinado: Combinado = {
          ...data,
          id: combinadoId,
          categoria,
          copoBase,
          complementos,
          custoCopoBase: 0,
          custoComplementos: 0,
          custoTotal: 0,
          createdAt: now,
          updatedAt: now,
        } as Combinado;

        // Calculate costs
        const { custoCopoBase, custoComplementos, custoTotal } = calcularCustoCombo(
          newCombinado,
          state.coposBase,
          state.insumos,
          state.receitas,
          state.insumoFornecedores
        );

        newCombinado.custoCopoBase = custoCopoBase;
        newCombinado.custoComplementos = custoComplementos;
        newCombinado.custoTotal = custoTotal;

        // Update complement costs
        newCombinado.complementos = complementos.map(comp => {
          let custo = 0;
          if (comp.tipo === 'INSUMO' && comp.insumoId) {
            const insumo = state.insumos.find(i => i.id === comp.insumoId);
            if (insumo) {
              const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);
              custo = custoPorGrama * comp.quantidade;
            }
          } else if (comp.tipo === 'RECEITA' && comp.receitaId) {
            const receita = state.receitas.find(r => r.id === comp.receitaId);
            custo = receita ? receita.custoPorGrama * comp.quantidade : 0;
          }
          return { 
            ...comp, 
            combinadoId: newCombinado.id,
            custo 
          };
        });

        dispatch({ type: 'ADD_COMBINADO', payload: newCombinado });
        toast({
          title: "Combinado criado",
          description: "Novo combinado criado com sucesso!",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar combinado. Tente novamente.",
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
      title={combinado ? "Editar Combinado" : "Novo Combinado"}
      description={
        combinado 
          ? "Edite as informações do combinado" 
          : "Crie um novo combinado com copo base e complementos"
      }
      size="2xl"
    >
      <CombinadoForm
        combinado={combinado}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </BaseModal>
  );
};