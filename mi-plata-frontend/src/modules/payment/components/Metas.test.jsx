import { vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { AuthContext } from "../../auth/states/AuthContext.js";
import { BankContext } from "../../employees/states/BankContext.js";
import CuentaAhorros from "../../employees/lib/CuentaAhorros.js";
import * as banco from "../../employees/services/banco.js";
import Metas from "./Metas.jsx";

vi.mock("../../employees/services/banco.js", async (importOriginal) => ({
  ...(await importOriginal()),
  obtenerMetas: vi.fn(),
  crearMeta: vi.fn(),
  eliminarMeta: vi.fn(),
  aportarMeta: vi.fn(),
  retirarMeta: vi.fn(),
}));

const metaViaje = {
  metaID: 1, nombreMeta: "Viaje", montoObjetivo: 3000000, montoAhorrado: 300000, fechaObjetivo: "2027-12-20",
};

describe("Metas de ahorro (aportar no es una transacción)", () => {
  let recargar;

  beforeEach(async () => {
    vi.clearAllMocks();
    recargar = vi.fn();
    banco.obtenerMetas.mockResolvedValue({ ok: true, lista: [metaViaje] });
    banco.aportarMeta.mockResolvedValue({ ok: true });
    banco.retirarMeta.mockResolvedValue({ ok: true });

    const cliente = { cuentas: [new CuentaAhorros("AHO-020", 1620000)] };
    // act espera a que termine la carga inicial (la lista que llega del backend) antes de seguir
    await act(async () => {
      render(
        <AuthContext.Provider value={{ cliente }}>
          <BankContext.Provider value={{ clientes: [cliente], recargar }}>
            <Metas />
          </BankContext.Provider>
        </AuthContext.Provider>
      );
    });
  });

  test("renders la meta con su progreso", async () => {
    expect(await screen.findByText("Viaje")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progreso de Viaje" })).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByText(/faltan \$\s*2\.700\.000/)).toBeInTheDocument();
  });

  test("avisa que aportar a una meta no es una transacción", async () => {
    await screen.findByText("Viaje");

    expect(screen.getByText(/no\s+es una transacción/i)).toBeInTheDocument();
  });

  test("aportar llama a aportarMeta una vez y confirma", async () => {
    await screen.findByText("Viaje");

    fireEvent.change(screen.getByLabelText("Monto para Viaje"), { target: { value: "100000" } });
    fireEvent.click(screen.getByText("Aportar"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Aportaste \$\s*100\.000 a "Viaje"/);
    expect(banco.aportarMeta).toHaveBeenCalledTimes(1);
    expect(banco.aportarMeta.mock.calls[0].slice(2)).toEqual([1, 100000]);
    expect(recargar).toHaveBeenCalledTimes(1);
  });

  test("retirar de la meta devuelve la plata a la cuenta", async () => {
    await screen.findByText("Viaje");

    fireEvent.change(screen.getByLabelText("Monto para Viaje"), { target: { value: "50000" } });
    fireEvent.click(screen.getByText("Retirar"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Devolviste \$\s*50\.000/);
    expect(banco.retirarMeta).toHaveBeenCalledTimes(1);
  });

  test("sin monto muestra un error y no llama al backend", async () => {
    await screen.findByText("Viaje");

    fireEvent.click(screen.getByText("Aportar"));

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe cuánto quieres aportar");
    expect(banco.aportarMeta).not.toHaveBeenCalled();
  });
});
