// reportes.js — Arma los movimientos reales y se los envía a Python (servidor.py).
const URL_REPORTES = "http://localhost:5000/reporte";

const NOMBRE_CUENTA = {
  CuentaAhorros: "Cuenta Ahorros",
  CuentaCorriente: "Cuenta Corriente",
  TarjetaCredito: "Tarjeta Credito",
};

/** Convierte clientes -> lista plana de movimientos (quién, cuenta, tipo de cuenta, operación). */
export function aplanarMovimientos(clientes) {
  const filas = [];
  for (const cliente of clientes) {
    for (const cuenta of cliente.cuentas) {
      for (const mov of cuenta.movimientos) {
        filas.push({
          fecha: mov.fechaHora.toISOString(),
          tipo: mov.tipo,
          monto: mov.valor,
          usuario: cliente.usuario,
          nombre: cliente.nombreCompleto,
          cuenta: cuenta.numeroCuenta,
          tipoCuenta: cuenta.tipo,
          nombreCuenta: NOMBRE_CUENTA[cuenta.tipo] || cuenta.tipo,
        });
      }
    }
  }
  return filas;
}

const URL_SPRING = "http://localhost:8080/api/reportes";

async function leerJson(respuesta) {
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || "Error generando el reporte.");
  return datos;
}

/**
 * Pide el reporte: primero al backend Spring (datos de la base de datos -> Python).
 * Si Spring no responde, usa de respaldo los datos del navegador enviados directo a Python.
 */
export async function pedirReporte({ esAdmin, clientes, cliente }) {
  try {
    const url = esAdmin
      ? `${URL_SPRING}/admin`
      : `${URL_SPRING}/usuario?usuario=${encodeURIComponent(cliente.usuario)}`;
    return { ...(await leerJson(await fetch(url))), fuente: "Base de datos" };
  } catch {
    const lista = esAdmin ? clientes : [cliente];
    const cuerpo = {
      rol: esAdmin ? "admin" : "cliente",
      nombre: cliente.nombreCompleto,
      totalUsuarios: clientes.filter((c) => !c.esAdmin).length,
      movimientos: aplanarMovimientos(lista),
    };
    const respuesta = await fetch(URL_REPORTES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    return { ...(await leerJson(respuesta)), fuente: "Datos del navegador (respaldo)" };
  }
}
