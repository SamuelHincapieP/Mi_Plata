import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthContext } from "../../auth/states/AuthContext.js";
import { BankContext } from "../../employees/states/BankContext.js";
import CuentaAhorros from "../../employees/lib/CuentaAhorros.js";
import TarjetaCredito from "../../employees/lib/TarjetaCredito.js";
import * as banco from "../../employees/services/banco.js";
import Pagar from "./Pagar.jsx";

// Solo se simula la llamada al backend; el resto es el código real del componente.
vi.mock("../../employees/services/banco.js", async (importOriginal) => ({
  ...(await importOriginal()),
  pagarTarjeta: vi.fn(),
}));

function tarjetaConDeuda() {
  const tc = new TarjetaCredito("TC-022", 3000000);
  tc._deuda = 100000;
  return tc;
}

function renderizar(cliente, recargar = vi.fn()) {
  return render(
    <AuthContext.Provider value={{ cliente }}>
      <BankContext.Provider value={{ clientes: [cliente], recargar }}>
        <Pagar />
      </BankContext.Provider>
    </AuthContext.Provider>
  );
}

describe("Pagar TC (el dinero sale de una cuenta real)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    banco.pagarTarjeta.mockResolvedValue({ ok: true, monto: 50000, deuda: 50000 });
  });

  test("envía la tarjeta, la cuenta de origen y el monto al backend", async () => {
    const ahorros = new CuentaAhorros("AHO-020", 500000);
    const tc = tarjetaConDeuda();
    const recargar = vi.fn();
    renderizar({ cuentas: [ahorros, tc] }, recargar);

    expect(screen.getByLabelText("Tarjeta a pagar")).toHaveValue("TC-022");
    expect(screen.getByLabelText("Cuenta de origen")).toHaveValue("AHO-020");

    fireEvent.change(screen.getByLabelText("Monto a pagar"), { target: { value: "50000" } });
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/desde AHO-020/);
    expect(banco.pagarTarjeta).toHaveBeenCalledWith(
      expect.any(Array),
      tc,
      ahorros,
      50000
    );
    expect(recargar).toHaveBeenCalledTimes(1);
  });

  test("sin cuenta de ahorros o corriente no permite pagar", () => {
    renderizar({ cuentas: [tarjetaConDeuda()] });

    expect(screen.getByText(/No tienes una cuenta de ahorros o corriente/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagar" })).toBeDisabled();
    expect(banco.pagarTarjeta).not.toHaveBeenCalled();
  });
});
