import { render, screen } from "@testing-library/react";
import Campo from "./Campo.jsx";

describe("Campo", () => {
  // Se busca por la etiqueta, como lo haría una persona (y así se comprueba la accesibilidad)
  test("la etiqueta queda asociada al control", () => {
    render(
      <Campo etiqueta="Monto">
        <input type="number" />
      </Campo>
    );

    expect(screen.getByLabelText("Monto")).toBeInTheDocument();
  });

  test("muestra el error con role alert", () => {
    render(
      <Campo etiqueta="Monto" error="Escribe un monto válido">
        <input type="number" />
      </Campo>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe un monto válido");
  });

  test("la ayuda se oculta cuando hay error", () => {
    const { rerender } = render(
      <Campo etiqueta="Monto" ayuda="Solo números">
        <input type="number" />
      </Campo>
    );
    expect(screen.getByText("Solo números")).toBeInTheDocument();

    rerender(
      <Campo etiqueta="Monto" ayuda="Solo números" error="Muy bajo">
        <input type="number" />
      </Campo>
    );
    expect(screen.queryByText("Solo números")).not.toBeInTheDocument();
  });
});
