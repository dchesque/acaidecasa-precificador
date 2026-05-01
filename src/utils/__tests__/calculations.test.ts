import { describe, it, expect } from "vitest";
import {
  CUSTO_EMBALAGEM_PADRAO,
  calcularCustoCombo,
  calcularCustoCopoBase,
  calcularCustoPorGrama,
  calcularCustoReceita,
  calcularEconomiaCombinado,
  calcularMargem,
  calcularMarkup,
  calcularPrecoSugerido,
  calcularPrecoVendaCombinado,
  obterPrecoVendaItem,
  verificarComboPrecoCompleto,
  verificarMargemBaixa,
  verificarPrejuizo,
} from "@/utils/calculations";
import {
  CombinadoComplemento,
  Configuracao,
  CopoBase,
  Insumo,
  InsumoFornecedor,
  ItemCardapio,
  Receita,
} from "@/types/database";

const insumo = (over: Partial<Insumo> = {}): Insumo => ({
  id: "ins-1",
  nome: "Açaí",
  categoriaId: "cat-1",
  unidadeMedidaId: "u-1",
  fornecedorCalculoId: "f-1",
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

const supplierLink = (over: Partial<InsumoFornecedor> = {}): InsumoFornecedor => ({
  id: "if-1",
  insumoId: "ins-1",
  fornecedorId: "f-1",
  precoBruto: 100,
  quantidadeComprada: 1000,
  usarPrecoComDesconto: false,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

describe("calcularCustoPorGrama", () => {
  it("computes price/quantity from the chosen supplier link", () => {
    expect(calcularCustoPorGrama(insumo(), [supplierLink()])).toBe(0.1);
  });

  it("uses precoComDesconto when usarPrecoComDesconto is true", () => {
    expect(
      calcularCustoPorGrama(insumo(), [
        supplierLink({ precoBruto: 100, precoComDesconto: 80, usarPrecoComDesconto: true }),
      ])
    ).toBe(0.08);
  });

  it("falls back to precoBruto when discount toggle is on but discount is missing", () => {
    expect(
      calcularCustoPorGrama(insumo(), [
        supplierLink({ precoBruto: 100, usarPrecoComDesconto: true }),
      ])
    ).toBe(0.1);
  });

  it("returns 0 when the supplier link has zero quantity", () => {
    expect(
      calcularCustoPorGrama(insumo(), [supplierLink({ quantidadeComprada: 0 })])
    ).toBe(0);
  });

  it("returns 0 when no supplier matches and no fallback custoPorUnidade is set", () => {
    expect(calcularCustoPorGrama(insumo(), [])).toBe(0);
  });

  it("falls back to insumo.custoPorUnidade when no supplier link found", () => {
    expect(calcularCustoPorGrama(insumo({ custoPorUnidade: 0.25 }), [])).toBe(0.25);
  });
});

describe("calcularCustoReceita", () => {
  it("returns zeros when ingredientes are missing", () => {
    expect(calcularCustoReceita({ rendimento: 1000 } as Receita, [], [])).toEqual({
      custoTotal: 0,
      custoPorGrama: 0,
    });
  });

  it("sums (custoPorGrama × quantidade) per ingredient and divides by rendimento", () => {
    const receita: Partial<Receita> = {
      rendimento: 1000,
      ingredientes: [
        {
          id: "i1",
          receitaId: "r1",
          insumoId: "ins-1",
          quantidade: 500,
          custo: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const result = calcularCustoReceita(receita, [insumo()], [supplierLink()]);
    expect(result.custoTotal).toBeCloseTo(50, 5); // 0.1 × 500
    expect(result.custoPorGrama).toBeCloseTo(0.05, 5); // 50 / 1000
  });
});

describe("calcularCustoCopoBase", () => {
  const copo: Partial<CopoBase> = {
    insumoBaseId: "ins-1",
    quantidadeBase: 200,
  };

  it("uses CUSTO_EMBALAGEM_PADRAO when no override is given", () => {
    const out = calcularCustoCopoBase(copo, [insumo()], [supplierLink()]);
    expect(out.custoBase).toBeCloseTo(20, 5); // 0.1 × 200
    expect(out.custoEmbalagens).toBe(CUSTO_EMBALAGEM_PADRAO);
    expect(out.custoTotal).toBeCloseTo(20 + CUSTO_EMBALAGEM_PADRAO, 5);
  });

  it("honors the custoEmbalagemOverride parameter", () => {
    const out = calcularCustoCopoBase(copo, [insumo()], [supplierLink()], 1.25);
    expect(out.custoEmbalagens).toBe(1.25);
    expect(out.custoTotal).toBeCloseTo(20 + 1.25, 5);
  });

  it("ignores negative override values and falls back to default", () => {
    const out = calcularCustoCopoBase(copo, [insumo()], [supplierLink()], -1);
    expect(out.custoEmbalagens).toBe(CUSTO_EMBALAGEM_PADRAO);
  });
});

describe("calcularCustoCombo", () => {
  it("sums copo base cost + insumo complements + receita complements", () => {
    const copoBase: CopoBase = {
      id: "cb-1",
      nome: "Copo 300ml",
      categoriaId: "c1",
      insumoBaseId: "ins-1",
      quantidadeBase: 200,
      custoBase: 20,
      custoInsumos: 0,
      custoTotal: 20.58,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const receita: Receita = {
      id: "rec-1",
      nome: "Creme",
      categoriaId: "c2",
      rendimento: 1000,
      custoPorGrama: 0.05,
      custoTotal: 50,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const complementos: CombinadoComplemento[] = [
      {
        id: "x1",
        combinadoId: "c1",
        tipo: "INSUMO",
        insumoId: "ins-1",
        quantidade: 100, // 0.1 × 100 = 10
        custo: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "x2",
        combinadoId: "c1",
        tipo: "RECEITA",
        receitaId: "rec-1",
        quantidade: 200, // 0.05 × 200 = 10
        custo: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = calcularCustoCombo(
      { copoBaseId: "cb-1", complementos },
      [copoBase],
      [insumo()],
      [receita],
      [supplierLink()]
    );
    expect(result.custoCopoBase).toBeCloseTo(20.58, 5);
    expect(result.custoComplementos).toBeCloseTo(20, 5);
    expect(result.custoTotal).toBeCloseTo(40.58, 5);
  });
});

describe("calcularPrecoSugerido", () => {
  const cfg = (over: Partial<Configuracao> = {}): Partial<Configuracao> => ({
    markupPadrao: 100,
    incluirImpostos: false,
    arredondarPrecos: false,
    ...over,
  });

  it("returns 0 for invalid cost", () => {
    expect(calcularPrecoSugerido(0, cfg())).toBe(0);
    expect(calcularPrecoSugerido(NaN, cfg())).toBe(0);
    expect(calcularPrecoSugerido(-1, cfg())).toBe(0);
  });

  it("applies markup as percentage", () => {
    expect(calcularPrecoSugerido(10, cfg({ markupPadrao: 100 }))).toBe(20);
    expect(calcularPrecoSugerido(10, cfg({ markupPadrao: 30 }))).toBe(13);
  });

  it("returns rounded cost when no markup configured", () => {
    expect(calcularPrecoSugerido(7.555, cfg({ markupPadrao: 0 }))).toBe(7.56);
  });

  it("applies tax after markup with default 10% when aliquota is missing", () => {
    expect(
      calcularPrecoSugerido(10, cfg({ markupPadrao: 100, incluirImpostos: true }))
    ).toBeCloseTo(22, 5);
  });

  it("uses configuracao.aliquotaImposto when set", () => {
    expect(
      calcularPrecoSugerido(
        10,
        cfg({ markupPadrao: 100, incluirImpostos: true, aliquotaImposto: 18 })
      )
    ).toBeCloseTo(23.6, 5);
  });

  it("rounds to nearest cent (not Math.ceil) when arredondarPrecos is true", () => {
    expect(
      calcularPrecoSugerido(
        7.143,
        cfg({ markupPadrao: 100, arredondarPrecos: true })
      )
    ).toBe(14.29);
  });
});

describe("calcularMargem & calcularMarkup", () => {
  it("margem returns 0 when sale price <= 0", () => {
    expect(calcularMargem(0, 5)).toBe(0);
    expect(calcularMargem(-5, 5)).toBe(0);
  });

  it("markup returns 0 when cost <= 0", () => {
    expect(calcularMarkup(10, 0)).toBe(0);
  });

  it("margem = (preco - custo) / preco × 100 (lucro sobre venda)", () => {
    expect(calcularMargem(20, 10)).toBe(50);
  });

  it("markup = (preco - custo) / custo × 100 (lucro sobre custo)", () => {
    expect(calcularMarkup(20, 10)).toBe(100);
  });

  it("margem differs from markup for the same numbers", () => {
    expect(calcularMargem(20, 10)).not.toBe(calcularMarkup(20, 10));
  });
});

describe("verificarPrejuizo / verificarMargemBaixa", () => {
  it("verificarPrejuizo true when price < cost", () => {
    expect(verificarPrejuizo(5, 10)).toBe(true);
    expect(verificarPrejuizo(10, 10)).toBe(false);
  });

  it("verificarMargemBaixa respects custom threshold", () => {
    expect(verificarMargemBaixa(20, 10, 30)).toBe(false); // 50% > 30
    expect(verificarMargemBaixa(20, 19, 30)).toBe(true); // 5% < 30
  });
});

describe("obterPrecoVendaItem", () => {
  const cardapio: ItemCardapio[] = [
    {
      id: "card-1",
      nome: "Item livre",
      categoriaId: "c",
      tipo: "INSUMO",
      insumoId: "ins-1",
      custoAtual: 0,
      precoAtual: 0, // free item
      margemAtual: 0,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "card-2",
      nome: "Combo",
      categoriaId: "c",
      tipo: "COMBINADO",
      combinadoId: "comb-1",
      custoAtual: 5,
      precoAtual: 12,
      margemAtual: 0.58,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("returns 0 (not null) for items with precoAtual = 0", () => {
    // regression: previously `precoAtual || null` treated R$ 0 as missing
    expect(obterPrecoVendaItem("INSUMO", "ins-1", cardapio)).toBe(0);
  });

  it("returns null when item is not on the cardápio", () => {
    expect(obterPrecoVendaItem("INSUMO", "missing", cardapio)).toBeNull();
  });

  it("matches by tipo + id correctly", () => {
    expect(obterPrecoVendaItem("COMBINADO", "comb-1", cardapio)).toBe(12);
  });
});

describe("calcularPrecoVendaCombinado", () => {
  const cardapio: ItemCardapio[] = [
    {
      id: "c-cb",
      nome: "Copo 300ml",
      categoriaId: "c",
      tipo: "COPO_BASE",
      copoBaseId: "cb-1",
      custoAtual: 5,
      precoAtual: 10,
      margemAtual: 0.5,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "c-ins",
      nome: "Topping morango",
      categoriaId: "c",
      tipo: "INSUMO",
      insumoId: "ins-1",
      custoAtual: 1,
      precoAtual: 3,
      margemAtual: 0.66,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("multiplies precoItem by quantidade for each complemento", () => {
    const combo: Partial<{ copoBaseId: string; complementos: CombinadoComplemento[] }> = {
      copoBaseId: "cb-1",
      complementos: [
        {
          id: "x",
          combinadoId: "c",
          tipo: "INSUMO",
          insumoId: "ins-1",
          quantidade: 2,
          custo: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const result = calcularPrecoVendaCombinado(combo, cardapio);
    // copo (10) + complemento (3 × 2 = 6) = 16
    expect(result.precoCopoBase).toBe(10);
    expect(result.precoComplementos).toBe(6);
    expect(result.precoVendaTotal).toBe(16);
  });

  it("treats quantidade <= 0 as 1 to avoid losing the complement value", () => {
    const combo = {
      complementos: [
        {
          id: "x",
          combinadoId: "c",
          tipo: "INSUMO" as const,
          insumoId: "ins-1",
          quantidade: 0,
          custo: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const result = calcularPrecoVendaCombinado(combo, cardapio);
    expect(result.precoComplementos).toBe(3);
  });
});

describe("verificarComboPrecoCompleto", () => {
  it("true when all components are priced on the cardápio", () => {
    const cardapio: ItemCardapio[] = [
      {
        id: "c-cb",
        nome: "Copo",
        categoriaId: "c",
        tipo: "COPO_BASE",
        copoBaseId: "cb-1",
        custoAtual: 5,
        precoAtual: 10,
        margemAtual: 0.5,
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    expect(verificarComboPrecoCompleto({ copoBaseId: "cb-1", complementos: [] }, cardapio)).toBe(
      true
    );
  });

  it("false when some component is missing from the cardápio", () => {
    expect(verificarComboPrecoCompleto({ copoBaseId: "missing" }, [])).toBe(false);
  });
});

describe("calcularEconomiaCombinado", () => {
  it("computes savings, percentage, and the temDesconto flag", () => {
    expect(calcularEconomiaCombinado(20, 25)).toEqual({
      economia: 5,
      porcentagemDesconto: 20,
      temDesconto: true,
    });
  });

  it("returns 0 percentage when individual price is 0", () => {
    expect(calcularEconomiaCombinado(20, 0).porcentagemDesconto).toBe(0);
  });

  it("temDesconto is false when combo costs more than individual", () => {
    expect(calcularEconomiaCombinado(30, 25).temDesconto).toBe(false);
  });
});
