import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Boton from "./Boton.jsx";

describe("Boton", () => {
  test("renders su texto", () => {
    render(<Boton>Guardar</Boton>);

    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  test("por defecto es primario y acepta otra variante", () => {
    render(<><Boton>Guardar</Boton><Boton variante="peligro">Eliminar</Boton></>);

    expect(screen.getByText("Guardar")).toHaveClass("boton--primario");
    expect(screen.getByText("Eliminar")).toHaveClass("boton--peligro");
  });

  // Igual que "clicking the button calls event handler once" del video:
  // el mock es un espía que nos dice cuántas veces se llamó
  test("clicking the button calls event handler once", () => {
    const mockHandler = vi.fn();
    render(<Boton onClick={mockHandler}>Aportar</Boton>);

    const boton = screen.getByText("Aportar");
    fireEvent.click(boton);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test("cargando deshabilita el botón y el click no hace nada", () => {
    const mockHandler = vi.fn();
    render(<Boton cargando onClick={mockHandler}>Enviar</Boton>);

    const boton = screen.getByText("Enviar");
    fireEvent.click(boton);

    expect(boton).toBeDisabled();
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
