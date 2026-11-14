import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icono from "./Icono.jsx";

/**
 * Modal — capa superpuesta con fondo desenfocado. Aparece en 300ms
 * (--transition-media).
 *
 * Accesibilidad: role="dialog" + aria-modal, foco atrapado dentro del
 * diálogo al abrir, cierre con Escape y con clic en el velo.
 * useRef guarda el botón que lo abrió para devolverle el foco al cerrar.
 */
export default function Modal({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  ancho = "520px",
  children,
  pie = null,
}) {
  const caja = useRef(null);
  const botonOrigen = useRef(null);

  // Escape para cerrar + bloqueo de scroll del fondo + foco inicial
  useEffect(() => {
    if (!abierto) return undefined;

    botonOrigen.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function alTeclear(e) {
      if (e.key === "Escape") alCerrar();
    }
    document.addEventListener("keydown", alTeclear);

    caja.current?.focus();

    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflow;
      botonOrigen.current?.focus?.();
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div
      className="velo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <div
        ref={caja}
        className="modal"
        style={{ maxWidth: ancho }}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
      >
        <header className="modal__cabecera">
          <div>
            <h2 className="modal__titulo">{titulo}</h2>
            {descripcion && <p className="modal__descripcion">{descripcion}</p>}
          </div>
          <button
            type="button"
            className="modal__cerrar"
            onClick={alCerrar}
            aria-label="Cerrar"
          >
            <Icono nombre="cerrar" size={18} />
          </button>
        </header>

        <div className="modal__cuerpo">{children}</div>

        {pie && <footer className="modal__pie">{pie}</footer>}
      </div>
    </div>,
    document.body
  );
}