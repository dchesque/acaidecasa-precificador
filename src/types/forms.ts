import { z } from "zod";

// Configuration Form Schema
export const configuracaoSchema = z.object({
  markupPadrao: z.number().min(0).max(1000),
  incluirImpostos: z.boolean(),
  arredondarPrecos: z.boolean(),
  custoFixoMensal: z.number().min(0),
  custoEnergia: z.number().min(0),
  custoMaoObra: z.number().min(0),
  taxaCartao: z.number().min(0).max(100),
});

// Category Form Schema
export const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean().default(true),
});

// Unit of Measure Form Schema
export const unidadeMedidaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sigla: z.string().min(1, "Sigla é obrigatória"),
  tipo: z.enum(['PESO', 'VOLUME', 'UNIDADE']),
  fatorConversao: z.number().min(0.001),
});

// Supplier Form Schema
export const fornecedorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  cnpj: z.string().optional(),
  prazoEntrega: z.number().min(0),
  pedidoMinimo: z.number().min(0),
  avaliacao: z.number().min(1).max(5),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
});

// Input Form Schema
export const insumoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  unidadeMedidaId: z.string().min(1, "Unidade de medida é obrigatória"),
  fornecedorPrincipalId: z.string().min(1, "Fornecedor principal é obrigatório"),
  fornecedorAlternativoId: z.string().optional(),
  precoPrincipal: z.number().min(0.01, "Preço deve ser maior que zero"),
  precoAlternativo: z.number().min(0).optional(),
  ativo: z.boolean().default(true),
});

// Packaging Form Schema
export const embalagemSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  fornecedorPrincipalId: z.string().min(1, "Fornecedor principal é obrigatório"),
  fornecedorAlternativoId: z.string().optional(),
  precoPrincipal: z.number().min(0.01, "Preço deve ser maior que zero"),
  precoAlternativo: z.number().min(0).optional(),
  ativo: z.boolean().default(true),
});

// Recipe Form Schema
export const receitaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  rendimento: z.number().min(1, "Rendimento deve ser maior que zero"),
  tempoPreparo: z.number().min(0).optional(),
  instrucoes: z.string().optional(),
  ativo: z.boolean().default(true),
  ingredientes: z.array(z.object({
    insumoId: z.string().min(1),
    quantidade: z.number().min(0.001),
  })).min(1, "Pelo menos um ingrediente é obrigatório"),
});

// Base Cup Form Schema
export const copoBaseSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  insumoBaseId: z.string().min(1, "Insumo base é obrigatório"),
  quantidadeBase: z.number().min(0.001, "Quantidade deve ser maior que zero"),
  ativo: z.boolean().default(true),
  embalagens: z.array(z.object({
    embalagemId: z.string().min(1),
    quantidade: z.number().min(1),
  })).min(1, "Pelo menos uma embalagem é obrigatória"),
});

// Combo Form Schema
export const combinadoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  copoBaseId: z.string().min(1, "Copo base é obrigatório"),
  ativo: z.boolean().default(true),
  complementos: z.array(z.object({
    tipo: z.enum(['INSUMO', 'RECEITA']),
    insumoId: z.string().optional(),
    receitaId: z.string().optional(),
    quantidade: z.number().min(0.001),
  })).optional(),
});

// Menu Item Form Schema
export const itemCardapioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  tipo: z.enum(['COPO_BASE', 'COMBINADO']),
  copoBaseId: z.string().optional(),
  combinadoId: z.string().optional(),
  precoNovo: z.number().min(0.01).optional(),
  sku: z.string().optional(),
  codigoErp: z.string().optional(),
  ativo: z.boolean().default(true),
});

// Type exports
export type ConfiguracaoFormData = z.infer<typeof configuracaoSchema>;
export type CategoriaFormData = z.infer<typeof categoriaSchema>;
export type UnidadeMedidaFormData = z.infer<typeof unidadeMedidaSchema>;
export type FornecedorFormData = z.infer<typeof fornecedorSchema>;
export type InsumoFormData = z.infer<typeof insumoSchema>;
export type EmbalagemFormData = z.infer<typeof embalagemSchema>;
export type ReceitaFormData = z.infer<typeof receitaSchema>;
export type CopoBaseFormData = z.infer<typeof copoBaseSchema>;
export type CombinadoFormData = z.infer<typeof combinadoSchema>;
export type ItemCardapioFormData = z.infer<typeof itemCardapioSchema>;