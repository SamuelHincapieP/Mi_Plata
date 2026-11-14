import { describe, it, expect } from "vitest";
import CuentaAhorros from "./CuentaAhorros.js";
import CuentaCorriente from "./CuentaCorriente.js";
import TarjetaCredito from "./TarjetaCredito.js";
import Movimiento from "./Movimiento.js";

// Estas reglas deben coincidir con las de SOperaciones.java (backend).
describe("reglas de las cuentas (iguales al servidor)", () => {
  it("ahorros: interés del 2% sobre el retiro", () => {
    const a = new CuentaAhorros("AHO-1", 500000);
    expect(a.tasaInteres).toBeCloseTo(0.02, 5);
    expect(a.calcularIntereses(100000)).toBeCloseTo(2000, 2);
  });
  it("corriente: usa el límite de sobregiro configurado", () => {
    expect(new CuentaCorriente("C", 1000000).calcularLimiteSobregiro()).toBe(1000000);
    expect(new CuentaCorriente("C", 0).calcularLimiteSobregiro()).toBe(1000000);
    expect(new CuentaCorriente("C", -40000).calcularLimiteSobregiro()).toBe(1000000);
  });
  it("tarjeta: cuota de manejo según las cuotas", () => {
    const t = new TarjetaCredito("T", 3000000);
    expect(t.calcularCuotaManejo(1)).toBe(0);
    expect(t.calcularCuotaManejo(2)).toBe(0);
    expect(t.calcularCuotaManejo(3)).toBe(8500);
    expect(t.calcularCuotaManejo(6)).toBe(8500);
    expect(t.calcularCuotaManejo(7)).toBe(15000);
  });
  it("tarjeta: tasa mensual según las cuotas", () => {
    const t = new TarjetaCredito("T", 3000000);
    expect(t.calcularTasa(2)).toBe(0);
    expect(t.calcularTasa(3)).toBeCloseTo(0.019, 5);
    expect(t.calcularTasa(12)).toBeCloseTo(0.023, 5);
  });
  it("tarjeta: amortización francesa (300.000 a 3 cuotas ≈ 103.823,84)", () => {
    expect(new TarjetaCredito("T", 3000000).calcularCuotaMensual(300000, 3)).toBeCloseTo(103823.84, 1);
  });
  it("tarjeta nueva: todo el cupo disponible", () => {
    const t = new TarjetaCredito("T", 3000000);
    expect(t.cupoDisponible).toBe(3000000);
    expect(t.deuda).toBe(0);
  });
  it("tarjeta: el interés se calcula en la deuda, sin movimiento separado", () => {
    const t = new TarjetaCredito("T", 3000000);
    t.comprar(300000, 3);
    expect(t.deuda).toBeCloseTo(319971.52, 2);
    expect(t.obtenerMovimientos().map((m) => m.tipo)).toEqual(["CUOTA_MANEJO", "COMPRA_TC"]);
  });
  it("un movimiento puede llevar descripción", () => {
    expect(new Movimiento("TRANSFERENCIA_OUT", 1000, 5000, "A AHO-030").descripcion).toBe("A AHO-030");
    expect(new Movimiento("RETIRO", 1000, 5000).descripcion).toBe("");
  });
});
