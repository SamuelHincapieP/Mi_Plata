// storage.js — Convierte el JSON de la API (base de datos) en las clases del dominio.
// Ya no se guarda nada en localStorage: la fuente de datos es la base de datos.
import Cliente from "../lib/Cliente.js";
import CuentaAhorros from "../lib/CuentaAhorros.js";
import CuentaCorriente from "../lib/CuentaCorriente.js";
import TarjetaCredito from "../lib/TarjetaCredito.js";
import Movimiento from "../lib/Movimiento.js";

function deserializarMovimiento(datos) {
  const mov = Object.create(Movimiento.prototype);
  mov._id = datos._id || Date.now();
  mov._fechaHora = datos._fechaHora ? new Date(datos._fechaHora) : new Date();
  mov._tipo = datos._tipo || "MOVIMIENTO";
  mov._valor = Number(datos._valor) || 0;
  mov._saldoPosterior = Number(datos._saldoPosterior) || 0;
  mov._descripcion = datos._descripcion || "";
  return mov;
}

function deserializarCuenta(datos) {
  let cuenta;

  if (datos._tipo === "CuentaAhorros") {
    cuenta = new CuentaAhorros(datos._numeroCuenta, Number(datos._saldo) || 0);
    // La tasa viene de la base de datos (cuenta_ahorros.tasaInteres)
    if (datos._tasaInteres != null) cuenta._tasaInteres = Number(datos._tasaInteres);
  } else if (datos._tipo === "CuentaCorriente") {
    cuenta = new CuentaCorriente(datos._numeroCuenta, Number(datos._saldo) || 0);
    // El sobregiro viene de la base de datos (cuenta_corriente.porcentajeSobregiro)
    if (datos._porcentajeSobregiro != null) cuenta._porcentajeSobregiro = Number(datos._porcentajeSobregiro);
    if (datos._limiteSobregiro != null) cuenta._limiteSobregiro = Number(datos._limiteSobregiro);
  } else if (datos._tipo === "TarjetaCredito") {
    cuenta = new TarjetaCredito(datos._numeroCuenta, Number(datos._cupo) || 0);
    cuenta._deuda = Number(datos._deuda) || 0;
  } else {
    return null;
  }

  cuenta._fechaApertura = datos._fechaApertura ? new Date(datos._fechaApertura) : new Date();
  cuenta._estado = datos._estado || "ACTIVA";
  cuenta._movimientos = Array.isArray(datos._movimientos)
    ? datos._movimientos.map(deserializarMovimiento)
    : [];

  return cuenta;
}

function deserializarCliente(datos) {
  const c = new Cliente(
    datos._id,
    datos._identificacion,
    datos._nombreCompleto,
    datos._celular,
    datos._usuario,
    datos._contrasena,
    datos._fechaRegistro || new Date(),
    datos._rol || "cliente"
  );

  c._intentosFallidos = Number(datos._intentosFallidos) || 0;
  c._bloqueado = Boolean(datos._bloqueado);
  c._cuentas = Array.isArray(datos._cuentas)
    ? datos._cuentas.map(deserializarCuenta).filter(Boolean)
    : [];

  return c;
}

/** Convierte la lista de clientes que llega de la API en clases Cliente[]. */
export function deserializarClientes(jsonArray) {
  return (Array.isArray(jsonArray) ? jsonArray : []).map(deserializarCliente);
}
