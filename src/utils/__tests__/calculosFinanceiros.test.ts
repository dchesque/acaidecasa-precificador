import { describe, it, expect } from "vitest";
import {
  analisarTendenciaNegocio,
  calcularCoeficienteVariacao,
  calcularLucroLiquido,
  calcularLucroPorVenda,
  calcularMargemLiquida,
  calcularMediaMovel,
  calcularMediaPonderada,
  calcularMetaFaturamento,
  calcularPontoEquilibrio,
  calcularProgressoMeta,
  calcularProjecao,
  calcularTaxaAbsorcao,
  calcularTicketMedioNecessario,
  calcularVariacaoPercentual,
  determinarTendencia,
  encontrarMelhorPiorMes,
  formatarPercentual,
  identificarOutliers,
  obterNomeMes,
  obterNomeMesAbreviado,
} from "@/utils/calculosFinanceiros";

describe("calcularLucroLiquido & calcularMargemLiquida", () => {
  it("subtracts operational cost from gross profit", () => {
    expect(calcularLucroLiquido(100, 30)).toBe(70);
  });

  it("margemLiquida is 0 when revenue is 0", () => {
    expect(calcularMargemLiquida(50, 0)).toBe(0);
  });

  it("margemLiquida is percentage of revenue", () => {
    expect(calcularMargemLiquida(20, 100)).toBe(20);
  });
});

describe("calcularPontoEquilibrio", () => {
  it("returns 0 when margem is 0 or negative (no break-even possible)", () => {
    expect(calcularPontoEquilibrio(1000, 0)).toBe(0);
    expect(calcularPontoEquilibrio(1000, -5)).toBe(0);
  });

  it("computes opCost / (margem/100)", () => {
    expect(calcularPontoEquilibrio(1000, 25)).toBe(4000);
  });
});

describe("calcularTaxaAbsorcao & calcularTicketMedioNecessario", () => {
  it("absorcao returns 0 when revenue is 0", () => {
    expect(calcularTaxaAbsorcao(100, 0)).toBe(0);
  });

  it("ticket medio necessario uses break-even revenue / vendas medio", () => {
    // ponto equilibrio = 1000 / 0.5 = 2000; ticket = 2000 / 100 = 20
    expect(calcularTicketMedioNecessario(1000, 50, 100)).toBe(20);
  });

  it("returns 0 when any input is non-positive", () => {
    expect(calcularTicketMedioNecessario(1000, 0, 100)).toBe(0);
    expect(calcularTicketMedioNecessario(1000, 50, 0)).toBe(0);
  });
});

describe("calcularVariacaoPercentual (sign-correct for negatives)", () => {
  it("returns 100 when growing from 0 to positive", () => {
    expect(calcularVariacaoPercentual(50, 0)).toBe(100);
  });

  it("returns -100 when going from 0 to negative", () => {
    expect(calcularVariacaoPercentual(-50, 0)).toBe(-100);
  });

  it("returns 0 when both values are 0", () => {
    expect(calcularVariacaoPercentual(0, 0)).toBe(0);
  });

  it("uses |valorAnterior| as denominator so a smaller loss reads as POSITIVE growth", () => {
    // -100 → -50: loss shrunk by 50% — must be +50, not -50
    expect(calcularVariacaoPercentual(-50, -100)).toBe(50);
  });

  it("a deeper loss reads as NEGATIVE growth", () => {
    expect(calcularVariacaoPercentual(-150, -100)).toBe(-50);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(calcularVariacaoPercentual(NaN, 100)).toBe(0);
    expect(calcularVariacaoPercentual(100, NaN)).toBe(0);
  });
});

describe("calcularMediaMovel", () => {
  it("returns the source array when shorter than the window", () => {
    expect(calcularMediaMovel([1, 2], 3)).toEqual([1, 2]);
  });

  it("computes a sliding window average", () => {
    expect(calcularMediaMovel([1, 2, 3, 4, 5], 3)).toEqual([2, 3, 4]);
  });
});

describe("formatarPercentual", () => {
  it("formats a 0-100 value as a pt-BR percent string", () => {
    expect(formatarPercentual(25)).toBe("25,0%");
  });

  it("returns 0% for non-finite input", () => {
    expect(formatarPercentual(NaN)).toBe("0%");
  });
});

describe("obterNomeMes / obterNomeMesAbreviado", () => {
  it("returns the right month name (1-indexed)", () => {
    expect(obterNomeMes(1)).toBe("Janeiro");
    expect(obterNomeMes(12)).toBe("Dezembro");
    expect(obterNomeMesAbreviado(2)).toBe("Fev");
  });

  it("returns empty string for out-of-range input", () => {
    expect(obterNomeMes(0)).toBe("");
    expect(obterNomeMes(13)).toBe("");
  });
});

describe("calcularMediaPonderada", () => {
  it("returns 0 when input is empty", () => {
    expect(calcularMediaPonderada([])).toBe(0);
  });

  it("returns 0 when total weight is zero", () => {
    expect(calcularMediaPonderada([{ valor: 10, peso: 0 }])).toBe(0);
  });

  it("computes a weighted average", () => {
    expect(
      calcularMediaPonderada([
        { valor: 10, peso: 1 },
        { valor: 20, peso: 3 },
      ])
    ).toBeCloseTo(17.5, 5);
  });
});

describe("determinarTendencia (handles zero initial mean)", () => {
  it("returns crescimento when post-period has positive growth", () => {
    expect(determinarTendencia([100, 100, 110, 120, 130])).toBe("crescimento");
  });

  it("returns queda when post-period drops", () => {
    expect(determinarTendencia([100, 100, 80, 70, 60])).toBe("queda");
  });

  it("returns estavel when difference is small", () => {
    expect(determinarTendencia([100, 100, 100, 100])).toBe("estavel");
  });

  it("crescimento when initial mean is 0 and final mean is positive (no NaN)", () => {
    expect(determinarTendencia([0, 0, 10, 20])).toBe("crescimento");
  });

  it("estavel when not enough samples", () => {
    expect(determinarTendencia([10])).toBe("estavel");
  });
});

describe("calcularProjecao", () => {
  it("returns a flat projection when only one historical value is given", () => {
    expect(calcularProjecao([5], 3)).toEqual([5, 5, 5]);
  });

  it("never returns negative projections", () => {
    const out = calcularProjecao([10, 5, 0, -10], 2);
    out.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
  });

  it("returns last value repeated when slope can't be derived (zero denominator)", () => {
    // Two identical points → degenerate regression; should fall back gracefully
    expect(calcularProjecao([7, 7], 1)[0]).toBeGreaterThanOrEqual(0);
  });
});

describe("identificarOutliers", () => {
  it("returns [] when fewer than 4 samples", () => {
    expect(identificarOutliers([1, 2, 3])).toEqual([]);
  });

  it("flags values outside the 1.5 × IQR fence", () => {
    const out = identificarOutliers([1, 2, 3, 4, 5, 6, 7, 8, 100]);
    expect(out).toContain(100);
  });
});

describe("calcularCoeficienteVariacao", () => {
  it("returns 0 when input is empty or mean is 0", () => {
    expect(calcularCoeficienteVariacao([])).toBe(0);
    expect(calcularCoeficienteVariacao([0, 0, 0])).toBe(0);
  });

  it("computes std/mean × 100", () => {
    expect(calcularCoeficienteVariacao([10, 10, 10])).toBe(0);
  });
});

describe("calcularLucroPorVenda / calcularMetaFaturamento / calcularProgressoMeta", () => {
  it("lucroPorVenda divides", () => {
    expect(calcularLucroPorVenda(1000, 50)).toBe(20);
  });

  it("metaFaturamento divides desired profit by margin %", () => {
    expect(calcularMetaFaturamento(500, 25)).toBe(2000);
  });

  it("progressoMeta caps at 100", () => {
    expect(calcularProgressoMeta(150, 100)).toBe(100);
    expect(calcularProgressoMeta(50, 100)).toBe(50);
  });
});

describe("analisarTendenciaNegocio", () => {
  it("returns insufficient when fewer than 3 samples", () => {
    expect(analisarTendenciaNegocio([10, 20]).descricao).toMatch(/Dados insuficientes/);
  });

  it("returns crescimento with a 📈 emoji", () => {
    const out = analisarTendenciaNegocio([100, 200, 300]);
    expect(out.status).toBe("crescimento");
  });
});

describe("encontrarMelhorPiorMes", () => {
  it("returns zeros for empty input", () => {
    const out = encontrarMelhorPiorMes([]);
    expect(out.diferenca).toBe(0);
  });

  it("identifies best/worst and computes the spread", () => {
    const out = encontrarMelhorPiorMes([
      { periodo: "Jan", valor: 10 },
      { periodo: "Fev", valor: 50 },
      { periodo: "Mar", valor: 30 },
    ]);
    expect(out.melhor.periodo).toBe("Fev");
    expect(out.pior.periodo).toBe("Jan");
    expect(out.diferenca).toBe(40);
  });
});
