import { Insumo, InsumoFornecedor, Receita, CopoBase, Combinado, Configuracao, Fornecedor, ItemCardapio, CombinadoComplemento } from "@/types/database";

// Calculate cost per unit for inputs using InsumoFornecedor relationship
// Note: Despite the name, this returns cost per unit (g, ml, or un) based on the insumo's unit
export const calcularCustoPorGrama = (
  insumo: Partial<Insumo>,
  insumoFornecedores?: InsumoFornecedor[]
): number => {
  const hasRelations = Boolean(insumoFornecedores && insumo?.id && insumo.fornecedorCalculoId);

  if (hasRelations) {
    const fornecedorRelacao = insumoFornecedores!.find(
      (relacao) =>
        relacao.insumoId === insumo!.id &&
        relacao.fornecedorId === insumo!.fornecedorCalculoId &&
        relacao.ativo
    );

    if (fornecedorRelacao && fornecedorRelacao.quantidadeComprada > 0) {
      const preco = fornecedorRelacao.usarPrecoComDesconto && fornecedorRelacao.precoComDesconto
        ? fornecedorRelacao.precoComDesconto
        : fornecedorRelacao.precoBruto;

      if (!preco) {
        return 0;
      }

      return preco / fornecedorRelacao.quantidadeComprada;
    }
  }

  if (typeof insumo?.custoPorUnidade === "number" && insumo.custoPorUnidade > 0) {
    return insumo.custoPorUnidade;
  }

  return 0;
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
  } else if (typeof insumo.custoPorUnidade === "number" && insumo.custoPorUnidade > 0) {
    precoPrincipal = insumo.custoPorUnidade;
    custoUnidade = insumo.custoPorUnidade;
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

export const CUSTO_EMBALAGEM_PADRAO = 0.58;

// Calculate total cost for a base cup
// `custoEmbalagemOverride` lets callers pass the configured packaging cost; falls back to the default.
export const calcularCustoCopoBase = (
  copoBase: Partial<CopoBase>,
  insumos: Insumo[],
  insumoFornecedores?: InsumoFornecedor[],
  custoEmbalagemOverride?: number
): { custoBase: number; custoEmbalagens: number; custoTotal: number } => {
  let custoBase = 0;
  const custoEmbalagens =
    typeof custoEmbalagemOverride === "number" && custoEmbalagemOverride >= 0
      ? custoEmbalagemOverride
      : CUSTO_EMBALAGEM_PADRAO;

  if (copoBase.insumoBaseId && copoBase.quantidadeBase) {
    const insumoBase = insumos.find(i => i.id === copoBase.insumoBaseId);
    if (insumoBase) {
      const custoPorGrama = calcularCustoPorGrama(insumoBase, insumoFornecedores);
      custoBase = custoPorGrama * copoBase.quantidadeBase;
    }
  }

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

const roundToCent = (valor: number): number => Math.round(valor * 100) / 100;

// Calculate suggested price based on markup.
// Order: cost × (1 + markup/100) × (1 + tax/100), then optional cent rounding.
export const calcularPrecoSugerido = (
  custo: number,
  configuracao: Partial<Configuracao>
): number => {
  if (!Number.isFinite(custo) || custo <= 0) return 0;
  if (!configuracao.markupPadrao) return roundToCent(custo);

  let precoSugerido = custo * (1 + configuracao.markupPadrao / 100);

  if (configuracao.incluirImpostos) {
    const aliquota =
      typeof configuracao.aliquotaImposto === "number" && configuracao.aliquotaImposto >= 0
        ? configuracao.aliquotaImposto
        : 10;
    precoSugerido *= 1 + aliquota / 100;
  }

  return configuracao.arredondarPrecos ? roundToCent(precoSugerido) : precoSugerido;
};

// Margin (lucro sobre venda) — uses the sale price as denominator.
// Returns 0 when sale price is zero/invalid to avoid division-by-zero.
export const calcularMargem = (preco: number, custo: number): number => {
  if (!Number.isFinite(preco) || preco <= 0) return 0;
  return ((preco - custo) / preco) * 100;
};

// Markup (lucro sobre custo) — uses cost as denominator.
export const calcularMarkup = (preco: number, custo: number): number => {
  if (!Number.isFinite(custo) || custo <= 0) return 0;
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

// Get item price from cardápio by type and ID
export const obterPrecoVendaItem = (
  tipo: 'INSUMO' | 'RECEITA' | 'COPO_BASE',
  itemId: string,
  itensCardapio: ItemCardapio[]
): number | null => {
  const itemCardapio = itensCardapio.find(item => {
    switch (tipo) {
      case 'INSUMO':
        return item.tipo === 'INSUMO' && item.insumoId === itemId;
      case 'RECEITA':
        return item.tipo === 'RECEITA' && item.receitaId === itemId;
      case 'COPO_BASE':
        return item.tipo === 'COPO_BASE' && item.copoBaseId === itemId;
      default:
        return false;
    }
  });

  return itemCardapio?.precoAtual ?? null;
};

// Calculate sales price for combo based on cardápio prices
export const calcularPrecoVendaCombinado = (
  combinado: Partial<Combinado>,
  itensCardapio: ItemCardapio[]
): {
  precoCopoBase: number | null;
  precoComplementos: number;
  precoVendaTotal: number;
  itensComPreco: number;
  totalItens: number;
  complementosComPreco: CombinadoComplemento[];
} => {
  let precoCopoBase: number | null = null;
  let precoComplementos = 0;
  let itensComPreco = 0;
  let totalItens = 0;
  let complementosComPreco: CombinadoComplemento[] = [];

  // Get base cup price from cardápio
  if (combinado.copoBaseId) {
    precoCopoBase = obterPrecoVendaItem('COPO_BASE', combinado.copoBaseId, itensCardapio);
    totalItens += 1;
    if (precoCopoBase !== null) {
      itensComPreco += 1;
    }
  }

  // Calculate complements prices
  if (combinado.complementos) {
    totalItens += combinado.complementos.length;

    combinado.complementos.forEach(complemento => {
      let precoItem: number | null = null;

      if (complemento.tipo === 'INSUMO' && complemento.insumoId) {
        precoItem = obterPrecoVendaItem('INSUMO', complemento.insumoId, itensCardapio);
      } else if (complemento.tipo === 'RECEITA' && complemento.receitaId) {
        precoItem = obterPrecoVendaItem('RECEITA', complemento.receitaId, itensCardapio);
      }

      if (precoItem !== null) {
        const quantidade = complemento.quantidade > 0 ? complemento.quantidade : 1;
        precoComplementos += precoItem * quantidade;
        itensComPreco += 1;

        // Create complement with sales price info
        complementosComPreco.push({
          ...complemento,
          precoVenda: precoItem,
          itemCardapioId: itensCardapio.find(item =>
            (complemento.tipo === 'INSUMO' && item.insumoId === complemento.insumoId) ||
            (complemento.tipo === 'RECEITA' && item.receitaId === complemento.receitaId)
          )?.id
        });
      } else {
        complementosComPreco.push(complemento);
      }
    });
  }

  const precoVendaTotal = (precoCopoBase || 0) + precoComplementos;

  return {
    precoCopoBase,
    precoComplementos,
    precoVendaTotal,
    itensComPreco,
    totalItens,
    complementosComPreco
  };
};

// Check if combo has complete pricing information
export const verificarComboPrecoCompleto = (
  combinado: Partial<Combinado>,
  itensCardapio: ItemCardapio[]
): boolean => {
  const resultado = calcularPrecoVendaCombinado(combinado, itensCardapio);
  return resultado.itensComPreco === resultado.totalItens;
};

// Calculate savings when buying combo vs individual items
export const calcularEconomiaCombinado = (
  precoCombo: number,
  precoVendaIndividual: number
): {
  economia: number;
  porcentagemDesconto: number;
  temDesconto: boolean;
} => {
  const economia = precoVendaIndividual - precoCombo;
  const porcentagemDesconto = precoVendaIndividual > 0 ? (economia / precoVendaIndividual) * 100 : 0;
  const temDesconto = economia > 0;

  return {
    economia,
    porcentagemDesconto,
    temDesconto
  };
};

