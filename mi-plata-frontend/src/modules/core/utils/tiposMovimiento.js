// tiposMovimiento.js — Un solo lugar para saber cómo se muestra cada tipo de movimiento.
// Los nombres coinciden con la tabla tipo_movimiento de la base de datos.
// Si se agrega un tipo nuevo en la base, se agrega aquí (y en reportes/reporte.py).
// Mover plata entre la cuenta y los bolsillos/metas NO es una transacción: no tiene tipo de movimiento.

/** Tipos en los que el dinero SALE de la cuenta (se muestran con "−"). */
export const SALIDAS = [
  "RETIRO",
  "TRANSFERENCIA_OUT",
  "COMPRA_TC",
  "CUOTA_MANEJO",
];

/** Nombre del ícono (core/design-system/Icono.jsx) de cada tipo. */
export const ICONOS = {
  CONSIGNACION: "entrada",
  RETIRO: "salida",
  TRANSFERENCIA_OUT: "salida",
  TRANSFERENCIA_IN: "entrada",
  COMPRA_TC: "compra",
  PAGO_TC: "recibo",
  CUOTA_MANEJO: "recibo",
};

/** Texto legible para el usuario. */
export const ETIQUETAS = {
  CONSIGNACION: "Consignación",
  RETIRO: "Retiro",
  TRANSFERENCIA_OUT: "Transferencia enviada",
  TRANSFERENCIA_IN: "Transferencia recibida",
  COMPRA_TC: "Compra con tarjeta",
  PAGO_TC: "Pago de tarjeta",
  CUOTA_MANEJO: "Cuota de manejo",
};

export function esSalida(tipo) {
  return SALIDAS.includes(tipo);
}

export function iconoDeTipo(tipo) {
  return ICONOS[tipo] || "movimientos";
}

/** Si el tipo no está en la lista, se muestra el nombre de la base sin guiones bajos. */
export function etiquetaTipo(tipo) {
  return ETIQUETAS[tipo] || String(tipo ?? "").replaceAll("_", " ");
}
