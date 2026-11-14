// ClienteRoute — pantallas de operaciones bancarias: el administrador no las usa.
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ClienteRoute({ children }) {
  const { esAdmin } = useAuth();
  if (esAdmin) return <Navigate to="/admin" replace />;
  return children;
}
