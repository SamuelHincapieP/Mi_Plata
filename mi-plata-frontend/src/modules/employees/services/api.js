// api.js — Cliente HTTP del backend Spring (base de datos MariaDB).
// Todas las llamadas devuelven un objeto con { ok, ... } y nunca lanzan error,
// así las pantallas muestran el mensaje igual que antes.
export const URL_API = "http://localhost:8080/api";

export async function llamar(metodo, ruta, cuerpo) {
  try {
    const respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    const texto = await respuesta.text();
    let json = null;
    try {
      json = texto ? JSON.parse(texto) : null;
    } catch {
      json = null; // texto plano: mensaje de error o valor simple
    }

    // Texto plano o valores simples (true/false, números)
    if (json === null || typeof json !== "object") {
      return respuesta.ok
        ? { ok: true, datos: json ?? texto }
        : { ok: false, error: texto || "El servidor respondió con error." };
    }

    // Listas (GET /banco/clientes, /categorias, /metas...)
    if (Array.isArray(json)) return { ok: respuesta.ok, datos: json };

    // Operaciones: el backend envía "ok" y, si todo sale bien, la lista "clientes"
    if (typeof json.ok === "boolean") return json;

    // Objetos sueltos (una meta creada, por ejemplo)
    return respuesta.ok
      ? { ok: true, datos: json, ...json }
      : { ok: false, error: json.error ?? "El servidor respondió con error.", ...json };
  } catch {
    return { ok: false, error: "No hay conexión con el backend (localhost:8080). Enciéndelo e inténtalo de nuevo." };
  }
}
