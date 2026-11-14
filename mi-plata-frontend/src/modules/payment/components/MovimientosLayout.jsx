import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { ruta: "/movimientos", texto: "Menú", exacta: true },
  { ruta: "/movimientos/consignar", texto: "Consignar" },
  { ruta: "/movimientos/retirar", texto: "Retirar" },
  { ruta: "/movimientos/transferir", texto: "Transferir" },
  { ruta: "/movimientos/historial", texto: "Historial" },
  { ruta: "/movimientos/comprar", texto: "Comprar TC" },
  { ruta: "/movimientos/pagar", texto: "Pagar TC" },
];

/** Envoltorio de todas las pantallas de movimientos con sus fichas. */
export default function MovimientosLayout() {
  return (
    <div className="movimientos">
      <nav className="sub-tabs" aria-label="Secciones de movimientos">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.ruta}
            to={s.ruta}
            end={s.exacta}
            className={({ isActive }) => `sub-tab ${isActive ? "activo" : ""}`}
          >
            {s.texto}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
