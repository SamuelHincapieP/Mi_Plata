// pulso.js — Apoyo del Financial Pulse.
//
// El Pulse dibuja el saldo DISPONIBLE después de cada movimiento. Mover dinero entre la cuenta y
// un bolsillo o una meta no es un movimiento (no deja fila en el historial), pero sí baja o sube el
// disponible. Por eso, entre dos puntos de la línea puede haber dinero "apartado" que ningún
// movimiento explica. Estas funciones lo calculan para poder mostrarlo.

// Efecto de cada tipo sobre el disponible de una cuenta de ahorros o corriente.
const SIGNO = {
  CONSIGNACION: 1,
  TRANSFERENCIA_IN: 1,
  RETIRO: -1,
  TRANSFERENCIA_OUT: -1,
};

/**
 * Dinero que se movió a bolsillos o metas entre el punto anterior y el actual.
 *  > 0  → salió del disponible (lo apartaste)
 *  < 0  → volvió al disponible (lo recuperaste)
 *  0    → todo cuadra con los movimientos (o el tipo no se puede evaluar)
 *
 * @param {{saldo:number}} anterior  punto anterior de la serie
 * @param {{saldo:number, tipo:string, valor:number}} actual  punto actual
 * @param {number} tasaRetiro  interés que cobra la cuenta de ahorros al retirar (0 en corriente)
 */
export function apartadoEntre(anterior, actual, tasaRetiro = 0) {
  const signo = SIGNO[actual.tipo];
  if (!anterior || signo === undefined) return 0;

  // Un retiro de ahorros baja el saldo en el monto MÁS el interés (el movimiento guarda solo el monto)
  const efecto = actual.tipo === "RETIRO" ? -actual.valor * (1 + tasaRetiro) : signo * actual.valor;
  const esperado = anterior.saldo + efecto;
  const diferencia = Math.round((esperado - actual.saldo) * 100) / 100;
  return Math.abs(diferencia) < 0.5 ? 0 : diferencia;
}
