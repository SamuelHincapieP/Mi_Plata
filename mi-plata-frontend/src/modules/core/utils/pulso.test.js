import { describe, it, expect } from "vitest";
import { apartadoEntre } from "./pulso.js";

describe("pulso.apartadoEntre: dinero movido a bolsillos y metas entre dos puntos", () => {
  it("el caso real: 5 M, bolsillo de 500 K, meta de 300 K y consignación de 3 M → quedan 7,2 M", () => {
    const primero = { saldo: 5000000, tipo: "CONSIGNACION", valor: 5000000 };
    const segundo = { saldo: 7200000, tipo: "CONSIGNACION", valor: 3000000 };
    // 5 M + 3 M serían 8 M; el Pulse marca 7,2 M porque 800 K están en el bolsillo y en la meta
    expect(apartadoEntre(primero, segundo)).toBe(800000);
  });

  it("si todo cuadra con los movimientos, no hay dinero apartado", () => {
    const primero = { saldo: 5000000, tipo: "CONSIGNACION", valor: 5000000 };
    const segundo = { saldo: 8000000, tipo: "CONSIGNACION", valor: 3000000 };
    expect(apartadoEntre(primero, segundo)).toBe(0);
  });

  it("un retiro de ahorros incluye el interés del 2 %: no se confunde con dinero apartado", () => {
    const antes = { saldo: 500000 };
    const retiro = { saldo: 398000, tipo: "RETIRO", valor: 100000 }; // 100.000 + 2.000 de interés
    expect(apartadoEntre(antes, retiro, 0.02)).toBe(0);
  });

  it("en cuenta corriente el retiro no tiene interés", () => {
    expect(apartadoEntre({ saldo: 1000000 }, { saldo: 900000, tipo: "RETIRO", valor: 100000 }, 0)).toBe(0);
  });

  it("transferencias enviadas y recibidas cuadran", () => {
    expect(apartadoEntre({ saldo: 1000000 }, { saldo: 900000, tipo: "TRANSFERENCIA_OUT", valor: 100000 })).toBe(0);
    expect(apartadoEntre({ saldo: 900000 }, { saldo: 950000, tipo: "TRANSFERENCIA_IN", valor: 50000 })).toBe(0);
  });

  it("dinero que volvió de un bolsillo se informa en negativo (lo recuperaste)", () => {
    const antes = { saldo: 4200000 };
    const consignacion = { saldo: 7700000, tipo: "CONSIGNACION", valor: 3000000 }; // esperado 7,2 M; hay 500 K de más
    expect(apartadoEntre(antes, consignacion)).toBe(-500000);
  });

  it("un tipo que no se puede evaluar (tarjeta) no inventa avisos", () => {
    expect(apartadoEntre({ saldo: 3000000 }, { saldo: 2700000, tipo: "COMPRA_TC", valor: 300000 })).toBe(0);
  });

  it("sin punto anterior no hay nada que comparar", () => {
    expect(apartadoEntre(undefined, { saldo: 5000000, tipo: "CONSIGNACION", valor: 5000000 })).toBe(0);
  });
});
