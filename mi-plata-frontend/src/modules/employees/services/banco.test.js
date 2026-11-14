import { describe, it, expect, afterEach, vi } from "vitest";
import {
  validarDatosCliente, validarProductos, productosElegidos, progresoMeta, faltaMeta,
  obtenerDisponible, saldoCliente, resumenCompra, aplicarClientes,
  consignar, retirar, transferir, comprar, pagarTarjeta,
  crearClienteAdmin, crearClienteRegistro, eliminarCliente, cambiarEstadoCliente,
  obtenerCategorias, obtenerTransferencias, obtenerComprasTC,
  obtenerBolsillos, crearBolsillo, eliminarBolsillo, depositarBolsillo, retirarBolsillo,
  obtenerMetas, crearMeta, eliminarMeta, aportarMeta, retirarMeta,
} from "./banco.js";
import CuentaAhorros from "../lib/CuentaAhorros.js";
import CuentaCorriente from "../lib/CuentaCorriente.js";
import TarjetaCredito from "../lib/TarjetaCredito.js";
import { simularFetch, cuerpoEnviado } from "../../../test/ayudas.js";
import consignarOk from "../../../test/fixtures/consignar_ok.json";
import consignarError from "../../../test/fixtures/consignar_error.json";
import transferirOk from "../../../test/fixtures/transferir_ok.json";
import comprarOk from "../../../test/fixtures/comprar_ok.json";
import categorias from "../../../test/fixtures/categorias.json";
import transferencias from "../../../test/fixtures/transferencias.json";
import compras from "../../../test/fixtures/compras.json";
import bolsillosLista from "../../../test/fixtures/bolsillos_lista.json";
import bolsilloDepositar from "../../../test/fixtures/bolsillo_depositar_ok.json";
import metasLista from "../../../test/fixtures/metas_lista.json";
import metaAportar from "../../../test/fixtures/meta_aportar_ok.json";
import crearClienteError from "../../../test/fixtures/crear_cliente_error.json";
import eliminarError from "../../../test/fixtures/eliminar_error.json";

afterEach(() => vi.unstubAllGlobals());

const URL = "http://localhost:8080/api";
const cuenta = { numeroCuenta: "AHO-020" };
const datosValidos = { cedula: "1234567", nombre: "Ana Ruiz", celular: "3001112222", usuario: "ana", contrasena: "ab12" };

describe("banco: validaciones del formulario (el backend las repite)", () => {
  it("datos correctos no devuelven error", () => {
    expect(validarDatosCliente(datosValidos, [])).toBe("");
  });
  it("campos vacíos", () => {
    expect(validarDatosCliente({ ...datosValidos, nombre: "" }, [])).toContain("obligatorios");
  });
  it("documento, celular, usuario y clave", () => {
    expect(validarDatosCliente({ ...datosValidos, cedula: "123" }, [])).toContain("entre 6 y 10");
    expect(validarDatosCliente({ ...datosValidos, celular: "123" }, [])).toContain("10 dígitos");
    expect(validarDatosCliente({ ...datosValidos, usuario: "a b" }, [])).toContain("3 a 20");
    expect(validarDatosCliente({ ...datosValidos, contrasena: "12" }, [])).toContain("al menos 4");
  });
  it("usuario o documento repetidos", () => {
    const existentes = [{ id: 9, usuario: "ana", identificacion: "999999999" }];
    expect(validarDatosCliente(datosValidos, existentes)).toContain("ya existe");
    expect(validarDatosCliente({ ...datosValidos, usuario: "otra", cedula: "999999999" }, existentes)).toContain("documento");
  });
  it("al editar se ignora al propio cliente", () => {
    const existentes = [{ id: 9, usuario: "ana", identificacion: "1234567" }];
    expect(validarDatosCliente(datosValidos, existentes, 9)).toBe("");
  });
});

describe("banco: el admin elige las cuentas del cliente (1, 2 o las 3)", () => {
  it("productosElegidos lee las casillas marcadas", () => {
    expect(productosElegidos({ quiereAhorros: true })).toEqual(["ahorros"]);
    expect(productosElegidos({ quiereCorriente: true, quiereTC: true })).toEqual(["corriente", "tc"]);
    expect(productosElegidos({ quiereAhorros: true, quiereCorriente: true, quiereTC: true })).toEqual(["ahorros", "corriente", "tc"]);
  });
  it("un cliente sin ningún producto se rechaza", () => {
    expect(validarProductos({ rol: "cliente" })).toContain("al menos un producto");
    expect(validarProductos({ rol: "cliente", quiereTC: true })).toBe("");
  });
  it("un administrador no necesita productos", () => {
    expect(validarProductos({ rol: "admin" })).toBe("");
  });
  it.each([
    [{ quiereAhorros: true }, ["ahorros"]],
    [{ quiereAhorros: true, quiereTC: true }, ["ahorros", "tc"]],
    [{ quiereAhorros: true, quiereCorriente: true, quiereTC: true }, ["ahorros", "corriente", "tc"]],
  ])("crearClienteAdmin envía %j como %j", async (flags, esperado) => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await crearClienteAdmin([], { ...datosValidos, rol: "cliente", ...flags });
    expect(falso.mock.calls[0][0]).toBe(`${URL}/clientes`);
    const cuerpo = cuerpoEnviado(falso);
    expect(cuerpo.productos).toEqual(esperado);
    expect(cuerpo.rol).toBe("cliente");
    expect(cuerpo.quiereAhorros).toBe(undefined); // las casillas no viajan al servidor
  });
  it("crearClienteAdmin con rol admin no manda productos", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await crearClienteAdmin([], { ...datosValidos, rol: "admin", quiereAhorros: true });
    expect(cuerpoEnviado(falso).productos).toEqual([]);
    expect(cuerpoEnviado(falso).rol).toBe("admin");
  });
  it("crearClienteRegistro envía los productos elegidos", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await crearClienteRegistro([], { ...datosValidos, quiereCorriente: true });
    expect(cuerpoEnviado(falso).productos).toEqual(["corriente"]);
  });
  it("el servidor rechaza un cliente sin productos y el mensaje llega a la pantalla", async () => {
    simularFetch(crearClienteError.status, crearClienteError.body);
    const r = await crearClienteAdmin([], { ...datosValidos, rol: "cliente" });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("al menos un producto");
  });
});

describe("banco: operaciones (la lista de clientes se actualiza con la respuesta real del backend)", () => {
  it("consignar llama al endpoint y reemplaza la lista de clientes", async () => {
    const falso = simularFetch(consignarOk.status, consignarOk.body);
    const clientes = [];
    const r = await consignar(clientes, cuenta, 500000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/consignar`);
    expect(cuerpoEnviado(falso)).toEqual({ numeroCuenta: "AHO-020", monto: 500000 });
    expect(r.ok).toBe(true);
    expect(clientes.length).toBe(consignarOk.body.clientes.length);
    const ahorros = clientes.find((c) => c.usuario === "samuel").cuentas[0];
    expect(ahorros.saldo).toBe(500000);
  });

  it("un error del servidor no modifica la lista y muestra su mensaje", async () => {
    simularFetch(consignarError.status, consignarError.body);
    const clientes = ["intacto"];
    const r = await consignar(clientes, cuenta, 0);
    expect(r.ok).toBe(false);
    expect(r.error).toBe(consignarError.body.error);
    expect(clientes).toEqual(["intacto"]);
  });

  it("retirar y pagarTarjeta usan sus endpoints", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await retirar([], cuenta, 1000);
    await pagarTarjeta([], { numeroCuenta: "TC-022" }, { numeroCuenta: "AHO-020" }, 2000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/retirar`);
    expect(falso.mock.calls[1][0]).toBe(`${URL}/operaciones/pagar`);
    expect(cuerpoEnviado(falso, 1)).toEqual({
      numeroCuenta: "TC-022",
      cuentaOrigen: "AHO-020",
      monto: 2000,
    });
  });

  it("transferir envía el mensaje", async () => {
    const falso = simularFetch(transferirOk.status, transferirOk.body);
    await transferir([], cuenta, "AHO-030", 100000, "Pago arriendo");
    expect(cuerpoEnviado(falso)).toEqual({ origen: "AHO-020", destino: "AHO-030", monto: 100000, mensaje: "Pago arriendo" });
  });

  it("comprar envía comercio y categoría, y la cuota coincide con la del backend", async () => {
    const falso = simularFetch(comprarOk.status, comprarOk.body);
    const r = await comprar([], { numeroCuenta: "TC-022" }, 300000, 3, "Almacén Éxito - Zapatos", 6);
    expect(cuerpoEnviado(falso)).toEqual({ numeroCuenta: "TC-022", monto: 300000, cuotas: 3, comercio: "Almacén Éxito - Zapatos", categoriaID: 6 });
    // La vista previa (JS) y el cobro real (Java) deben dar el mismo número
    const tc = new TarjetaCredito("TC-022", 3000000);
    const previa = resumenCompra(tc, 300000, 3);
    expect(previa.cuota).toBeCloseTo(r.cuotaMensual, 1);
    expect(previa.cuotaManejo).toBe(8500);
    // El backend redondea la deuda a dos decimales antes de responder.
    expect(previa.totalDeudaInicial).toBeCloseTo(r.deuda, 1);
  });

  it("eliminar un cliente con movimientos: el backend dice que no", async () => {
    simularFetch(eliminarError.status, eliminarError.body);
    const r = await eliminarCliente([], 2);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("movimientos relacionados");
  });

  it("cambiarEstadoCliente usa PATCH", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await cambiarEstadoCliente([], 2, true);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/clientes/2/estado`);
    expect(falso.mock.calls[0][1].method).toBe("PATCH");
    expect(cuerpoEnviado(falso)).toEqual({ bloqueado: true });
  });

  it("aplicarClientes reemplaza el contenido de la lista", () => {
    const lista = [1, 2, 3];
    aplicarClientes(lista, []);
    expect(lista).toHaveLength(0);
  });
});

describe("banco: consultas nuevas", () => {
  it("categorías para el desplegable", async () => {
    simularFetch(categorias.status, categorias.body);
    const r = await obtenerCategorias();
    expect(r.ok).toBe(true);
    expect(r.lista.length).toBeGreaterThan(0);
    expect(r.lista[0]).toHaveProperty("categoriaID");
    expect(r.lista[0]).toHaveProperty("nombreCategoria");
  });
  it("resumen de transferencias", async () => {
    const falso = simularFetch(transferencias.status, transferencias.body);
    const r = await obtenerTransferencias(2);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/transferencias/usuario/2`);
    const t = r.lista[0];
    expect(t.mensaje).toBe("Pago arriendo");
    expect(t.sentido).toBe("ENVIADA");
    expect(t.nombredestino).toBe("Maria Garcia");
  });
  it("compras de la tarjeta", async () => {
    const falso = simularFetch(compras.status, compras.body);
    const r = await obtenerComprasTC("TC-022");
    expect(falso.mock.calls[0][0]).toBe(`${URL}/compras/TC-022`);
    expect(r.ok).toBe(true);
    expect(Array.isArray(r.lista)).toBe(true);
  });
  it("un error de consulta devuelve ok=false con el mensaje", async () => {
    simularFetch(400, "La cuenta ZZZ no está registrada");
    const r = await obtenerComprasTC("ZZZ");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("no está registrada");
  });
});

describe("banco: bolsillos", () => {
  it("lista los bolsillos de una cuenta", async () => {
    const falso = simularFetch(bolsillosLista.status, bolsillosLista.body);
    const r = await obtenerBolsillos("AHO-020");
    expect(falso.mock.calls[0][0]).toBe(`${URL}/bolsillos/cuenta/AHO-020`);
    expect(r.lista[0].nombreBolsillo).toBe("Mercado del mes");
    expect(r.lista[0].saldo).toBe(30000);
  });
  it("crear y eliminar", async () => {
    const falso = simularFetch(200, {});
    await crearBolsillo("AHO-020", "Viaje");
    await eliminarBolsillo(3);
    expect(cuerpoEnviado(falso)).toEqual({ numeroCuenta: "AHO-020", nombreBolsillo: "Viaje" });
    expect(falso.mock.calls[1][0]).toBe(`${URL}/bolsillos/3`);
    expect(falso.mock.calls[1][1].method).toBe("DELETE");
  });
  it("guardar dinero en un bolsillo actualiza las cuentas", async () => {
    const falso = simularFetch(bolsilloDepositar.status, bolsilloDepositar.body);
    const clientes = [];
    const r = await depositarBolsillo(clientes, cuenta, 1, 50000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/bolsillo/depositar`);
    expect(cuerpoEnviado(falso)).toEqual({ numeroCuenta: "AHO-020", bolsilloID: 1, monto: 50000 });
    expect(r.ok).toBe(true);
    expect(clientes.length).toBeGreaterThan(0);
  });
  it("sacar dinero usa su endpoint", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await retirarBolsillo([], cuenta, 1, 20000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/bolsillo/retirar`);
  });
});

describe("banco: metas (el progreso cuenta lo que el cliente aportó)", () => {
  it("progreso y lo que falta", () => {
    const meta = { montoObjetivo: 2000000, montoAhorrado: 500000 };
    expect(progresoMeta(meta)).toBe(25);
    expect(faltaMeta(meta)).toBe(1500000);
  });
  it("el progreso nunca pasa de 100 y soporta metas sin objetivo", () => {
    expect(progresoMeta({ montoObjetivo: 100, montoAhorrado: 500 })).toBe(100);
    expect(progresoMeta({ montoObjetivo: 0, montoAhorrado: 5 })).toBe(0);
    expect(faltaMeta({ montoObjetivo: 100, montoAhorrado: 500 })).toBe(0);
    expect(progresoMeta(undefined)).toBe(0);
  });
  it("la lista del backend trae montoAhorrado", async () => {
    simularFetch(metasLista.status, metasLista.body);
    const r = await obtenerMetas("AHO-020");
    expect(r.lista[0].montoAhorrado).toBe(60000);
    expect(progresoMeta(r.lista[0])).toBe(3); // 60.000 de 2.000.000
  });
  it("crear y eliminar", async () => {
    const falso = simularFetch(200, {});
    await crearMeta({ numeroCuenta: "AHO-020", nombreMeta: "Viaje", montoObjetivo: 1000, fechaObjetivo: "2027-01-01" });
    await eliminarMeta(7);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/metas`);
    expect(falso.mock.calls[1][0]).toBe(`${URL}/metas/7`);
  });
  it("el cliente decide cuánto aporta", async () => {
    const falso = simularFetch(metaAportar.status, metaAportar.body);
    const r = await aportarMeta([], cuenta, 1, 100000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/meta/aportar`);
    expect(cuerpoEnviado(falso)).toEqual({ numeroCuenta: "AHO-020", metaID: 1, monto: 100000 });
    expect(r.ok).toBe(true);
  });
  it("retirar de la meta usa su endpoint", async () => {
    const falso = simularFetch(200, { ok: true, clientes: [] });
    await retirarMeta([], cuenta, 1, 40000);
    expect(falso.mock.calls[0][0]).toBe(`${URL}/operaciones/meta/retirar`);
  });
});

describe("banco: dinero disponible según el tipo de cuenta", () => {
  it("ahorros: el saldo; corriente: saldo + límite de sobregiro; tarjeta: el cupo libre", () => {
    expect(obtenerDisponible(new CuentaAhorros("AHO-1", 500000))).toBe(500000);
    expect(obtenerDisponible(new CuentaCorriente("CTE-1", 1000000))).toBe(2000000);
    expect(obtenerDisponible(new TarjetaCredito("TC-1", 3000000))).toBe(3000000);
  });
  it("el saldo del cliente no suma la deuda de la tarjeta", () => {
    const cliente = { cuentas: [new CuentaAhorros("A", 100), new CuentaCorriente("C", 50), new TarjetaCredito("T", 3000000)] };
    expect(saldoCliente(cliente)).toBe(150);
  });
});
