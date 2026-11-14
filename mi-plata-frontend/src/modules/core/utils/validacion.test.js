import { describe, it, expect } from "vitest";
import { soloDigitos, soloMonto, soloCuenta, soloTexto, soloUsuario, soloNombre, LIMITES } from "./validacion.js";

describe("validacion: límites iguales a las columnas de la base de datos", () => {
  it("los topes coinciden con el script SQL", () => {
    expect(LIMITES.mensaje).toBe(200); // transferencia.mensaje VARCHAR(200)
    expect(LIMITES.comercio).toBe(120); // compra_tc.comercio VARCHAR(120)
    expect(LIMITES.metaNombre).toBe(60); // meta_ahorro.nombreMeta VARCHAR(60)
    expect(LIMITES.bolsilloNombre).toBe(40); // bolsillo.nombreBolsillo VARCHAR(40)
  });
});

describe("validacion: filtros de escritura", () => {
  it("soloDigitos quita letras y respeta el máximo", () => {
    expect(soloDigitos("12ab34", 10)).toBe("1234");
    expect(soloDigitos("12345678901234", 10)).toBe("1234567890");
    expect(soloDigitos(undefined, 5)).toBe("");
  });

  it("soloMonto deja un solo punto y dos decimales", () => {
    expect(soloMonto("12abc.5")).toBe("12.5");
    expect(soloMonto("1.2.3")).toBe("1.23");
    expect(soloMonto("10.999")).toBe("10.99");
    expect(soloMonto("-50")).toBe("50");
  });

  it("soloCuenta pasa a mayúsculas y quita símbolos", () => {
    expect(soloCuenta("aho-020!")).toBe("AHO-020");
    expect(soloCuenta("TC-0221234")).toBe("TC-0221");
  });

  it("soloTexto corta al máximo permitido", () => {
    expect(soloTexto("x".repeat(250), LIMITES.mensaje)).toHaveLength(200);
    expect(soloTexto(null, 10)).toBe("");
  });

  it("soloUsuario y soloNombre limpian caracteres raros", () => {
    expect(soloUsuario("Ana Ruiz!")).toBe("anaruiz");
    expect(soloNombre("María 123 O'Brien")).toBe("María  O'Brien");
  });
});
