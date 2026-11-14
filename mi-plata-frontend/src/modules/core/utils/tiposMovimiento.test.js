import { SALIDAS, ICONOS, ETIQUETAS, esSalida, iconoDeTipo, etiquetaTipo } from "./tiposMovimiento.js";

// Copia del catálogo de la tabla tipo_movimiento (mi_plata_v4.sql).
// Mover plata entre la cuenta y los bolsillos/metas NO es una transacción, por eso no tiene tipo de movimiento.
// Si se agrega un tipo en la base de datos, esta prueba falla hasta que se agregue también en tiposMovimiento.js.
const CATALOGO_BD = [
  "CONSIGNACION", "RETIRO", "TRANSFERENCIA_OUT", "TRANSFERENCIA_IN", "COMPRA_TC", "PAGO_TC", "CUOTA_MANEJO",
];

describe("tiposMovimiento", () => {
  test("todos los tipos de la base de datos tienen ícono y etiqueta", () => {
    for (const tipo of CATALOGO_BD) {
      expect(ICONOS[tipo]).toBeTruthy();
      expect(ETIQUETAS[tipo]).toBeTruthy();
    }
  });

  test("no hay tipos de más que la base de datos no conozca", () => {
    expect(Object.keys(ETIQUETAS).sort()).toEqual([...CATALOGO_BD].sort());
    for (const s of SALIDAS) expect(CATALOGO_BD).toContain(s);
  });

  test("bolsillos y metas no son movimientos: no existen como tipo", () => {
    for (const tipo of ["BOLSILLO_DEPOSITO", "BOLSILLO_RETIRO", "META_APORTE", "META_RETIRO"]) {
      expect(ETIQUETAS[tipo]).toBeUndefined();
      expect(ICONOS[tipo]).toBeUndefined();
      expect(SALIDAS).not.toContain(tipo);
    }
  });

  test("el dinero que sale de la cuenta se marca como salida", () => {
    for (const t of ["RETIRO", "TRANSFERENCIA_OUT", "COMPRA_TC", "CUOTA_MANEJO"]) {
      expect(esSalida(t)).toBe(true);
    }
  });

  test("el dinero que entra a la cuenta no es salida", () => {
    for (const t of ["CONSIGNACION", "TRANSFERENCIA_IN", "PAGO_TC"]) {
      expect(esSalida(t)).toBe(false);
    }
  });

  test("un tipo desconocido no rompe la pantalla", () => {
    expect(iconoDeTipo("OTRO_TIPO")).toBe("movimientos");
    expect(etiquetaTipo("OTRO_TIPO")).toBe("OTRO TIPO");
  });
});
