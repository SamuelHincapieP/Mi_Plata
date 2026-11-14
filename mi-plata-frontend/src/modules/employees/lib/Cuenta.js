/**
 * Cuenta.js — Clase base abstracta
 * ----------------------------------------------------------
 * Define la estructura y comportamientos comunes de todas
 * las cuentas bancarias del sistema:
 *   - CuentaAhorros
 *   - CuentaCorriente
 *   - TarjetaCredito
 *
 * Aplica el principio de herencia y polimorfismo:
 * el método retirar() es abstracto y cada subclase lo
 * implementa con sus propias reglas.
 * ----------------------------------------------------------
 */

import Movimiento from "./Movimiento.js";
import { ajustarACentavos } from "../../core/utils/moneda.js";

export default class Cuenta {

  /**
   * @param {string} numeroCuenta - Identificador único de la cuenta
   * @param {number} saldo        - Saldo inicial en pesos
   */
  constructor(numeroCuenta, saldo) {
    this._numeroCuenta  = numeroCuenta;
    // Se ajusta a centavos: al recargar desde localStorage el saldo
    // puede venir con decimales de error (4935.639999999999).
    this._saldo         = ajustarACentavos(saldo);
    this._fechaApertura = new Date();   // fecha en que se crea la cuenta
    this._estado        = "ACTIVA";     // estado inicial
    this._movimientos   = [];           // historial de movimientos
  }

  // ── Getters ──────────────────────────────────────────────

  /** Número identificador de la cuenta */
  get numeroCuenta() { return this._numeroCuenta; }

  /** Saldo actual en pesos */
  get saldo() { return this._saldo; }

  /** Fecha en que se abrió la cuenta */
  get fechaApertura() { return this._fechaApertura; }

  /** Estado de la cuenta: "ACTIVA" | "INACTIVA" */
  get estado() { return this._estado; }

  /**
   * Identificador de tipo de cuenta.
   * Se usa en vez de constructor.name porque el bundler minifica
   * los nombres de clase en producción.
   */
  get tipo() { return "Cuenta"; }

  /**
   * Lista de movimientos (copia para evitar mutaciones externas).
   * Usar obtenerMovimientos() para verlos ordenados.
   */
  get movimientos() { return [...this._movimientos]; }

  // ── Operaciones comunes ───────────────────────────────────

  /**
   * consignar() — Agrega dinero al saldo y registra el movimiento.
   * Es igual para todas las cuentas (no se sobreescribe).
   *
   * @param {number} monto - Monto a consignar (debe ser > 0)
   */
  consignar(monto) {
    if (monto <= 0) return; // ignorar montos inválidos silenciosamente

    this._saldo = ajustarACentavos(this._saldo + monto);
    this.registrarMovimiento("CONSIGNACION", monto);
  }

  /**
   * retirar() — MÉTODO ABSTRACTO.
   * Cada subclase debe implementar su propia lógica de retiro.
   * Si se llama directamente sobre Cuenta, lanza un error.
   *
   * @param {number} monto
   * @throws Error siempre (debe ser sobreescrito)
   */
  retirar(_monto) {
    throw new Error("Metodo abstracto");
  }

  /**
   * registrarMovimiento() — Crea un Movimiento y lo agrega
   * al historial de la cuenta.
   *
   * @param {string} tipo  - Tipo de movimiento (CONSIGNACION, RETIRO, etc.)
   * @param {number} monto - Valor del movimiento
   */
  registrarMovimiento(tipo, monto) {
    // Se pasa el saldo actual como "saldo posterior" al movimiento
    const mov = new Movimiento(tipo, monto, this._saldo);
    this._movimientos.push(mov);
  }

  /**
   * obtenerMovimientos() — Retorna el historial ordenado
   * del más reciente al más antiguo (copia del array).
   *
   * @returns {Movimiento[]}
   */
  obtenerMovimientos() {
    return [...this._movimientos].reverse();
  }

  /**
   * consultarSaldo() — Retorna el saldo actual.
   * Útil para acceso programático sin usar el getter.
   *
   * @returns {number}
   */
  consultarSaldo() {
    return this._saldo;
  }
}
