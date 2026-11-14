import { describe, it, expect } from "vitest";
import { generarCsv } from "./exportarCsv.js";
import { deserializarClientes } from "../../employees/services/storage.js";
import clientesFx from "../../../test/fixtures/clientes.json";

const samuel = deserializarClientes(clientesFx.body).find((c) => c.usuario === "samuel");

describe("exportarCsv", () => {
  const lineas = generarCsv(samuel).split("\n");

  it("incluye instrucciones de separación y encabezados legibles para Excel", () => {
    expect(lineas[0]).toBe("sep=;");
    expect(lineas[1]).toBe("Fecha;Tipo de movimiento;Monto (COP);Saldo posterior (COP);Cuenta;Descripción");
  });

  it("hay una línea por cada movimiento", () => {
    const total = samuel.cuentas.reduce((t, c) => t + c.obtenerMovimientos().length, 0);
    expect(lineas.length - 2).toBe(total);
  });

  it("cada línea tiene 6 columnas y trae la cuenta", () => {
    for (const linea of lineas.slice(2)) {
      expect(linea.split(";").length).toBeGreaterThanOrEqual(6);
      expect(linea).toMatch(/(AHO|CTE|TC)-\d+/);
    }
  });

  it("la descripción de una transferencia queda en el archivo", () => {
    expect(generarCsv(samuel)).toMatch(/TRANSFERENCIA OUT;.*;A AHO-030/);
  });
});
