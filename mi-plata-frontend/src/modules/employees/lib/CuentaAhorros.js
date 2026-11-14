/**
 * CuentaAhorros.js
 * ----------------------------------------------------------
 * Subclase de Cuenta que representa una cuenta de ahorros.
 *
 * Características:
 *  - No permite sobregiro: el saldo no puede quedar negativo.
 *  - Al retirar se cobra un interés del 2% sobre el monto
 *    retirado (tasa mensual). El total descontado es:
 *      totalDescontar = monto + (monto × 0.02)
 *  - Las transferencias NO cobran interés (descuento directo).
 * ----------------------------------------------------------
 */

import Cuenta from "./Cuenta.js";
import { ajustarACentavos } from "../../core/utils/moneda.js";

export default class CuentaAhorros extends Cuenta {

  /**
   * @param {string} numeroCuenta - Identificador de la cuenta
   * @param {number} saldo        - Saldo inicial en pesos
   */
  constructor(numeroCuenta, saldo) {
    super(numeroCuenta, saldo);
    this._tasaInteres = 0.02; // 2% cobrado al retirar (igual que cuenta_ahorros.tasaInteres)
  }

  /** Tasa de interés mensual aplicada en retiros */
  get tasaInteres() {
    return this._tasaInteres;
  }

  /** Identificador de tipo (evita constructor.name en producción) */
  get tipo() { return "CuentaAhorros"; }

  /**
   * retirar() — Polimorfismo sobre Cuenta.retirar().
   * Cobra el 2% de interés sobre el monto retirado y
   * verifica que haya saldo suficiente para el total.
   *
   * @param {number} monto - Monto a retirar en pesos
   * @throws Si el monto es inválido, no hay saldo, o el
   *         saldo no alcanza para cubrir también el interés
   */
  retirar(monto) {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    if (monto - this._saldo > 0.005) {
      throw new Error("Saldo insuficiente. La cuenta de ahorros no permite sobregiro.");
    }

    // Calcular el interés sobre el monto a retirar
    const interes        = this.calcularIntereses(monto);
    const totalDescontar = monto + interes;

    // Verificar que haya saldo para cubrir monto + interés
    if (totalDescontar - this._saldo > 0.005) {
      throw new Error(
        `Saldo insuficiente al incluir el interés de $${interes.toFixed(0)}.`
      );
    }

    this._saldo = ajustarACentavos(this._saldo - totalDescontar);
    this.registrarMovimiento("RETIRO", monto);
  }

  /**
   * calcularIntereses() — Calcula el interés del 2%
   * sobre un monto dado.
   * @param {number} monto
   * @returns {number} Valor del interés en pesos
   */
  calcularIntereses(monto) {
    return monto * this._tasaInteres;
  }

  /**
   * transferir() — Envía dinero a otra cuenta SIN cobrar interés.
   * Descuenta el monto directamente del saldo.
   *
   * @param {Cuenta} destino - Cuenta receptora
   * @param {number} monto   - Monto a transferir
   * @throws Si la cuenta destino es la misma, el monto es inválido
   *         o no hay saldo suficiente
   */
  transferir(destino, monto) {
    if (destino.numeroCuenta === this._numeroCuenta) {
      throw new Error("No puedes transferir a la misma cuenta.");
    }
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    if (monto - this._saldo > 0.005) {
      throw new Error("Saldo insuficiente para la transferencia.");
    }

    this._saldo = ajustarACentavos(this._saldo - monto);
    this.registrarMovimiento("TRANSFERENCIA_OUT", monto);
    destino.consignar(monto); // acreditar en la cuenta destino
  }

  /**
   * validarDestino() — Verifica que la cuenta destino sea distinta.
   * @param {Cuenta} destino
   * @returns {boolean}
   */
  validarDestino(destino) {
    return destino.numeroCuenta !== this._numeroCuenta;
  }
}
