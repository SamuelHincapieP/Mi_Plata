import { Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";

/**
 * Migas — breadcrumb. El sitio tiene 3 niveles de profundidad
 * (/movimientos/consignar), así que la ubicación debe ser visible
 * en la barra superior. La última miga es la página actual.
 */

const RUTAS = {
  "/dashboard": "Panel general",
  "/perfil": "Mi perfil",
  "/admin": "Panel administrador",
  "/reportes": "Reportes",
  "/movimientos": "Movimientos",
  "/movimientos/consignar": "Consignar",
  "/movimientos/retirar": "Retirar",
  "/movimientos/transferir": "Transferir",
  "/movimientos/historial": "Historial",
  "/movimientos/comprar": "Comprar con tarjeta",
  "/movimientos/pagar": "Pagar con tarjeta",
};

export default function Migas({ pathname }) {
  const actual = RUTAS[pathname] || "Panel general";

  // Solo /movimientos/* cuelga de otra sección; el resto es primer nivel.
  const padre = pathname.startsWith("/movimientos/") ? "/movimientos" : null;

  const { esAdmin } = useAuth();

  return (
    <nav className="migas" aria-label="Ruta de navegación">
      <Link to={esAdmin ? "/admin" : "/dashboard"} className="migas__inicio">
        Mi Plata
      </Link>

      {padre && (
        <>
          <span className="migas__sep" aria-hidden="true">
            /
          </span>
          <Link to={padre} className="migas__nivel">
            {RUTAS[padre]}
          </Link>
        </>
      )}

      <span className="migas__sep" aria-hidden="true">
        /
      </span>
      <span className="migas__actual" aria-current="page">
        {actual}
      </span>
    </nav>
  );
}