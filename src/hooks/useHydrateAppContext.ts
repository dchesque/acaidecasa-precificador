"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  listCardapio,
  listCategorias,
  listCombinados,
  listCoposBase,
  listCustosOperacionais,
  listFornecedores,
  listInsumoFornecedores,
  listInsumos,
  listReceitas,
  listUnidadesMedida,
  listVendasRegistradas,
  getConfiguracao,
} from "@/services/supabase";
import { toast } from "sonner";

/**
 * Hydrates the entire AppContext with data from Supabase right after the user
 * signs in. Mounted at the root of the authenticated layout.
 *
 * Strategy: parallel fetches, then a single dispatch per slice. We accept a
 * little flicker while the lists arrive — if you need a true loading state,
 * gate the UI on `state.loading` (already in the context).
 */
export function useHydrateAppContext() {
  const { dispatch } = useAppContext();
  const { isAuthenticated, isConfigured, user } = useAuth();

  useEffect(() => {
    // No backend configured? Mock data is already in initial state — nothing to do.
    if (!isConfigured || !isSupabaseConfigured()) return;
    // Wait for an authenticated session before issuing RLS-gated queries.
    if (!isAuthenticated) return;
    // Mirror auth state into AppContext so consumers like Header/Navigation see it.
    if (user) dispatch({ type: "SET_USER", payload: user });

    let cancelled = false;
    dispatch({ type: "SET_LOADING", payload: true });

    (async () => {
      try {
        const [
          configuracao,
          categorias,
          unidadesMedida,
          fornecedores,
          insumos,
          insumoFornecedores,
          receitas,
          coposBase,
          combinados,
          cardapio,
          custosOperacionais,
          vendas,
        ] = await Promise.all([
          getConfiguracao(),
          listCategorias(),
          listUnidadesMedida(),
          listFornecedores(),
          listInsumos(),
          listInsumoFornecedores(),
          listReceitas(),
          listCoposBase(),
          listCombinados(),
          listCardapio(),
          listCustosOperacionais(),
          listVendasRegistradas(),
        ]);

        if (cancelled) return;

        if (configuracao) dispatch({ type: "SET_CONFIGURACAO", payload: configuracao });
        dispatch({ type: "SET_CATEGORIAS", payload: categorias });
        dispatch({ type: "SET_UNIDADES_MEDIDA", payload: unidadesMedida });
        dispatch({ type: "SET_FORNECEDORES", payload: fornecedores });
        dispatch({ type: "SET_INSUMOS", payload: insumos });
        dispatch({ type: "SET_INSUMO_FORNECEDORES", payload: insumoFornecedores });
        dispatch({ type: "SET_RECEITAS", payload: receitas });
        dispatch({ type: "SET_COPOS_BASE", payload: coposBase });
        dispatch({ type: "SET_COMBINADOS", payload: combinados });
        dispatch({ type: "SET_CARDAPIO", payload: cardapio });
        dispatch({ type: "SET_CUSTOS_OPERACIONAIS", payload: custosOperacionais });
        dispatch({ type: "ADD_VENDAS_REGISTRADAS", payload: vendas });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar dados";
        dispatch({ type: "SET_ERROR", payload: message });
        toast.error(message);
      } finally {
        if (!cancelled) dispatch({ type: "SET_LOADING", payload: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, isConfigured, user]);
}
