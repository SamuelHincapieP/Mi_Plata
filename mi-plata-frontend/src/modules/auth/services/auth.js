// auth.js — Sesión con roles. La contraseña se verifica en el backend (base de datos),
// y la sesión del navegador (sessionStorage) solo guarda quién inició sesión.
import { llamar } from "../../employees/services/api.js";
import { aplicarClientes } from "../../employees/services/banco.js";

const CLAVE_USUARIO = "sesion_usuario";
const CLAVE_NOMBRE = "sesion_nombre";
const CLAVE_ROL = "sesion_rol";

/**
 * Intenta iniciar sesión contra la base de datos.
 * @returns {Promise<{ok:boolean, cliente?:object, error?:string, intentos?:number, bloqueado?:boolean}>}
 */
export async function iniciarSesion(clientes, usuario, contrasena) {
  if (!usuario || !contrasena) {
    return { ok: false, error: "Ingresa usuario y contraseña." };
  }

  const respuesta = await llamar("POST", "/auth/login", { usuario, contrasena });
  if (respuesta.clientes) aplicarClientes(clientes, respuesta.clientes);

  if (!respuesta.ok) {
    return {
      ok: false,
      error: respuesta.error,
      intentos: respuesta.intentos,
      bloqueado: respuesta.bloqueado,
    };
  }

  const cliente = clientes.find((c) => c.usuario === usuario) || null;
  if (!cliente) return { ok: false, error: "Usuario no encontrado." };

  sessionStorage.setItem(CLAVE_USUARIO, cliente.usuario);
  sessionStorage.setItem(CLAVE_NOMBRE, cliente.nombreCompleto);
  sessionStorage.setItem(CLAVE_ROL, cliente.rol);
  return { ok: true, cliente };
}

/** Usuario guardado en la sesión activa (null si no hay sesión). */
export function usuarioSesion() {
  return sessionStorage.getItem(CLAVE_USUARIO);
}

/** Rol de la sesión activa. */
export function rolSesion() {
  return sessionStorage.getItem(CLAVE_ROL) || "cliente";
}

/** Cierra la sesión. */
export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_USUARIO);
  sessionStorage.removeItem(CLAVE_NOMBRE);
  sessionStorage.removeItem(CLAVE_ROL);
}
