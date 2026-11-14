// Ayudas compartidas por las pruebas: simulan el backend (fetch) con respuestas reales guardadas en test/fixtures.
import { vi } from "vitest";

/** Objeto parecido a la respuesta de fetch: solo lo que usa api.js (ok y text()). */
export function respuestaFalsa(status, cuerpo) {
  const texto = typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo);
  return { ok: status >= 200 && status < 300, status, text: async () => texto };
}

/** Reemplaza fetch por una función falsa que siempre responde igual. Devuelve la función para inspeccionarla. */
export function simularFetch(status, cuerpo) {
  const falso = vi.fn(async () => respuestaFalsa(status, cuerpo));
  vi.stubGlobal("fetch", falso);
  return falso;
}

/** Cuerpo JSON de la última petición enviada. */
export function cuerpoEnviado(falso, llamada = 0) {
  return JSON.parse(falso.mock.calls[llamada][1].body);
}
