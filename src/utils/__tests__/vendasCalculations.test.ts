import { describe, it, expect } from "vitest";
import {
  agruparVendasPorProduto,
  calcularDivergencia,
  calcularEstatisticasVendas,
  calcularLucro,
  calcularTendencia,
  classificarSeveridadeDivergencia,
  classificarVenda,
  detectarColunasVendas,
  formatarPercentual,
  identificarProdutosSemMatch,
  parseCSV,
  validarArquivoVendas,
  validarDuplicacao,
} from "@/utils/vendasCalculations";
import { VendaRegistrada } from "@/types/analise-vendas";

const venda = (over: Partial<VendaRegistrada> = {}): VendaRegistrada => ({
  id: "v1",
  importacaoId: "imp-1",
  vendaErpId: "erp-1",
  dataVenda: new Date("2024-03-15T12:00:00Z"),
  produtoErpId: "p-1",
  produtoNome: "Açaí 300ml",
  quantidade: 1,
  precoUnitarioVendido: 12,
  precoTotalVendido: 12,
  itemCardapioId: "card-1",
  itemCardapioNome: "Açaí 300ml",
  statusMatch: "matched",
  custoCalculado: 5,
  precoCardapio: 12,
  lucroBrutoReal: 7,
  lucroBrutoEsperado: 7,
  margemReal: 58.33,
  margemEsperada: 58.33,
  divergenciaValor: 0,
  divergenciaPercentual: 0,
  statusAnalise: "ok",
  ...over,
});

describe("calcularDivergencia", () => {
  it("returns positive valor when sold above cardápio", () => {
    expect(calcularDivergencia(15, 10)).toEqual({ valor: 5, percentual: 50 });
  });

  it("returns negative when sold below cardápio", () => {
    expect(calcularDivergencia(8, 10)).toEqual({ valor: -2, percentual: -20 });
  });

  it("returns 0 percentual when cardápio price is 0", () => {
    expect(calcularDivergencia(10, 0).percentual).toBe(0);
  });
});

describe("calcularLucro", () => {
  it("computes lucroBruto and margem", () => {
    expect(calcularLucro(20, 8)).toEqual({ lucroBruto: 12, margem: 60 });
  });

  it("margem is 0 when sold at 0", () => {
    expect(calcularLucro(0, 10).margem).toBe(0);
  });
});

describe("classificarVenda", () => {
  it("returns prejuizo when margem is negative", () => {
    expect(classificarVenda(0, -5)).toBe("prejuizo");
  });

  it("returns divergencia when |divergencia| > 5%", () => {
    expect(classificarVenda(6, 50)).toBe("divergencia");
    expect(classificarVenda(-7, 50)).toBe("divergencia");
  });

  it("returns ok when divergencia is small and margem positive", () => {
    expect(classificarVenda(3, 50)).toBe("ok");
    expect(classificarVenda(-5, 50)).toBe("ok");
  });
});

describe("classificarSeveridadeDivergencia", () => {
  it("returns leve in the 5-15% band", () => {
    expect(classificarSeveridadeDivergencia(10)).toBe("leve");
    expect(classificarSeveridadeDivergencia(-12)).toBe("leve");
  });

  it("returns grave above 15%", () => {
    expect(classificarSeveridadeDivergencia(20)).toBe("grave");
    expect(classificarSeveridadeDivergencia(-50)).toBe("grave");
  });

  it("returns ok within 5%", () => {
    expect(classificarSeveridadeDivergencia(4)).toBe("ok");
    expect(classificarSeveridadeDivergencia(0)).toBe("ok");
  });
});

describe("validarDuplicacao", () => {
  it("true when vendaErpId already exists", () => {
    expect(validarDuplicacao("erp-1", [venda()])).toBe(true);
  });

  it("false otherwise", () => {
    expect(validarDuplicacao("erp-2", [venda()])).toBe(false);
  });
});

describe("calcularEstatisticasVendas", () => {
  it("returns zeros when list is empty", () => {
    const stats = calcularEstatisticasVendas([]);
    expect(stats.faturamentoReal).toBe(0);
    expect(stats.totalDivergencias).toBe(0);
  });

  it("aggregates real vs expected revenue and counts statuses", () => {
    const vendas = [
      venda({ id: "1", precoTotalVendido: 100, lucroBrutoReal: 40, lucroBrutoEsperado: 50 }),
      venda({
        id: "2",
        precoTotalVendido: 50,
        lucroBrutoReal: 10,
        lucroBrutoEsperado: 25,
        statusAnalise: "divergencia",
      }),
      venda({
        id: "3",
        precoTotalVendido: 30,
        lucroBrutoReal: -5,
        lucroBrutoEsperado: 15,
        statusAnalise: "prejuizo",
      }),
    ];
    const stats = calcularEstatisticasVendas(vendas);
    expect(stats.faturamentoReal).toBe(180);
    expect(stats.lucroBrutoReal).toBe(45);
    expect(stats.totalDivergencias).toBe(1);
    expect(stats.totalPrejuizos).toBe(1);
  });
});

describe("calcularTendencia (week bucket)", () => {
  it("groups day 28 into week 4 (1-7=W1, 8-14=W2, 15-21=W3, 22-28=W4)", () => {
    const vendas = [
      venda({ id: "1", dataVenda: new Date("2024-03-28T12:00:00Z") }),
    ];
    const out = calcularTendencia(vendas, "semana") as Array<{ periodo: string }>;
    expect(out[0].periodo).toMatch(/-S4$/);
  });

  it("groups day 29 into week 5 (regression: previously fell into W4)", () => {
    const vendas = [
      venda({ id: "1", dataVenda: new Date("2024-03-29T12:00:00Z") }),
    ];
    const out = calcularTendencia(vendas, "semana") as Array<{ periodo: string }>;
    expect(out[0].periodo).toMatch(/-S5$/);
  });
});

describe("agruparVendasPorProduto", () => {
  it("groups by itemCardapioId, summing values", () => {
    const vendas = [
      venda({ id: "1", precoTotalVendido: 12, custoCalculado: 5 }),
      venda({ id: "2", precoTotalVendido: 12, custoCalculado: 5 }),
    ];
    const out = agruparVendasPorProduto(vendas) as Array<{ valorTotal: number; ocorrencias: number }>;
    expect(out).toHaveLength(1);
    expect(out[0].valorTotal).toBe(24);
    expect(out[0].ocorrencias).toBe(2);
  });
});

describe("identificarProdutosSemMatch", () => {
  it("only counts not_found and aggregates by produtoErpId", () => {
    const vendas = [
      venda({ id: "1", statusMatch: "not_found", produtoErpId: "x" }),
      venda({ id: "2", statusMatch: "not_found", produtoErpId: "x", precoTotalVendido: 10 }),
      venda({ id: "3", statusMatch: "matched" }),
    ];
    const out = identificarProdutosSemMatch(vendas) as Array<{
      ocorrencias: number;
    }>;
    expect(out).toHaveLength(1);
    expect(out[0].ocorrencias).toBe(2);
  });
});

describe("formatarPercentual", () => {
  it("uses comma as decimal separator (pt-BR)", () => {
    expect(formatarPercentual(12.5)).toBe("12,5%");
  });

  it("returns 0,0% for non-finite input", () => {
    expect(formatarPercentual(NaN)).toBe("0,0%");
    expect(formatarPercentual(Infinity)).toBe("0,0%");
  });
});

describe("parseCSV", () => {
  it("uses the first row as header and trims values", () => {
    const out = parseCSV("nome,preco\nAçaí,12.50\nMorango ,3.00 ");
    expect(out).toEqual([
      { nome: "Açaí", preco: "12.50" },
      { nome: "Morango", preco: "3.00" },
    ]);
  });

  it("returns empty array when input is empty", () => {
    expect(parseCSV("")).toEqual([]);
  });
});

describe("detectarColunasVendas", () => {
  it("maps known synonyms to canonical columns", () => {
    const out = detectarColunasVendas([
      { Data: "2024-01-01", Produto: "X", Quantidade: "1", Valor: "10" },
    ]);
    expect(out.valido).toBe(true);
    expect(out.colunas.data).toBe("Data");
    expect(out.colunas.produto).toBe("Produto");
  });

  it("flags missing required columns", () => {
    const out = detectarColunasVendas([{ X: "1" }]);
    expect(out.valido).toBe(false);
    expect(out.erros.length).toBeGreaterThan(0);
  });
});

describe("validarArquivoVendas", () => {
  it("rejects files larger than 5 MB", () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "big.csv", { type: "text/csv" });
    const result = validarArquivoVendas(big);
    expect(result.valido).toBe(false);
  });

  it("accepts CSV by extension when MIME type is missing", () => {
    const csv = new File(["nome,preco\nA,1"], "ok.csv", { type: "" });
    expect(validarArquivoVendas(csv).valido).toBe(true);
  });

  it("rejects unrecognized formats", () => {
    const exe = new File(["x"], "bad.exe", { type: "application/octet-stream" });
    expect(validarArquivoVendas(exe).valido).toBe(false);
  });
});
