import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { CopoBaseForm } from "@/components/forms/CopoBaseForm";
import { useAppContext } from "@/contexts/AppContext";
import { useCalculations } from "@/hooks/useCalculations";
import { CopoBaseFormData } from "@/types/forms";
import { CopoBase, CopoBaseEmbalagem } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { calcularCustoCopoBase, calcularPrecoSugerido, calcularMargem } from "@/utils/calculations";

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
  const { recalcularCopoBase } = useCalculations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CopoBaseFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Find related data
      const categoria = state.categorias.find(c => c.id === data.categoriaId);
      const insumoBase = state.insumos.find(i => i.id === data.insumoBaseId);

      // Create packaging items
      const embalagens: CopoBaseEmbalagem[] = data.embalagens.map((emb, index) => ({
        id: `${Date.now()}-${index}`,
        copoBaseId: copoBase?.id || Date.now().toString(),
        embalagemId: emb.embalagemId,
        quantidade: emb.quantidade,
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
          embalagens,
          updatedAt: now,
        };

        // Calculate costs
        const { custoBase, custoEmbalagens, custoTotal } = calcularCustoCopoBase(
          updatedCopoBase, 
          state.insumos, 
          state.embalagens
        );
        
        const precoSugerido = state.configuracao 
          ? calcularPrecoSugerido(custoTotal, state.configuracao)
          : custoTotal * 1.3;
        
        const margem = calcularMargem(precoSugerido, custoTotal);

        updatedCopoBase.custoBase = custoBase;
        updatedCopoBase.custoEmbalagens = custoEmbalagens;
        updatedCopoBase.custoTotal = custoTotal;
        updatedCopoBase.precoSugerido = precoSugerido;
        updatedCopoBase.margem = margem;

        // Update packaging costs
        updatedCopoBase.embalagens = embalagens.map(emb => {
          const embalagem = state.embalagens.find(e => e.id === emb.embalagemId);
          return {
            ...emb,
            custo: embalagem ? embalagem.custoPorUnidade * emb.quantidade : 0,
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
          embalagens,
          custoBase: 0,
          custoEmbalagens: 0,
          custoTotal: 0,
          precoSugerido: 0,
          margem: 0,
          createdAt: now,
          updatedAt: now,
        } as CopoBase;

        // Calculate costs
        const { custoBase, custoEmbalagens, custoTotal } = calcularCustoCopoBase(
          newCopoBase, 
          state.insumos, 
          state.embalagens
        );
        
        const precoSugerido = state.configuracao 
          ? calcularPrecoSugerido(custoTotal, state.configuracao)
          : custoTotal * 1.3;
        
        const margem = calcularMargem(precoSugerido, custoTotal);

        newCopoBase.custoBase = custoBase;
        newCopoBase.custoEmbalagens = custoEmbalagens;
        newCopoBase.custoTotal = custoTotal;
        newCopoBase.precoSugerido = precoSugerido;
        newCopoBase.margem = margem;

        // Update packaging costs
        newCopoBase.embalagens = embalagens.map(emb => {
          const embalagem = state.embalagens.find(e => e.id === emb.embalagemId);
          return {
            ...emb,
            copoBaseId: newCopoBase.id,
            custo: embalagem ? embalagem.custoPorUnidade * emb.quantidade : 0,
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