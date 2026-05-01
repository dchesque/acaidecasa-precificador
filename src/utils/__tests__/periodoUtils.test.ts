import { describe, it, expect } from "vitest";
import {
  criarPeriodoCustomizado,
  criarPeriodoMesCompleto,
  gerarUltimos12Meses,
} from "@/utils/periodoUtils";

describe("criarPeriodoCustomizado (UTC, no off-by-one)", () => {
  it("returns 1 day when start === end (same calendar day)", () => {
    const d = new Date(2024, 2, 15);
    expect(criarPeriodoCustomizado(d, d).diasTotais).toBe(1);
  });

  it("returns 2 days for two consecutive days", () => {
    const start = new Date(2024, 2, 15);
    const end = new Date(2024, 2, 16);
    expect(criarPeriodoCustomizado(start, end).diasTotais).toBe(2);
  });

  it("returns 31 days for the whole of January", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 31);
    expect(criarPeriodoCustomizado(start, end).diasTotais).toBe(31);
  });

  it("works across DST boundaries (no jitter)", () => {
    // BRT used to flip in February in past years; this guards against off-by-one
    // when one of the boundaries crosses a DST change.
    const start = new Date(2024, 1, 15);
    const end = new Date(2024, 1, 25);
    expect(criarPeriodoCustomizado(start, end).diasTotais).toBe(11);
  });

  it("populates mesReferencia from the start date (zero-padded)", () => {
    const start = new Date(2024, 2, 15);
    const end = new Date(2024, 2, 16);
    expect(criarPeriodoCustomizado(start, end).mesReferencia).toBe("2024-03");
  });
});

describe("criarPeriodoMesCompleto", () => {
  it("returns 31 days for January", () => {
    expect(criarPeriodoMesCompleto("2024-01").diasTotais).toBe(31);
  });

  it("returns 29 days for February in a leap year", () => {
    expect(criarPeriodoMesCompleto("2024-02").diasTotais).toBe(29);
  });

  it("returns 28 days for February in a non-leap year", () => {
    expect(criarPeriodoMesCompleto("2023-02").diasTotais).toBe(28);
  });

  it("date range covers the whole month inclusive", () => {
    const p = criarPeriodoMesCompleto("2024-03");
    expect(p.dataInicio.getDate()).toBe(1);
    expect(p.dataFim.getDate()).toBe(31);
  });
});

describe("gerarUltimos12Meses", () => {
  it("returns exactly 12 entries", () => {
    expect(gerarUltimos12Meses()).toHaveLength(12);
  });

  it("entries are ordered chronologically (oldest first)", () => {
    const meses = gerarUltimos12Meses();
    for (let i = 1; i < meses.length; i++) {
      expect(meses[i].dataInicio.getTime()).toBeGreaterThan(
        meses[i - 1].dataInicio.getTime()
      );
    }
  });

  it("the last entry covers the current month", () => {
    const meses = gerarUltimos12Meses();
    const hoje = new Date();
    expect(meses[meses.length - 1].mes).toBe(hoje.getMonth() + 1);
    expect(meses[meses.length - 1].ano).toBe(hoje.getFullYear());
  });
});
