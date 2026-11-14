import { useState } from "react";
import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal.jsx";

// Modal es el equivalente del "Togable" del video: aparece, se ve el contenido y se puede cerrar.
describe("Modal", () => {
  let alCerrar;

  // beforeEach se ejecuta antes de cada test: así no repetimos el mock en todos
  beforeEach(() => {
    alCerrar = vi.fn();
  });

  test("cerrado no renderiza nada", () => {
    render(<Modal abierto={false} alCerrar={alCerrar} titulo="Confirmar"><p>Contenido</p></Modal>);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  test("abierto renderiza el título, la descripción y sus hijos", () => {
    render(
      <Modal abierto alCerrar={alCerrar} titulo="Confirmar" descripcion="¿Seguro?">
        <p>Contenido</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
    expect(screen.getByText("¿Seguro?")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  test("el botón cerrar llama a alCerrar una vez", () => {
    render(<Modal abierto alCerrar={alCerrar} titulo="Confirmar"><p>Contenido</p></Modal>);

    fireEvent.click(screen.getByLabelText("Cerrar"));

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  test("la tecla Escape también cierra", () => {
    render(<Modal abierto alCerrar={alCerrar} titulo="Confirmar"><p>Contenido</p></Modal>);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  test("muestra el pie con las acciones", () => {
    render(
      <Modal abierto alCerrar={alCerrar} titulo="Confirmar" pie={<button>Aceptar</button>}>
        <p>Contenido</p>
      </Modal>
    );

    expect(screen.getByText("Aceptar")).toBeInTheDocument();
  });

  // Un solo test que sigue el comportamiento del usuario: abre, ve el contenido y cierra
  test("flujo del usuario: se abre, se ve el contenido y se cierra", () => {
    function Ejemplo() {
      const [abierto, setAbierto] = useState(false);
      return (
        <>
          <button onClick={() => setAbierto(true)}>Abrir</button>
          <Modal abierto={abierto} alCerrar={() => setAbierto(false)} titulo="Detalle"><p>Contenido</p></Modal>
        </>
      );
    }
    render(<Ejemplo />);
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Abrir"));
    expect(screen.getByText("Contenido")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });
});
