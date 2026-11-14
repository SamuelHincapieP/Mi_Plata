// validacion.js — Límites de entrada en el cliente (Sistema V2).
// Evita montos absurdos, documentos largos y caracteres no permitidos.

export const LIMITES = {
  documento: 10,      // cédula colombiana: máx. 10 dígitos
  celular: 10,        // celular colombiano: 10 dígitos
  usuario: 20,
  contrasena: 64,
  montoEnteros: 10,   // hasta 9.999.999.999
  montoDecimales: 2,
  cuenta: 7,          // AHO-000 / CTE-000 / TC-000
  nombre: 60,
  mensaje: 200,       // transferencia.mensaje VARCHAR(200)
  comercio: 120,      // compra_tc.comercio VARCHAR(120)
  metaNombre: 60,     // meta_ahorro.nombreMeta VARCHAR(60)
  bolsilloNombre: 40, // bolsillo.nombreBolsillo VARCHAR(40)
};

/** Solo dígitos, hasta `max` caracteres. */
export function soloDigitos(valor, max) {
  return String(valor ?? "").replace(/\D/g, "").slice(0, max);
}

/**
 * Solo monto válido: dígitos con un máximo de un punto decimal,
 * hasta `maxEnteros` enteros y `maxDec` decimales. Sin negativos.
 */
export function soloMonto(valor, maxEnteros = LIMITES.montoEnteros, maxDec = LIMITES.montoDecimales) {
  let v = String(valor ?? "").replace(/[^\d.]/g, "");
  const partes = v.split(".");
  if (partes.length > 2) v = partes[0] + "." + partes.slice(1).join("");
  const [enteros, decimales] = v.split(".");
  let salida = String(enteros ?? "").slice(0, maxEnteros);
  if (decimales !== undefined) salida += "." + decimales.slice(0, maxDec);
  return salida;
}

/** Número de cuenta en mayúsculas: AHO-7890 (letras, guion y dígitos). */
export function soloCuenta(valor) {
  return String(valor ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, LIMITES.cuenta);
}

/** Texto libre con tope de caracteres (mismo límite que la columna en la base). */
export function soloTexto(valor, max) {
  return String(valor ?? "").slice(0, max);
}

/** Usuario normalizado: minúsculas, sin espacios ni símbolos raros. */
export function soloUsuario(valor) {
  return String(valor ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, LIMITES.usuario);
}

/** Contraseña: cualquier texto, sin recortar espacios, tope de seguridad. */
export function soloContrasena(valor) {
  return String(valor ?? "").slice(0, LIMITES.contrasena);
}

/** Nombre: letras (con acentos), espacios, apóstrofes y guiones. */
export function soloNombre(valor) {
  return String(valor ?? "")
    .replace(/[^\p{L}\s.'-]/gu, "")
    .slice(0, LIMITES.nombre);
}
