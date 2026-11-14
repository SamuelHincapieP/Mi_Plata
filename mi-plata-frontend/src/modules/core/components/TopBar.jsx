import { useNavigate, useLocation } from "react-router-dom";
import Icono from "../design-system/Icono.jsx";
import Badge from "../design-system/Badge.jsx";
import Migas from "./Migas.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

/**
 * Barra superior: migas depan, indicador de sesión segura, chip de usuario
 * y salida. Fondo de vidrio controlado (solo esta barra y la inferior).
 */
export default function TopBar() {
  const { cliente, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function salir() {
    logout();
    navigate("/login");
  }

  const nombre = cliente?.nombreCompleto || "Usuario";
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="topbar">
      <div className="topbar__izquierda">
        <Migas pathname={pathname} />
      </div>

      <div className="topbar__derecha">
        <Badge tono="ok" punto className="sesion-segura">
          Sesión segura
        </Badge>

        <span className="chip-usuario">
          <span className="chip-usuario__inicial" aria-hidden="true">
            {iniciales}
          </span>
          <span className="chip-usuario__datos">
            <span className="chip-usuario__nombre">{nombre}</span>
            <span className="chip-usuario__rol">
              {cliente?.rol === "admin" ? "Administrador" : "Cliente"}
            </span>
          </span>
        </span>

        <button
          type="button"
          className="boton boton--fantasma topbar__salir"
          onClick={salir}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <Icono nombre="salir" size={18} />
          <span className="topbar__salir-texto">Salir</span>
        </button>
      </div>
    </header>
  );
}