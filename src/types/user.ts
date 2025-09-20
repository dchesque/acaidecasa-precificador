export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  empresa?: {
    nome?: string;
    nomeFantasia?: string;
    telefone?: string;
    endereco?: string;
  };
  updatedAt: Date;
}

export interface UserFormData {
  nome: string;
  telefone?: string;
}

export interface EmpresaFormData {
  nome?: string;
  nomeFantasia?: string;
  telefone?: string;
  endereco?: string;
}

export interface PasswordFormData {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}