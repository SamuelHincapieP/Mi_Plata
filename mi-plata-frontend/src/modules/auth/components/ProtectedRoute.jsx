// ProtectedRoute — exige sesión activa (sem 6: roles y rutas protegidas).
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import Cargando from "../../core/design-system/Cargando.jsx";

export default function ProtectedRoute({ children }) {
  const { autenticado } = useAuth();
  const { cargando } = useBank();
  const location = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión…" />;
  if (!autenticado) return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  return children;
}
