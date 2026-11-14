import { render, screen } from "@testing-library/react";
import Alerta from "./Alerta.jsx";

describe("Alerta", () => {
  test("sin mensaje no dibuja nada", () => {
    render(<Alerta tipo="error">{""}</Alerta>);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("con mensaje se anuncia con role alert y su tipo", () => {
    render(<Alerta tipo="error">Saldo insuficiente</Alerta>);

    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("Saldo insuficiente");
    expect(alerta).toHaveClass("alerta--error");
  });

  test("una alerta ok usa su propio tipo", () => {
    render(<Alerta tipo="ok">Guardaste $50.000</Alerta>);

    expect(screen.getByRole("alert")).toHaveClass("alerta--ok");
  });
});
