import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  calcularCustoPorGrama,
  calcularCustoReceita,
  calcularCustoCopoBase,
  calcularCustoCombo,
  calcularPrecoSugerido,
  calcularMargem,
  verificarPrejuizo,
  verificarMargemBaixa,
} from '@/utils/calculations';
import { Insumo, Receita, CopoBase, Combinado, Alerta } from '@/types/database';

export const useCalculations = () => {
  const { state, dispatch } = useAppContext();

  // Recalculate input cost per gram
  const recalcularInsumo = useCallback((insumo: Insumo) => {
    const custoPorGrama = calcularCustoPorGrama(insumo, state.insumoFornecedores);

    const insumoAtualizado = {
      ...insumo,
      custoPorGrama,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_INSUMO', payload: insumoAtualizado });
    return insumoAtualizado;
  }, [state.insumoFornecedores, dispatch]);


  // Recalculate recipe costs
  const recalcularReceita = useCallback((receita: Receita) => {
    const { custoTotal, custoPorGrama } = calcularCustoReceita(receita, state.insumos, state.insumoFornecedores);

    const receitaAtualizada = {
      ...receita,
      custoTotal,
      custoPorGrama,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_RECEITA', payload: receitaAtualizada });
    return receitaAtualizada;
  }, [state.insumos, state.insumoFornecedores, dispatch]);

  // Recalculate base cup costs
  const recalcularCopoBase = useCallback((copoBase: CopoBase) => {
    const { custoBase, custoEmbalagens, custoTotal } = calcularCustoCopoBase(
      copoBase,
      state.insumos,
      state.insumoFornecedores
    );

    const precoSugerido = state.configuracao 
      ? calcularPrecoSugerido(custoTotal, state.configuracao)
      : custoTotal * 1.3; // Default 30% markup

    const margem = calcularMargem(precoSugerido, custoTotal);

    const copoBaseAtualizado = {
      ...copoBase,
      custoBase,
      custoEmbalagens,
      custoTotal,
      precoSugerido,
      margem,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_COPO_BASE', payload: copoBaseAtualizado });
    return copoBaseAtualizado;
  }, [state.insumos, state.insumoFornecedores, state.configuracao, dispatch]);

  // Recalculate combo costs
  const recalcularCombinado = useCallback((combinado: Combinado) => {
    const { custoCopoBase, custoComplementos, custoTotal } = calcularCustoCombo(
      combinado,
      state.coposBase,
      state.insumos,
      state.receitas,
      state.insumoFornecedores
    );

    const precoSugerido = state.configuracao
      ? calcularPrecoSugerido(custoTotal, state.configuracao)
      : custoTotal * 1.3; // Default 30% markup

    const margem = calcularMargem(precoSugerido, custoTotal);

    const combinadoAtualizado = {
      ...combinado,
      custoCopoBase,
      custoComplementos,
      custoTotal,
      precoSugerido,
      margem,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_COMBINADO', payload: combinadoAtualizado });
    return combinadoAtualizado;
  }, [state.coposBase, state.insumos, state.receitas, state.insumoFornecedores, state.configuracao, dispatch]);

  // Recalculate all items when configuration changes
  const recalcularTudo = useCallback(() => {
    // Recalculate all inputs
    state.insumos.forEach(insumo => {
      recalcularInsumo(insumo);
    });


    // Recalculate all recipes
    state.receitas.forEach(receita => {
      recalcularReceita(receita);
    });

    // Recalculate all base cups
    state.coposBase.forEach(copoBase => {
      recalcularCopoBase(copoBase);
    });

    // Recalculate all combos
    state.combinados.forEach(combinado => {
      recalcularCombinado(combinado);
    });
  }, [
    state.insumos,
    state.receitas,
    state.coposBase,
    state.combinados,
    recalcularInsumo,
    recalcularReceita,
    recalcularCopoBase,
    recalcularCombinado,
  ]);

  // Check for alerts (loss or low margin)
  const verificarAlertas = useCallback(() => {
    const novosAlertas: Alerta[] = [];

    // Check base cups
    state.coposBase.forEach(copoBase => {
      if (verificarPrejuizo(copoBase.precoSugerido, copoBase.custoTotal)) {
        novosAlertas.push({
          id: `prejuizo-copo-${copoBase.id}`,
          tipo: 'PREJUIZO' as const,
          titulo: 'Item em Prejuízo',
          descricao: `${copoBase.nome} está sendo vendido com prejuízo`,
          itemId: copoBase.id,
          itemNome: copoBase.nome,
          valor: copoBase.custoTotal - copoBase.precoSugerido,
          lido: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (verificarMargemBaixa(copoBase.precoSugerido, copoBase.custoTotal)) {
        novosAlertas.push({
          id: `margem-baixa-copo-${copoBase.id}`,
          tipo: 'MARGEM_BAIXA' as const,
          titulo: 'Margem Baixa',
          descricao: `${copoBase.nome} tem margem abaixo de 20%`,
          itemId: copoBase.id,
          itemNome: copoBase.nome,
          valor: copoBase.margem,
          lido: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Check combos
    state.combinados.forEach(combinado => {
      if (verificarPrejuizo(combinado.precoSugerido, combinado.custoTotal)) {
        novosAlertas.push({
          id: `prejuizo-combo-${combinado.id}`,
          tipo: 'PREJUIZO' as const,
          titulo: 'Item em Prejuízo',
          descricao: `${combinado.nome} está sendo vendido com prejuízo`,
          itemId: combinado.id,
          itemNome: combinado.nome,
          valor: combinado.custoTotal - combinado.precoSugerido,
          lido: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (verificarMargemBaixa(combinado.precoSugerido, combinado.custoTotal)) {
        novosAlertas.push({
          id: `margem-baixa-combo-${combinado.id}`,
          tipo: 'MARGEM_BAIXA' as const,
          titulo: 'Margem Baixa',
          descricao: `${combinado.nome} tem margem abaixo de 20%`,
          itemId: combinado.id,
          itemNome: combinado.nome,
          valor: combinado.margem,
          lido: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    const alertasPersistentes = state.alertas.filter(
      (alerta) => alerta.tipo !== 'PREJUIZO' && alerta.tipo !== 'MARGEM_BAIXA'
    );

    const alertasAtualizados = novosAlertas.map((alerta) => {
      const existente = state.alertas.find((item) => item.id === alerta.id);
      if (existente) {
        return { ...alerta, lido: existente.lido };
      }
      return alerta;
    });

    dispatch({
      type: 'SET_ALERTAS',
      payload: [...alertasPersistentes, ...alertasAtualizados],
    });
  }, [state.coposBase, state.combinados, state.alertas, dispatch]);

  return {
    recalcularInsumo,
    recalcularReceita,
    recalcularCopoBase,
    recalcularCombinado,
    recalcularTudo,
    verificarAlertas,
  };
};