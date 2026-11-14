import { describe, it, expect } from "vitest";
import { fmt, fmtExacto, ajustarACentavos, partesMonto, enmascarar } from "./moneda.js";

describe("moneda", () => {
  it("fmt da formato colombiano sin centavos", () => {
    expect(fmt(50000)).toMatch(/50\.000/);
    expect(fmt(1234567)).toMatch(/1\.234\.567/);
    expect(fmt(null)).toBe("$ 0");
  });

  it("ajustarACentavos evita errores de coma flotante", () => {
    expect(ajustarACentavos(874.42 + 1637.28 + 925.61 + 1498.33)).toBe(4935.64);
  });

  it("fmtExacto conserva los centavos cuando existen", () => {
    expect(fmtExacto(10.5)).toMatch(/10,50/);
    expect(fmtExacto(10)).toBe("$ 10");
  });

  it("partesMonto separa pesos y centavos", () => {
    expect(partesMonto(1500.25)).toEqual({ pesos: (1500).toLocaleString("es-CO"), centavos: "25", negativo: false });
    expect(partesMonto(-40000).negativo).toBe(true);
  });

  it("enmascarar deja solo los 4 últimos", () => {
    expect(enmascarar("AHO-020")).toBe("**** O020");
  });
});
