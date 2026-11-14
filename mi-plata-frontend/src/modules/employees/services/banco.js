// banco.js — Pantallas y reglas de presentación del banco.
// Las operaciones (consignar, retirar, transferir, comprar, pagar, altas, ediciones...)
// se envían al backend, que las valida, las guarda en MariaDB y responde con la lista
// de clientes actualizada. Aquí solo se llama a la API y se refresca la lista en memoria.
import { deserializarClientes } from "./storage.js";
import { llamar } from "./api.js";

// ── Lista de clientes ────────────────────────────────────

/** Reemplaza el contenido de la lista en memoria con la copia que devolvió la base de datos. */
export function aplicarClientes(clientes, snapshot) {
  clientes.splice(0, clientes.length, ...deserializarClientes(snapshot));
  return clientes;
}

/** Llama a la API y, si sale bien, actualiza la lista en memoria. */
async function operar(clientes, metodo, ruta, cuerpo) {
  const respuesta = await llamar(metodo, ruta, cuerpo);
  if (respuesta.clientes) aplicarClientes(clientes, respuesta.clientes);
  return respuesta;
}

/** Carga los clientes desde la base de datos (GET /api/banco/clientes). */
export async function cargarClientes() {
  const respuesta = await llamar("GET", "/banco/clientes");
  if (!respuesta.ok) {
    throw new Error(respuesta.error || "No se pudo leer la base de datos. ¿Está encendido el backend?");
  }
  return deserializarClientes(respuesta.datos);
}

// ── Utilidades de cuentas ────────────────────────────────

/** "CuentaAhorros" | "CuentaCorriente" | "TarjetaCredito" */
export function tipoCuenta(cuenta) {
  return cuenta.tipo; // getter propio: constructor.name se minifica
}

export function esTarjeta(cuenta) {
  return tipoCuenta(cuenta) === "TarjetaCredito";
}

/** Nombre amable del producto. */
export function nombreTipo(cuenta) {
  const tipo = tipoCuenta(cuenta);
  if (tipo === "CuentaAhorros") return "Cuenta Ahorros";
  if (tipo === "CuentaCorriente") return "Cuenta Corriente";
  return "Tarjeta de Crédito";
}

/**
 * Dinero realmente disponible para retirar/transferir:
 * ahorros → saldo; corriente → saldo + sobregiro; TC → cupo libre.
 */
export function obtenerDisponible(cuenta) {
  if (esTarjeta(cuenta)) return cuenta.cupoDisponible;
  if (tipoCuenta(cuenta) === "CuentaCorriente") {
    return cuenta.saldo + cuenta.calcularLimiteSobregiro();
  }
  return cuenta.saldo;
}

/** Busca una cuenta por número en TODOS los clientes (transferencias). */
export function buscarCuentaEnTodos(clientes, numero) {
  for (const cliente of clientes) {
    for (const cuenta of cliente.cuentas) {
      if (cuenta.numeroCuenta === numero) return cuenta;
    }
  }
  return null;
}

/** Cuenta origen por número entre las cuentas del cliente. */
export function cuentaPropia(cliente, numero) {
  return cliente.cuentas.find((c) => c.numeroCuenta === numero) || null;
}

// ── Operaciones bancarias (backend) ──────────────────────

export function consignar(clientes, cuenta, monto) {
  return operar(clientes, "POST", "/operaciones/consignar", { numeroCuenta: cuenta.numeroCuenta, monto });
}

export function retirar(clientes, cuenta, monto) {
  return operar(clientes, "POST", "/operaciones/retirar", { numeroCuenta: cuenta.numeroCuenta, monto });
}

export function transferir(clientes, origen, numeroDestino, monto, mensaje = "") {
  return operar(clientes, "POST", "/operaciones/transferir", {
    origen: origen.numeroCuenta,
    destino: numeroDestino,
    monto,
    mensaje,
  });
}

/** Compra a cuotas con TC. El backend devuelve también la cuota mensual. */
export function comprar(clientes, tc, monto, cuotas, comercio, categoriaID) {
  return operar(clientes, "POST", "/operaciones/comprar", {
    numeroCuenta: tc.numeroCuenta,
    monto,
    cuotas,
    comercio,
    categoriaID,
  });
}

// ── Consultas nuevas (no cambian saldos: solo leen) ──

/** Catálogo de categorías para el menú desplegable de compras. */
export async function obtenerCategorias() {
  const r = await llamar("GET", "/categorias");
  return r.ok ? { ok: true, lista: r.datos } : { ok: false, error: r.error };
}

/** Resumen de transferencias enviadas y recibidas de un usuario. */
export async function obtenerTransferencias(usuarioID) {
  const r = await llamar("GET", `/transferencias/usuario/${usuarioID}`);
  return r.ok ? { ok: true, lista: r.datos } : { ok: false, error: r.error };
}

/** Compras hechas con una tarjeta de crédito. */
export async function obtenerComprasTC(numeroCuenta) {
  const r = await llamar("GET", `/compras/${numeroCuenta}`);
  return r.ok ? { ok: true, lista: r.datos } : { ok: false, error: r.error };
}

// ── Metas de ahorro ──

export async function obtenerMetas(numeroCuenta) {
  const r = await llamar("GET", `/metas/cuenta/${numeroCuenta}`);
  return r.ok ? { ok: true, lista: r.datos } : { ok: false, error: r.error };
}

export function crearMeta(datos) {
  return llamar("POST", "/metas", datos);
}

export function eliminarMeta(metaID) {
  return llamar("DELETE", `/metas/${metaID}`);
}

/** Cuánto de la meta ya está ahorrado (0 a 100). Lo aportado por el cliente, no el saldo de la cuenta. */
export function progresoMeta(meta) {
  const objetivo = Number(meta?.montoObjetivo) || 0;
  if (objetivo <= 0) return 0;
  return Math.min(100, Math.round(((Number(meta.montoAhorrado) || 0) / objetivo) * 100));
}

/** Lo que falta para completar la meta. */
export function faltaMeta(meta) {
  return Math.max(0, (Number(meta?.montoObjetivo) || 0) - (Number(meta?.montoAhorrado) || 0));
}

/** El cliente decide cuánto aporta: el dinero sale de su cuenta de ahorros. */
export function aportarMeta(clientes, cuenta, metaID, monto) {
  return operar(clientes, "POST", "/operaciones/meta/aportar", { numeroCuenta: cuenta.numeroCuenta, metaID, monto });
}

/** Devuelve dinero de la meta a la cuenta de ahorros. */
export function retirarMeta(clientes, cuenta, metaID, monto) {
  return operar(clientes, "POST", "/operaciones/meta/retirar", { numeroCuenta: cuenta.numeroCuenta, metaID, monto });
}

// ── Bolsillos (apartados de dinero dentro de una cuenta, como en Nequi) ──

export async function obtenerBolsillos(numeroCuenta) {
  const r = await llamar("GET", `/bolsillos/cuenta/${numeroCuenta}`);
  return r.ok ? { ok: true, lista: r.datos } : { ok: false, error: r.error };
}

export function crearBolsillo(numeroCuenta, nombreBolsillo) {
  return llamar("POST", "/bolsillos", { numeroCuenta, nombreBolsillo });
}

export function eliminarBolsillo(bolsilloID) {
  return llamar("DELETE", `/bolsillos/${bolsilloID}`);
}

/** Cuenta → bolsillo. */
export function depositarBolsillo(clientes, cuenta, bolsilloID, monto) {
  return operar(clientes, "POST", "/operaciones/bolsillo/depositar", { numeroCuenta: cuenta.numeroCuenta, bolsilloID, monto });
}

/** Bolsillo → cuenta. */
export function retirarBolsillo(clientes, cuenta, bolsilloID, monto) {
  return operar(clientes, "POST", "/operaciones/bolsillo/retirar", { numeroCuenta: cuenta.numeroCuenta, bolsilloID, monto });
}

/** Paga la TC desde una cuenta de ahorros o corriente del mismo cliente. */
export function pagarTarjeta(clientes, tc, cuentaOrigen, monto) {
  return operar(clientes, "POST", "/operaciones/pagar", {
    numeroCuenta: tc.numeroCuenta,
    cuentaOrigen: cuentaOrigen.numeroCuenta,
    monto,
  });
}

// ── Resúmenes de compra con TC (vista previa, se calcula aquí igual que el backend) ──

/** Mismo cálculo que la compra en el servidor. */
export function resumenCompra(tc, monto, cuotas) {
  const cuota = tc.calcularCuotaMensual(monto, cuotas);
  const tasa = tc.calcularTasa(cuotas);
  const cuotaManejo = tc.calcularCuotaManejo(cuotas);
  const totalCuotas = cuota * cuotas;
  const intereses = Math.max(totalCuotas - monto, 0);
  return {
    cuota,
    tasa,
    cuotaManejo,
    totalDeudaInicial: monto + intereses + cuotaManejo,
    intereses,
    totalProyectado: totalCuotas + cuotaManejo,
  };
}

// ── Resúmenes de clientes (dashboard y admin) ────────────

/** Suma de saldos (la deuda de la TC no se suma). */
export function saldoCliente(cliente) {
  return cliente.cuentas.reduce((total, cuenta) => {
    if (esTarjeta(cuenta)) return total;
    return total + cuenta.saldo;
  }, 0);
}

/** Saldo del producto para tarjetas de lista (admin usa la deuda). */
export function saldoCuenta(cuenta) {
  return esTarjeta(cuenta) ? cuenta.deuda : cuenta.saldo;
}

export function totalDinero(clientes) {
  return clientes.reduce((total, c) => total + saldoCliente(c), 0);
}

export function contarMovimientos(cliente) {
  return cliente.cuentas.reduce((total, c) => total + c.movimientos.length, 0);
}

/** Últimos movimientos de todas las cuentas, del más reciente al más antiguo. */
export function movimientosRecientes(cliente, limite = 5) {
  const todos = [];
  for (const cuenta of cliente.cuentas) {
    for (const mov of cuenta.obtenerMovimientos()) {
      todos.push({ ...mov, cuenta });
    }
  }
  return todos
    .sort((a, b) => b.fechaHora - a.fechaHora)
    .slice(0, limite);
}

// ── Validaciones (el backend vuelve a validar lo mismo) ──

/** Valida los datos de un cliente antes de enviarlos. Devuelve "" si todo está bien. */
export function validarDatosCliente(datos, clientes, idIgnorado = 0) {
  if (!datos.cedula || !datos.nombre || !datos.celular || !datos.usuario || !datos.contrasena) {
    return "Todos los campos son obligatorios.";
  }
  if (!/^[0-9]{6,10}$/.test(datos.cedula)) {
    return "El documento debe tener entre 6 y 10 números.";
  }
  if (!/^[0-9]{10}$/.test(datos.celular)) {
    return "El celular debe tener exactamente 10 dígitos.";
  }
  if (!/^[a-z0-9._-]{3,20}$/.test(datos.usuario)) {
    return "El usuario debe tener de 3 a 20 caracteres, sin espacios.";
  }
  if (datos.contrasena.length < 4) {
    return "La contraseña debe tener al menos 4 caracteres.";
  }
  if (clientes.some((c) => c.id !== idIgnorado && c.usuario === datos.usuario)) {
    return `El usuario "${datos.usuario}" ya existe.`;
  }
  if (clientes.some((c) => c.id !== idIgnorado && c.identificacion === datos.cedula)) {
    return "Ya existe un cliente con ese documento.";
  }
  return "";
}

/** Validación extra del formulario de registro. */
export function validarRegistro(datos, clientes) {
  const base = validarDatosCliente(datos, clientes, 0);
  if (base) return base;
  if (datos.confirmar !== undefined) {
    if (datos.contrasena !== datos.confirmar) return "Las contraseñas no coinciden.";
  }
  if (!datos.quiereAhorros && !datos.quiereCorriente && !datos.quiereTC) {
    return "Debes seleccionar al menos un producto bancario.";
  }
  return "";
}

// ── Altas y administración (backend) ─────────────────────

/** Lista de productos marcados en un formulario: ["ahorros", "corriente", "tc"] (1, 2 o los 3). */
export function productosElegidos(datos) {
  const productos = [];
  if (datos.quiereAhorros) productos.push("ahorros");
  if (datos.quiereCorriente) productos.push("corriente");
  if (datos.quiereTC) productos.push("tc");
  return productos;
}

/** Un cliente necesita al menos un producto; un administrador no tiene productos. */
export function validarProductos(datos) {
  if (datos.rol === "admin") return "";
  return productosElegidos(datos).length === 0
    ? "Selecciona al menos un producto: ahorros, corriente o tarjeta de crédito."
    : "";
}

function cuerpoCliente(datos, rol, productos) {
  const { cedula, nombre, celular, usuario, contrasena } = datos;
  return { cedula, nombre, celular, usuario, contrasena, rol, productos };
}

/** Registro público: el cliente elige sus productos. */
export function crearClienteRegistro(clientes, datos) {
  return operar(clientes, "POST", "/clientes", cuerpoCliente(datos, "cliente", productosElegidos(datos)));
}

/** Alta desde el panel admin: el admin elige qué cuentas tendrá el cliente (1, 2 o las 3). */
export function crearClienteAdmin(clientes, datos) {
  const esAdmin = datos.rol === "admin";
  return operar(clientes, "POST", "/clientes", cuerpoCliente(datos, esAdmin ? "admin" : "cliente", esAdmin ? [] : productosElegidos(datos)));
}

export function guardarEdicionCliente(clientes, id, datos) {
  return operar(clientes, "PUT", `/clientes/${id}`, datos);
}

export function cambiarEstadoCliente(clientes, id, bloquear) {
  return operar(clientes, "PATCH", `/clientes/${id}/estado`, { bloqueado: bloquear });
}

/** Pone en cero saldos y deudas. */
export function resetearSaldosCliente(clientes, id) {
  return operar(clientes, "POST", `/clientes/${id}/reset-saldos`);
}

export function eliminarCliente(clientes, id) {
  return operar(clientes, "DELETE", `/clientes/${id}`);
}

/** Cambio de contraseña desde el perfil: el servidor verifica la contraseña actual. */
export function cambiarContrasenaCliente(clientes, id, antigua, nueva) {
  return operar(clientes, "POST", `/clientes/${id}/cambiar-contrasena`, { antigua, nueva });
}
