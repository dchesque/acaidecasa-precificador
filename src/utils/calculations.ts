import { Insumo, Embalagem, Receita, CopoBase, Combinado, Configuracao } from "@/types/database";

// Calculate cost per gram for inputs
export const calcularCustoPorGrama = (insumo: Partial<Insumo>): number => {
  if (!insumo.precoPrincipal || !insumo.unidadeMedida) return 0;
  
  const preco = insumo.precoPrincipal;
  const fatorConversao = insumo.unidadeMedida.fatorConversao || 1;
  
  // Convert to cost per gram
  return preco / (1000 * fatorConversao);
};

// Calculate cost per unit for packaging
export const calcularCustoPorUnidade = (embalagem: Partial<Embalagem>): number => {
  if (!embalagem.precoPrincipal) return 0;
  return embalagem.precoPrincipal;
};

// Calculate total cost for a recipe
export const calcularCustoReceita = (
  receita: Partial<Receita>,
  insumos: Insumo[]
): { custoTotal: number; custoPorGrama: number } => {
  if (!receita.ingredientes || !receita.rendimento) {
    return { custoTotal: 0, custoPorGrama: 0 };
  }

  const custoTotal = receita.ingredientes.reduce((total, ingrediente) => {
    const insumo = insumos.find(i => i.id === ingrediente.insumoId);
    if (!insumo) return total;
    
    const custoPorGrama = calcularCustoPorGrama(insumo);
    return total + (custoPorGrama * ingrediente.quantidade);
  }, 0);

  const custoPorGrama = custoTotal / receita.rendimento;

  return { custoTotal, custoPorGrama };
};

// Calculate total cost for a base cup
export const calcularCustoCopoBase = (
  copoBase: Partial<CopoBase>,
  insumos: Insumo[],
  embalagens: Embalagem[]
): { custoBase: number; custoEmbalagens: number; custoTotal: number } => {
  let custoBase = 0;
  let custoEmbalagens = 0;

  // Calculate base ingredient cost
  if (copoBase.insumoBaseId && copoBase.quantidadeBase) {
    const insumoBase = insumos.find(i => i.id === copoBase.insumoBaseId);
    if (insumoBase) {
      const custoPorGrama = calcularCustoPorGrama(insumoBase);
      custoBase = custoPorGrama * copoBase.quantidadeBase;
    }
  }

  // Calculate packaging costs
  if (copoBase.embalagens) {
    custoEmbalagens = copoBase.embalagens.reduce((total, item) => {
      const embalagem = embalagens.find(e => e.id === item.embalagemId);
      if (!embalagem) return total;
      
      const custoPorUnidade = calcularCustoPorUnidade(embalagem);
      return total + (custoPorUnidade * item.quantidade);
    }, 0);
  }

  const custoTotal = custoBase + custoEmbalagens;

  return { custoBase, custoEmbalagens, custoTotal };
};

// Calculate total cost for a combo
export const calcularCustoCombo = (
  combinado: Partial<Combinado>,
  coposBase: CopoBase[],
  insumos: Insumo[],
  receitas: Receita[]
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
          const custoPorGrama = calcularCustoPorGrama(insumo);
          return total + (custoPorGrama * complemento.quantidade);
        }
      } else if (complemento.tipo === 'RECEITA' && complemento.receitaId) {
        const receita = receitas.find(r => r.id === complemento.receitaId);
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

// Format percentage
export const formatarPorcentagem = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor / 100);
};