import { describe, it, expect, afterEach, vi } from "vitest";
import { llamar, URL_API } from "./api.js";
import { simularFetch } from "../../../test/ayudas.js";

afterEach(() => vi.unstubAllGlobals());

describe("api.llamar: el único punto de contacto con el backend", () => {
  it("arma la URL con URL_API, el método y el cuerpo JSON", async () => {
    const falso = simularFetch(200, { ok: true });
    await llamar("POST", "/operaciones/consignar", { numeroCuenta: "AHO-020", monto: 1000 });
    const [url, opciones] = falso.mock.calls[0];
    expect(url).toBe(`${URL_API}/operaciones/consignar`);
    expect(URL_API).toBe("http://localhost:8080/api");
    expect(opciones.method).toBe("POST");
    expect(opciones.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opciones.body)).toEqual({ numeroCuenta: "AHO-020", monto: 1000 });
  });

  it("un GET no envía cuerpo", async () => {
    const falso = simularFetch(200, []);
    await llamar("GET", "/categorias");
    expect(falso.mock.calls[0][1].body).toBe(undefined);
  });

  it("las listas llegan en 'datos'", async () => {
    simularFetch(200, [{ categoriaID: 1 }]);
    const r = await llamar("GET", "/categorias");
    expect(r.ok).toBe(true);
    expect(r.datos).toEqual([{ categoriaID: 1 }]);
  });

  it("una operación correcta devuelve el JSON del servidor", async () => {
    simularFetch(200, { ok: true, monto: 500, clientes: [] });
    const r = await llamar("POST", "/x", {});
    expect(r.ok).toBe(true);
    expect(r.monto).toBe(500);
  });

  it("un 400 con JSON conserva el mensaje del servidor", async () => {
    simularFetch(400, { ok: false, error: "Saldo insuficiente." });
    const r = await llamar("POST", "/x", {});
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Saldo insuficiente.");
  });

  it("un 400 con texto plano (bolsillos, metas) también da el mensaje", async () => {
    simularFetch(400, "Ya tienes un bolsillo llamado \"Mercado\" en esta cuenta");
    const r = await llamar("POST", "/bolsillos", {});
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Ya tienes un bolsillo");
  });

  it("un DELETE que responde true es éxito", async () => {
    simularFetch(200, "true");
    const r = await llamar("DELETE", "/bolsillos/1");
    expect(r.ok).toBe(true);
    expect(r.datos).toBe(true);
  });

  it("sin conexión devuelve un mensaje claro y no lanza error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("Failed to fetch"); }));
    const r = await llamar("GET", "/banco/clientes");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("No hay conexión con el backend");
  });
});
