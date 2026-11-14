import { describe, it, expect } from "vitest";
import { deserializarClientes } from "./storage.js";
import clientesFx from "../../../test/fixtures/clientes.json";

// clientesFx.body es la respuesta REAL de GET /api/banco/clientes generada por el backend.
const clientes = deserializarClientes(clientesFx.body);
const porUsuario = (u) => clientes.find((c) => c.usuario === u);

describe("storage.deserializarClientes (JSON del backend → clases)", () => {
  it("convierte cada cliente", () => {
    const usuarios = clientes.map((c) => c.usuario);
    for (const u of ["admin", "samuel", "maria", "juan"]) expect(usuarios).toContain(u);
    expect(porUsuario("samuel").nombreCompleto).toBe("Samuel Hincapie");
  });

  it("el administrador no tiene cuentas", () => {
    expect(porUsuario("admin").cuentas).toHaveLength(0);
  });

  it("samuel tiene ahorros, corriente y tarjeta", () => {
    expect(porUsuario("samuel").cuentas.map((c) => c.tipo)).toEqual(["CuentaAhorros", "CuentaCorriente", "TarjetaCredito"]);
  });

  it("la tasa y el sobregiro vienen de la base de datos", () => {
    const [ahorros, corriente] = porUsuario("samuel").cuentas;
    expect(ahorros.tasaInteres).toBeCloseTo(0.02, 5);
    expect(corriente.porcentajeSobregiro).toBeCloseTo(0.05, 5);
  });

  it("la tarjeta calcula el cupo disponible con cupo y deuda de la base", () => {
    const tc = porUsuario("samuel").cuentas.find((c) => c.tipo === "TarjetaCredito");
    expect(tc.cupoDisponible).toBeCloseTo(3000000 - tc.deuda, 2);
  });

  it("los movimientos traen tipo, valor, fecha y descripción", () => {
    const movs = porUsuario("samuel").cuentas.flatMap((c) => c.obtenerMovimientos());
    expect(movs.length).toBeGreaterThan(0);
    for (const m of movs) {
      expect(typeof m.tipo).toBe("string");
      expect(typeof m.valor).toBe("number");
      expect(m.fechaHora instanceof Date).toBe(true);
      expect(typeof m.descripcion).toBe("string");
    }
    const enviada = movs.find((m) => m.tipo === "TRANSFERENCIA_OUT");
    expect(enviada.descripcion).toMatch(/^A [A-Z]+-\d+/);
  });

  it("si el servidor manda algo raro, devuelve una lista vacía", () => {
    expect(deserializarClientes(null)).toEqual([]);
    expect(deserializarClientes(undefined)).toEqual([]);
  });
});
