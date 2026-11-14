// AdminRoute — solo administradores (rol "admin").
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import Cargando from "../../core/design-system/Cargando.jsx";

export default function AdminRoute({ children }) {
  const { autenticado, esAdmin } = useAuth();
  const { cargando } = useBank();

  if (cargando) return <Cargando texto="Verificando permisos…" />;
  if (!autenticado) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
