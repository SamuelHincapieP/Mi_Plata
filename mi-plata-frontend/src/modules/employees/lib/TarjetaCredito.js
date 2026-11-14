/**
 * TarjetaCredito.js
 * ----------------------------------------------------------
 * Hereda de Cuenta (polimorfismo).
 * Una tarjeta de crédito no tiene saldo positivo propio:
 * su "saldo" heredado siempre es 0. Lo relevante es el CUPO
 * (límite de crédito) y la DEUDA acumulada.
 *
 * Cuotas de manejo (cobradas al momento de cada compra):
 *   1  cuota  → $ 0       (sin cuota)
 *   2  cuotas → $ 0       (sin cuota)
 *   3–6 cuotas → $ 8.500  (cuota de manejo básica)
 *   7+ cuotas  → $ 15.000 (cuota de manejo premium)
 *
 * Tasas de interés mensual (sobre el capital):
 *   ≤ 2 cuotas → 0 %
 *   3–6 cuotas → 1.9 % mensual
 *   ≥ 7 cuotas → 2.3 % mensual
 *
 * Fórmula de cuota amortizada (cuota fija francesa):
 *   Cuota = Capital × tasa / (1 − (1 + tasa)^−n)
 *   Cuando tasa = 0: Cuota = Capital / n
 * ----------------------------------------------------------
 */

import Cuenta from "./Cuenta.js";
import { ajustarACentavos } from "../../core/utils/moneda.js";

export default class TarjetaCredito extends Cuenta {

  /**
   * @param {string} numeroCuenta  - Identificador de la tarjeta (ej: "TC-8888")
   * @param {number} cupo          - Límite de crédito aprobado en pesos
   */
  constructor(numeroCuenta, cupo) {
    // Llamamos al constructor padre con saldo 0:
    // la TC no acumula dinero propio, solo deuda contra el cupo.
    super(numeroCuenta, 0);
    this._cupo  = cupo;  // límite total de crédito
    this._deuda = 0;     // deuda acumulada (empieza en cero)
  }

  // ── Getters ──────────────────────────────────────────────

  /** Cupo total aprobado de la tarjeta */
  get cupo() { return this._cupo; }

  /** Deuda actual acumulada */
  get deuda() { return this._deuda; }

  /** Identificador de tipo (evita constructor.name en producción) */
  get tipo() { return "TarjetaCredito"; }

  /**
   * Cupo disponible para nuevas compras o avances.
   * Fórmula: cupoDisponible = cupo − deuda
   */
  get cupoDisponible() { return this._cupo - this._deuda; }

  // ── Operaciones ──────────────────────────────────────────

  /**
   * retirar() — Avance en efectivo.
   * Polimorfismo sobre Cuenta.retirar().
   * Aumenta la deuda y registra el movimiento.
   *
   * @param {number} monto - Monto del avance en pesos
   * @throws Si el monto es inválido o supera el cupo disponible
   */
  retirar(monto) {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    if (monto > this.cupoDisponible) {
      throw new Error(
        `Cupo insuficiente. Cupo disponible: $${this.cupoDisponible.toFixed(0)}`
      );
    }

    this._deuda = ajustarACentavos(this._deuda + monto);
    this.registrarMovimiento("RETIRO", monto);
  }

  /**
   * comprar() — Realiza una compra a cuotas con la tarjeta.
   *
   * Proceso:
   *  1. Valida parámetros.
   *  2. Calcula la cuota de manejo según el número de cuotas.
   *  3. Suma capital, interés y cuota de manejo para obtener la deuda.
   *  4. Verifica que el total no supere el cupo disponible.
   *  5. Aumenta la deuda en el total calculado (capital + interés + manejo).
   *  6. Registra el movimiento.
   *  7. Retorna la cuota mensual calculada.
   *
   * @param {number} monto   - Precio de compra en pesos
   * @param {number} cuotas  - Número de cuotas (mínimo 1)
   * @returns {number}        - Cuota mensual a pagar
   * @throws Si el monto/cuotas son inválidos o no hay cupo
   */
  comprar(monto, cuotas) {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    if (cuotas < 1) {
      throw new Error("El número de cuotas debe ser mínimo 1.");
    }

    // Calcular la cuota de manejo que se cobra por la financiación
    const cuotaManejo = this.calcularCuotaManejo(cuotas);

    const cuotaMensual = this.calcularCuotaMensual(monto, cuotas);
    const intereses = ajustarACentavos(cuotaMensual * cuotas - monto);
    // El cupo refleja el costo completo de financiación, incluido el interés.
    const totalADebitar = monto + intereses + cuotaManejo;

    if (totalADebitar > this.cupoDisponible) {
      throw new Error(
        `Cupo insuficiente. Total con cuota de manejo ($${cuotaManejo.toFixed(0)}): ` +
        `$${totalADebitar.toFixed(0)}. Disponible: $${this.cupoDisponible.toFixed(0)}`
      );
    }

    this._deuda = ajustarACentavos(this._deuda + totalADebitar);

    // El interés pertenece al cálculo de cuotas, no es un movimiento independiente.
    // Registrar el movimiento por el monto de compra (sin cargos adicionales).
    this.registrarMovimiento("COMPRA_TC", monto);

    // Si hay cuota de manejo, registrarla como movimiento separado para transparencia
    if (cuotaManejo > 0) {
      this.registrarMovimiento("CUOTA_MANEJO", cuotaManejo);
    }

    return cuotaMensual;
  }

  /**
   * pagar() — Abona a la deuda de la tarjeta y recupera cupo.
   *
   * @param {number} monto - Monto a abonar en pesos
   * @throws Si el monto es inválido o supera la deuda actual
   */
  pagar(monto) {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    // Se tolera medio centavo de diferencia: si la deuda guardada
    // viene de una suma con error de coma flotante, pagar el valor
    // exacto que ve el usuario no debe rechazarse.
    if (monto - this._deuda > 0.005) {
      throw new Error(
        `El pago supera la deuda actual de $${this._deuda.toFixed(0)}.`
      );
    }

    // Si el pago cubre toda la deuda, queda en 0 exacto (nunca en -0).
    const restante = ajustarACentavos(this._deuda - monto);
    this._deuda = restante > 0 ? restante : 0;
    this.registrarMovimiento("PAGO_TC", monto);
  }

  // ── Cálculos financieros ─────────────────────────────────

  /**
   * calcularCuotaManejo() — Retorna la cuota de manejo fija
   * que se cobra una sola vez al momento de la compra,
   * según el número de cuotas financiadas.
   *
   * Tabla de cuotas de manejo:
   *   1–2 cuotas  → $     0  (sin financiación, sin cuota)
   *   3–6 cuotas  → $ 8.500  (cuota básica)
   *   7+ cuotas   → $15.000  (cuota premium por largo plazo)
   *
   * @param {number} cuotas - Número de cuotas
   * @returns {number}       - Cuota de manejo en pesos
   */
  calcularCuotaManejo(cuotas) {
    if (cuotas <= 2) return 0;       // sin interés, sin cuota de manejo
    if (cuotas <= 6) return 8500;    // financiación corta: $8.500
    return 15000;                    // financiación larga: $15.000
  }

  /**
   * calcularTasa() — Retorna la tasa de interés mensual
   * aplicable según el número de cuotas.
   *
   * Tabla de tasas:
   *   ≤ 2 cuotas → 0 %      (sin interés)
   *   3–6 cuotas → 1.9 % mensual
   *   ≥ 7 cuotas → 2.3 % mensual
   *
   * @param {number} cuotas - Número de cuotas
   * @returns {number}       - Tasa mensual (0.019, 0.023 ó 0)
   */
  calcularTasa(cuotas) {
    if (cuotas <= 2) return 0;
    if (cuotas <= 6) return 0.019;
    return 0.023;
  }

  /**
   * calcularCuotaMensual() — Aplica la fórmula francesa de
   * amortización para obtener la cuota fija mensual.
   *
   * Fórmula:
   *   Si tasa > 0:  Cuota = Capital × tasa / (1 − (1 + tasa)^−n)
   *   Si tasa = 0:  Cuota = Capital / n
   *
   * @param {number} capital - Monto original de la compra
   * @param {number} cuotas  - Número de cuotas
   * @returns {number}        - Cuota mensual en pesos
   */
  calcularCuotaMensual(capital, cuotas) {
    const tasa = this.calcularTasa(cuotas);

    // Sin tasa: dividir el capital entre las cuotas
    if (tasa === 0) {
      return capital / cuotas;
    }

    // Con tasa: fórmula de amortización francesa
    // Numerador: capital × tasa
    // Denominador: 1 − (1 + tasa)^(-n)
    return (capital * tasa) / (1 - Math.pow(1 + tasa, -cuotas));
  }

  // ── Transferencia desde TC ────────────────────────────────

  /**
   * transferir() — Envía dinero desde el cupo de la TC
   * a cualquier otra cuenta del sistema.
   * Se comporta como un avance en efectivo que se redirige.
   *
   * @param {Cuenta} destino - Cuenta receptora
   * @param {number} monto   - Monto a enviar
   * @throws Si la cuenta destino es la misma, el monto es inválido
   *         o no hay cupo suficiente
   */
  transferir(destino, monto) {
    if (destino.numeroCuenta === this._numeroCuenta) {
      throw new Error("No puedes transferir a la misma cuenta.");
    }
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }
    if (monto > this.cupoDisponible) {
      throw new Error(
        `Cupo insuficiente. Disponible: $${this.cupoDisponible.toFixed(0)}`
      );
    }

    // Incrementar deuda y acreditar en la cuenta destino
    this._deuda = ajustarACentavos(this._deuda + monto);
    this.registrarMovimiento("TRANSFERENCIA_OUT", monto);
    destino.consignar(monto);
  }

  /**
   * validarDestino() — Verifica que la cuenta destino
   * sea diferente a esta misma tarjeta.
   *
   * @param {Cuenta} destino - Cuenta a validar
   * @returns {boolean}
   */
  validarDestino(destino) {
    return destino.numeroCuenta !== this._numeroCuenta;
  }
}
