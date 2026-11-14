import { render, screen } from "@testing-library/react";
import FilaMovimiento from "./FilaMovimiento.jsx";

const base = { valor: 50000, saldoPosterior: 950000, fechaHora: new Date("2026-11-10T10:30:00") };

// FilaMovimiento es un <li>, así que se renderiza dentro de una lista
function dibujar(movimiento, props = {}) {
  return render(
    <ul>
      <FilaMovimiento movimiento={movimiento} {...props} />
    </ul>
  );
}

describe("FilaMovimiento", () => {
  test("renders la etiqueta del tipo y la descripción", () => {
    dibujar({ ...base, tipo: "TRANSFERENCIA_OUT", descripcion: "A AHO-030" });

    expect(screen.getByText("Transferencia enviada")).toBeInTheDocument();
    expect(screen.getByText("A AHO-030")).toBeInTheDocument();
  });

  test("una salida muestra el valor con signo menos", () => {
    dibujar({ ...base, tipo: "RETIRO", descripcion: "" });

    expect(screen.getByRole("listitem")).toHaveTextContent("−");
    expect(screen.getByRole("listitem")).toHaveTextContent("50.000");
  });

  test("una entrada muestra el valor con signo más", () => {
    dibujar({ ...base, tipo: "CONSIGNACION", descripcion: "" });

    expect(screen.getByText("Consignación")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("+");
  });

  test("sin descripción no dibuja la línea extra", () => {
    dibujar({ ...base, tipo: "RETIRO", descripcion: "" });

    expect(screen.queryByText("A AHO-030")).not.toBeInTheDocument();
  });

  test("muestra el número de cuenta cuando se pide", () => {
    dibujar({ ...base, tipo: "RETIRO" }, { cuentaNumero: "AHO-020" });

    expect(screen.getByText("AHO-020")).toBeInTheDocument();
  });

  test("un tipo desconocido no rompe la fila", () => {
    dibujar({ ...base, tipo: "TIPO_NUEVO" });

    expect(screen.getByText("TIPO NUEVO")).toBeInTheDocument();
  });

  test("un depósito a bolsillo ya no es un movimiento conocido (no es una transacción)", () => {
    dibujar({ ...base, tipo: "BOLSILLO_DEPOSITO" });

    expect(screen.queryByText("Guardado en bolsillo")).not.toBeInTheDocument();
  });
});
