/**
 * Legacy facade kept for compatibility with `Fornecedores.tsx` and
 * `FornecedorModal.tsx`. New code should call `services/supabase` directly —
 * this file simply forwards to it and adapts the form-data shape.
 */

import { Fornecedor } from "@/types/database";
import { FornecedorFormData } from "@/types/forms";
import {
  listFornecedores,
  createFornecedor as svcCreate,
  updateFornecedor as svcUpdate,
  deleteFornecedor as svcDelete,
} from "@/services/supabase";

const formDataToFornecedor = (data: FornecedorFormData): Partial<Fornecedor> => ({
  nome: data.nome,
  contato: data.contato ?? undefined,
  telefone: data.telefone ?? undefined,
  email: data.email ?? undefined,
  endereco: data.endereco ?? undefined,
  cnpj: data.cnpj ?? undefined,
  prazoEntrega: data.prazoEntrega ?? undefined,
  pedidoMinimo: data.pedidoMinimo ?? undefined,
  observacoes: data.observacoes ?? undefined,
  ativo: data.ativo,
});

export const fetchFornecedores = (): Promise<Fornecedor[]> => listFornecedores();

export const createFornecedor = (formData: FornecedorFormData): Promise<Fornecedor> =>
  svcCreate(formDataToFornecedor(formData));

export const updateFornecedor = (
  id: string,
  formData: FornecedorFormData
): Promise<Fornecedor> => svcUpdate(id, formDataToFornecedor(formData));

export const deleteFornecedor = (id: string): Promise<void> => svcDelete(id);
