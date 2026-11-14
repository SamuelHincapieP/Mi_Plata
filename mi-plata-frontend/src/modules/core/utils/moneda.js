// moneda.js — Formato monetario colombiano (igual al original).

/**
 * Ajusta un monto a centavos enteros.
 *
 * Al sumar y restar montos con centavos (saldo += monto), JavaScript
 * acumula errores de coma flotante: 874.42 + 1637.28 + 925.61 + 1498.33
 * da 4935.639999999999 en vez de 4935.64. Con ese error, retirar o
 * pagar el valor exacto que ve el usuario se rechazaba porque la
 * validación veía 4935.64 > 4935.639999999999.
 *
 * @param {number} n - Monto a ajustar
 * @returns {number}   - El mismo monto redondeado a 2 decimales
 */
export function ajustarACentavos(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function fmt(n) {
  return "$ " + Math.round(Number(n) || 0).toLocaleString("es-CO");
}

/**
 * Formato que conserva los centavos cuando el monto los tiene.
 *
 * fmt() redondea a pesos enteros, así que una deuda de $0,99 se
 * muestra como "$ 1". El usuario ingresa 1 y la app lo rechaza
 * porque 1 sí supera lo que realmente debe. Con fmtExacto() el
 * valor real queda visible y se puede pagar exactamente.
 *
 * @param {number} n - Monto a formatear
 * @returns {string}   - "$ 1.235" si es entero, "$ 1.234,56" si tiene centavos
 */
export function fmtExacto(n) {
  const valor = Math.round((Number(n) || 0) * 100) / 100;
  const decimales = Number.isInteger(valor)
    ? undefined
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return "$ " + valor.toLocaleString("es-CO", decimales);
}

/** Formato para el saldo gigante: separa pesos y centavos. */
export function partesMonto(n) {
  const valor = Math.round((Number(n) || 0) * 100) / 100;
  const pesos = Math.floor(Math.abs(valor));
  const centavos = Math.round((Math.abs(valor) - pesos) * 100);
  return {
    pesos: pesos.toLocaleString("es-CO"),
    centavos: String(centavos).padStart(2, "0"),
    negativo: valor < 0,
  };
}

/** Enmascara un número de cuenta: **** **** **** 1234 */
export function enmascarar(texto) {
  const solo = String(texto).replace(/[^A-Z0-9]/gi, "");
  if (solo.length <= 4) return solo;
  return "**** " + solo.slice(-4).toUpperCase();
}
