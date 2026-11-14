import { NavLink } from "react-router-dom";
import Icono from "../design-system/Icono.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

// El cliente opera con sus cuentas; el administrador solo gestiona y consulta.
const ENLACES_CLIENTE = [
  { ruta: "/dashboard", icono: "casa", texto: "Panel" },
  { ruta: "/movimientos", icono: "movimientos", texto: "Movimientos" },
  { ruta: "/reportes", icono: "reportes", texto: "Reportes" },
  { ruta: "/perfil", icono: "perfil", texto: "Perfil" },
];
const ENLACES_ADMIN = [
  { ruta: "/admin", icono: "admin", texto: "Administración" },
  { ruta: "/reportes", icono: "reportes", texto: "Reportes" },
  { ruta: "/perfil", icono: "perfil", texto: "Perfil" },
];

/**
 * Navegación lateral. En >= 1280px se despliega a un rail de 240px con
 * etiquetas; por debajo queda como rail de iconos con tooltip.
 * En móvil pasa a barra inferior.
 */
export default function SideNav() {
  const { esAdmin } = useAuth();
  const enlaces = esAdmin ? ENLACES_ADMIN : ENLACES_CLIENTE;

  return (
    <aside className="lateral">
      <NavLink to={esAdmin ? "/admin" : "/dashboard"} className="lateral__marca" aria-label="Mi Plata — inicio">
        <span className="lateral__logo" aria-hidden="true">
          <img src="/logo.png" srcSet="/logo-128.png 128w, /logo.png 792w" sizes="34px"
            width="34" height="34" alt="" className="marca-img" decoding="async" />
        </span>
        <span className="lateral__nombre">
          <strong>Mi Plata</strong>
          <small>Banca digital</small>
        </span>
      </NavLink>

      <nav className="lateral__nav" aria-label="Navegación principal">
        {enlaces.map((e) => (
          <NavLink
            key={e.ruta}
            to={e.ruta}
            className={({ isActive }) => `lateral__enlace ${isActive ? "activo" : ""}`}
          >
            <span className="lateral__icono">
              <Icono nombre={e.icono} size={21} />
            </span>
            <span className="lateral__texto">{e.texto}</span>
            <span className="lateral__pista" role="tooltip">
              {e.texto}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="lateral__pie">
        <span className="lateral__sello">
          <Icono nombre="escudo" size={16} />
          <span>Datos protegidos</span>
        </span>
      </div>
    </aside>
  );
}