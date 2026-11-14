import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { iniciarSesion, usuarioSesion, rolSesion, cerrarSesion } from "./auth.js";
import { simularFetch, cuerpoEnviado } from "../../../test/ayudas.js";
import loginOk from "../../../test/fixtures/login_ok.json";
import loginFallido from "../../../test/fixtures/login_fallido.json";

// sessionStorage falso (en las pruebas no hay navegador)
function memoria() {
  const datos = {};
  return {
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => { datos[k] = String(v); },
    removeItem: (k) => { delete datos[k]; },
  };
}

beforeEach(() => vi.stubGlobal("sessionStorage", memoria()));
afterEach(() => vi.unstubAllGlobals());

describe("auth: el login se verifica en el backend", () => {
  it("login correcto: guarda la sesión y devuelve el cliente", async () => {
    const falso = simularFetch(loginOk.status, loginOk.body);
    const clientes = [];
    const r = await iniciarSesion(clientes, "samuel", "1234");
    expect(falso.mock.calls[0][0]).toBe("http://localhost:8080/api/auth/login");
    expect(cuerpoEnviado(falso)).toEqual({ usuario: "samuel", contrasena: "1234" });
    expect(r.ok).toBe(true);
    expect(r.cliente.usuario).toBe("samuel");
    expect(usuarioSesion()).toBe("samuel");
    expect(rolSesion()).toBe("cliente");
  });

  it("clave incorrecta: no hay sesión y se informa el intento", async () => {
    simularFetch(loginFallido.status, loginFallido.body);
    const r = await iniciarSesion([], "samuel", "mala");
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Contrasena incorrecta.");
    expect(r.intentos).toBe(1);
    expect(usuarioSesion()).toBe(null);
  });

  it("sin usuario o sin clave ni siquiera llama al servidor", async () => {
    const falso = simularFetch(200, {});
    const r = await iniciarSesion([], "", "");
    expect(r.ok).toBe(false);
    expect(falso).toHaveBeenCalledTimes(0);
  });

  it("cerrarSesion borra la sesión", async () => {
    simularFetch(loginOk.status, loginOk.body);
    await iniciarSesion([], "samuel", "1234");
    cerrarSesion();
    expect(usuarioSesion()).toBe(null);
    expect(rolSesion()).toBe("cliente");
  });
});
