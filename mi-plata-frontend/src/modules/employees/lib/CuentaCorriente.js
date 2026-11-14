/**
 * CuentaCorriente.js
 * ----------------------------------------------------------
 * Subclase de Cuenta que representa una cuenta corriente.
 *
 * Características:
 *  - Permite sobregiro hasta el límite asignado a la cuenta.
 *  - No cobra interés en retiros (a diferencia de Ahorros).
 *  - Las transferencias también usan el límite de sobregiro.
 *
 * Ejemplo de sobregiro:
 *   Saldo: $1.000.000 → Límite sobregiro: $1.000.000
 *   Disponible total: $2.000.000
 * ----------------------------------------------------------
 */

import Cuenta from "./Cuenta.js";
import { ajustarACentavos } from "../../core/utils/moneda.js";

export default class CuentaCorriente extends Cuenta {

  /**
   * @param {string} numeroCuenta - Identificador de la cuenta
   * @param {number} saldo        - Saldo inicial en pesos
   */
  constructor(numeroCuenta, saldo) {
    super(numeroCuenta, saldo);
    this._porcentajeSobregiro = 0.05;
    this._limiteSobregiro = 1000000; // valor real de cuenta_corriente.limiteSobregiro
  }

  /** Porcentaje de sobregiro permitido (0.05 = 5%) */
  get porcentajeSobregiro() {
    return this._porcentajeSobregiro;
  }

  /** Identificador de tipo (evita constructor.name en producción) */
  get tipo() { return "CuentaCorriente"; }

  /**
   * calcularLimiteSobregiro() — Retorna el monto máximo de sobregiro.
   * Es el valor configurado por el banco, independiente del saldo.
   *
   * @returns {number} Límite de sobregiro en pesos
   */
  calcularLimiteSobregiro() {
    return this._limiteSobregiro;
  }

  /**
   * retirar() — Polimorfismo sobre Cuenta.retirar().
   * Permite retirar hasta saldo + 5% del saldo.
   *
   * @param {number} monto - Monto a retirar en pesos
   * @throws Si el monto es inválido o supera el disponible con sobregiro
   */
  retirar(monto) {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }

    // El disponible incluye el saldo más el límite de sobregiro
    const disponible = this._saldo + this.calcularLimiteSobregiro();

    if (monto - disponible > 0.005) {
      throw new Error(
        `Límite excedido. Disponible con sobregiro: $${disponible.toFixed(0)}`
      );
    }

    this._saldo = ajustarACentavos(this._saldo - monto);
    this.registrarMovimiento("RETIRO", monto);
  }

  /**
   * transferir() — Envía dinero usando también el límite de sobregiro.
   *
   * @param {Cuenta} destino - Cuenta receptora
   * @param {number} monto   - Monto a transferir
   * @throws Si la cuenta destino es la misma, el monto es inválido
   *         o supera el disponible con sobregiro
   */
  transferir(destino, monto) {
    if (destino.numeroCuenta === this._numeroCuenta) {
      throw new Error("No puedes transferir a la misma cuenta.");
    }
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }

    const disponible = this._saldo + this.calcularLimiteSobregiro();
    if (monto - disponible > 0.005) {
      throw new Error(
        `Saldo insuficiente. Disponible: $${disponible.toFixed(0)}`
      );
    }

    this._saldo = ajustarACentavos(this._saldo - monto);
    this.registrarMovimiento("TRANSFERENCIA_OUT", monto);
    destino.consignar(monto);
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
