import { vi } from "vitest";
import { act, render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { AuthContext } from "../../auth/states/AuthContext.js";
import { BankContext } from "../../employees/states/BankContext.js";
import CuentaAhorros from "../../employees/lib/CuentaAhorros.js";
import * as banco from "../../employees/services/banco.js";
import Bolsillos from "./Bolsillos.jsx";

// Se simula SOLO el acceso al backend (las funciones que hacen fetch). Todo lo demás es el código real.
vi.mock("../../employees/services/banco.js", async (importOriginal) => ({
  ...(await importOriginal()),
  obtenerBolsillos: vi.fn(),
  crearBolsillo: vi.fn(),
  eliminarBolsillo: vi.fn(),
  depositarBolsillo: vi.fn(),
  retirarBolsillo: vi.fn(),
}));

const bolsilloMercado = { bolsilloID: 1, nombreBolsillo: "Mercado", saldo: 200000 };

describe("Bolsillos (mover plata propia: no es una transacción)", () => {
  let recargar;

  beforeEach(async () => {
    vi.clearAllMocks();
    recargar = vi.fn();
    banco.obtenerBolsillos.mockResolvedValue({ ok: true, lista: [bolsilloMercado] });
    banco.depositarBolsillo.mockResolvedValue({ ok: true });
    banco.retirarBolsillo.mockResolvedValue({ ok: true });

    const cliente = { cuentas: [new CuentaAhorros("AHO-020", 1620000)] };
    // act espera a que termine la carga inicial (la lista que llega del backend) antes de seguir
    await act(async () => {
      render(
        <AuthContext.Provider value={{ cliente }}>
          <BankContext.Provider value={{ clientes: [cliente], recargar }}>
            <Bolsillos />
          </BankContext.Provider>
        </AuthContext.Provider>
      );
    });
  });

  test("renders los bolsillos de la cuenta con su saldo", async () => {
    expect(await screen.findByText("Mercado")).toBeInTheDocument();
    // el saldo aparece en la fila del bolsillo y también en "Guardado en total"
    expect(within(screen.getByRole("listitem")).getByText(/\$\s*200\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Guardado en total/)).toHaveTextContent(/\$\s*200\.000/);
    expect(banco.obtenerBolsillos).toHaveBeenCalledWith("AHO-020");
  });

  test("avisa que mover plata a un bolsillo no es una transacción", async () => {
    await screen.findByText("Mercado");

    expect(screen.getByText(/no es una transacción/i)).toBeInTheDocument();
  });

  test("guardar plata llama a depositarBolsillo una vez y confirma", async () => {
    await screen.findByText("Mercado");

    fireEvent.change(screen.getByLabelText("Monto para Mercado"), { target: { value: "50000" } });
    fireEvent.click(screen.getByText("Guardar"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Guardaste \$\s*50\.000 en "Mercado"/);
    expect(banco.depositarBolsillo).toHaveBeenCalledTimes(1);
    expect(banco.depositarBolsillo.mock.calls[0].slice(2)).toEqual([1, 50000]);
    expect(recargar).toHaveBeenCalledTimes(1); // se refresca el saldo de la cuenta
  });

  test("sacar plata llama a retirarBolsillo y confirma", async () => {
    await screen.findByText("Mercado");

    fireEvent.change(screen.getByLabelText("Monto para Mercado"), { target: { value: "20000" } });
    fireEvent.click(screen.getByText("Sacar"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Sacaste \$\s*20\.000/);
    expect(banco.retirarBolsillo).toHaveBeenCalledTimes(1);
  });

  test("sin monto muestra un error y no llama al backend", async () => {
    await screen.findByText("Mercado");

    fireEvent.click(screen.getByText("Guardar"));

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe cuánto quieres guardar");
    expect(banco.depositarBolsillo).not.toHaveBeenCalled();
  });

  test("si el backend rechaza la operación se muestra su mensaje", async () => {
    banco.depositarBolsillo.mockResolvedValue({ ok: false, error: "Saldo insuficiente." });
    await screen.findByText("Mercado");

    fireEvent.change(screen.getByLabelText("Monto para Mercado"), { target: { value: "9999999" } });
    fireEvent.click(screen.getByText("Guardar"));

    expect(await screen.findByText("Saldo insuficiente.")).toBeInTheDocument();
    expect(recargar).not.toHaveBeenCalled();
  });

  test("crear un bolsillo envía su nombre y vuelve a leer la lista", async () => {
    banco.crearBolsillo.mockResolvedValue({ ok: true });
    await screen.findByText("Mercado");

    fireEvent.change(screen.getByLabelText(/Nombre del bolsillo/), { target: { value: "Viaje" } });
    fireEvent.click(screen.getByText("Crear bolsillo"));

    await waitFor(() => expect(banco.crearBolsillo).toHaveBeenCalledWith("AHO-020", "Viaje"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Bolsillo \"Viaje\" creado.");
    expect(banco.obtenerBolsillos).toHaveBeenCalledTimes(2);
  });
});
