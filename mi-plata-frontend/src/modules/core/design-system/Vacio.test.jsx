import { render, screen } from "@testing-library/react";
import Vacio from "./Vacio.jsx";

describe("Vacio", () => {
  test("muestra título y texto", () => {
    render(<Vacio variante="busqueda" titulo="Sin bolsillos" texto="Crea el primero" />);

    expect(screen.getByText("Sin bolsillos")).toBeInTheDocument();
    expect(screen.getByText("Crea el primero")).toBeInTheDocument();
  });

  test("por defecto habla de movimientos y se anuncia como estado", () => {
    render(<Vacio />);

    expect(screen.getByText("Sin movimientos")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
