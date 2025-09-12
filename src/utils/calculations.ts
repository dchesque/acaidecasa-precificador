import { Insumo, InsumoFornecedor, Receita, CopoBase, Combinado, Configuracao, Fornecedor } from "@/types/database";

// Calculate cost per unit for inputs using InsumoFornecedor relationship
export const calcularCustoPorGrama = (
  insumo: Partial<Insumo>, 
  insumoFornecedores?: InsumoFornecedor[]
): number => {
  // If we have the new relationship structure, use it
  if (insumoFornecedores && insumo.fornecedorCalculoId) {
    const fornecedorRelacao = insumoFornecedores.find(
      if_ => if_.insumoId === insumo.id && if_.fornecedorId === insumo.fornecedorCalculoId && if_.ativo
    );
    
    if (fornecedorRelacao && fornecedorRelacao.quantidadeComprada > 0) {
      const preco = fornecedorRelacao.usarPrecoComDesconto && fornecedorRelacao.precoComDesconto
        ? fornecedorRelacao.precoComDesconto
        : fornecedorRelacao.precoBruto || 0;
      
      if (preco === 0) return 0;
      return preco / fornecedorRelacao.quantidadeComprada;
    }
  }
  
  // Fallback to old structure for backward compatibility
  if (!insumo.quantidadeComprada) return 0;
  
  const preco = insumo.usarPrecoComDesconto && insumo.precoComDesconto 
    ? insumo.precoComDesconto 
    : insumo.precoBruto || 0;
    
  if (preco === 0) return 0;
  
  return preco / insumo.quantidadeComprada;
};

// Get default supplier data for an insumo
export const obterDadosFornecedorPadrao = (
  insumo: Insumo,
  insumoFornecedores: InsumoFornecedor[],
  fornecedores: Fornecedor[]
): {
  fornecedor: Fornecedor | undefined;
  insumoFornecedor: InsumoFornecedor | undefined;
  precoPrincipal: number;
  quantidade: number;
  custoUnidade: number;
} => {
  const insumoFornecedor = insumoFornecedores.find(
    inf => inf.insumoId === insumo.id && 
           inf.fornecedorId === insumo.fornecedorCalculoId && 
           inf.ativo
  );

  const fornecedor = fornecedores.find(f => f.id === insumo.fornecedorCalculoId);

  let precoPrincipal = 0;
  let quantidade = 1;
  let custoUnidade = 0;

  if (insumoFornecedor) {
    precoPrincipal = insumoFornecedor.usarPrecoComDesconto && insumoFornecedor.precoComDesconto
      ? insumoFornecedor.precoComDesconto
      : insumoFornecedor.precoBruto;
    quantidade = insumoFornecedor.quantidadeComprada;
    custoUnidade = quantidade > 0 ? precoPrincipal / quantidade : 0;
  }

  return {
    fornecedor,
    insumoFornecedor,
    precoPrincipal,
    quantidade,
    custoUnidade,
  };
};


// Calculate total cost for a recipe
export const calcularCustoReceita = (
  receita: Partial<Receita>,
  insumos: Insumo[],
  insumoFornecedores?: InsumoFornecedor[]
): { custoTotal: number; custoPorGrama: number } => {
  if (!receita.ingredientes || !receita.rendimento) {
    return { custoTotal: 0, custoPorGrama: 0 };
  }

  const custoTotal = receita.ingredientes.reduce((total, ingrediente) => {
    const insumo = insumos.find(i => i.id === ingrediente.insumoId);
    if (!insumo) return total;
    
    const custoPorGrama = calcularCustoPorGrama(insumo, insumoFornecedores);
    return total + (custoPorGrama * ingrediente.quantidade);
  }, 0);

  const custoPorGrama = custoTotal / receita.rendimento;

  return { custoTotal, custoPorGrama };
};

// Calculate total cost for a base cup
export const calcularCustoCopoBase = (
  copoBase: Partial<CopoBase>,
  insumos: Insumo[],
  insumoFornecedores?: InsumoFornecedor[]
): { custoBase: number; custoEmbalagens: number; custoTotal: number } => {
  let custoBase = 0;
  let custoEmbalagens = 0.58; // Fixed packaging cost

  // Calculate base ingredient cost
  if (copoBase.insumoBaseId && copoBase.quantidadeBase) {
    const insumoBase = insumos.find(i => i.id === copoBase.insumoBaseId);
    if (insumoBase) {
      const custoPorGrama = calcularCustoPorGrama(insumoBase, insumoFornecedores);
      custoBase = custoPorGrama * copoBase.quantidadeBase;
    }
  }

  // Fixed packaging costs (simplified)

  const custoTotal = custoBase + custoEmbalagens;

  return { custoBase, custoEmbalagens, custoTotal };
};

// Calculate total cost for a combo
export const calcularCustoCombo = (
  combinado: Partial<Combinado>,
  coposBase: CopoBase[],
  insumos: Insumo[],
  receitas: Receita[],
  insumoFornecedores?: InsumoFornecedor[]
): { custoCopoBase: number; custoComplementos: number; custoTotal: number } => {
  let custoCopoBase = 0;
  let custoComplementos = 0;

  // Calculate base cup cost
  if (combinado.copoBaseId) {
    const copoBase = coposBase.find(c => c.id === combinado.copoBaseId);
    custoCopoBase = copoBase?.custoTotal || 0;
  }

  // Calculate complements cost
  if (combinado.complementos) {
    custoComplementos = combinado.complementos.reduce((total, complemento) => {
      if (complemento.tipo === 'INSUMO' && complemento.insumoId) {
        const insumo = insumos.find(i => i.id === complemento.insumoId);
        if (insumo) {
          const custoPorGrama = calcularCustoPorGrama(insumo, insumoFornecedores);
          return total + (custoPorGrama * complemento.quantidade);
        }
      } else if (complemento.tipo === 'RECEITA' && complemento.receitaId) {
        const receita = receitas.find(r => r.id === combinado.receitaId);
        if (receita) {
          return total + (receita.custoPorGrama * complemento.quantidade);
        }
      }
      return total;
    }, 0);
  }

  const custoTotal = custoCopoBase + custoComplementos;

  return { custoCopoBase, custoComplementos, custoTotal };
};

// Calculate suggested price based on markup
export const calcularPrecoSugerido = (
  custo: number,
  configuracao: Partial<Configuracao>
): number => {
  if (!configuracao.markupPadrao) return custo;
  
  let precoSugerido = custo * (1 + configuracao.markupPadrao / 100);
  
  // Add taxes if configured
  if (configuracao.incluirImpostos) {
    precoSugerido *= 1.1; // Assuming 10% tax
  }
  
  // Round prices if configured
  if (configuracao.arredondarPrecos) {
    precoSugerido = Math.ceil(precoSugerido);
  }
  
  return precoSugerido;
};

// Calculate profit margin
export const calcularMargem = (preco: number, custo: number): number => {
  if (custo === 0) return 0;
  return ((preco - custo) / preco) * 100;
};

// Calculate markup percentage
export const calcularMarkup = (preco: number, custo: number): number => {
  if (custo === 0) return 0;
  return ((preco - custo) / custo) * 100;
};

// Check if item is at loss
export const verificarPrejuizo = (preco: number, custo: number): boolean => {
  return preco < custo;
};

// Check if margin is below threshold
export const verificarMargemBaixa = (
  preco: number, 
  custo: number, 
  margemMinima: number = 20
): boolean => {
  const margem = calcularMargem(preco, custo);
  return margem < margemMinima;
};

// Format currency
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Format currency with up to 4 decimal places for cost per unit
export const formatarCustoPorUnidade = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(valor);
};

// Format percentage
export const formatarPorcentagem = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor / 100);
};