import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Fornecedor } from "@/types/database";
import { FornecedorFormData } from "@/types/forms";

const TABLE_NAME = "fornecedores";

type FornecedorRecord = {
  id: string;
  nome: string;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cnpj: string | null;
  prazo_entrega: number | null;
  pedido_minimo: number | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

const mapRecordToFornecedor = (record: FornecedorRecord): Fornecedor => ({
  id: record.id,
  nome: record.nome,
  contato: record.contato ?? undefined,
  telefone: record.telefone ?? undefined,
  email: record.email ?? undefined,
  endereco: record.endereco ?? undefined,
  cnpj: record.cnpj ?? undefined,
  prazoEntrega: record.prazo_entrega ?? undefined,
  pedidoMinimo: record.pedido_minimo ?? undefined,
  observacoes: record.observacoes ?? undefined,
  ativo: record.ativo,
  createdAt: new Date(record.created_at),
  updatedAt: new Date(record.updated_at),
});

const mapFormDataToPayload = (data: FornecedorFormData) => ({
  nome: data.nome,
  contato: data.contato ?? null,
  telefone: data.telefone ?? null,
  email: data.email ?? null,
  endereco: data.endereco ?? null,
  cnpj: data.cnpj ?? null,
  prazo_entrega: data.prazoEntrega ?? null,
  pedido_minimo: data.pedidoMinimo ?? null,
  observacoes: data.observacoes ?? null,
  ativo: data.ativo,
});

export const fetchFornecedores = async (): Promise<Fornecedor[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRecordToFornecedor);
};

export const createFornecedor = async (formData: FornecedorFormData): Promise<Fornecedor> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não configurado");
  }

  const payload = mapFormDataToPayload(formData);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Erro ao criar fornecedor");
  }

  return mapRecordToFornecedor(data);
};

export const updateFornecedor = async (id: string, formData: FornecedorFormData): Promise<Fornecedor> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não configurado");
  }

  const payload = mapFormDataToPayload(formData);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Erro ao atualizar fornecedor");
  }

  return mapRecordToFornecedor(data);
};

export const deleteFornecedor = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não configurado");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

