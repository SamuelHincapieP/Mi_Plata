// AuthProvider — Sesión con roles (cliente/admin) sobre sessionStorage.
import { useMemo, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { iniciarSesion as servicioLogin, cerrarSesion, usuarioSesion, rolSesion } from "../services/auth.js";

export function AuthProvider({ children }) {
  const { clientes } = useBank();
  const [usuario, setUsuario] = useState(() => usuarioSesion());
  const [rol, setRol] = useState(() => rolSesion());

  // Cliente activo derivado: siempre refleja los datos más recientes de la base de datos
  const cliente = useMemo(
    () => clientes.find((c) => c.usuario === usuario) || null,
    [clientes, usuario]
  );

  /**
   * Login contra el backend. Devuelve { ok, error?, intentos?, bloqueado? } para que la
   * pantalla muestre intentos y bloqueo (regla de negocio original).
   */
  const login = useCallback(
    async (user, contrasena) => {
      const resultado = await servicioLogin(clientes, user, contrasena);
      if (resultado.ok) {
        setUsuario(resultado.cliente.usuario);
        setRol(resultado.cliente.rol);
      }
      return resultado;
    },
    [clientes]
  );

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
    setRol("cliente");
  }, []);

  const valor = useMemo(
    () => ({ cliente, usuario, rol, autenticado: Boolean(cliente), esAdmin: rol === "admin", login, logout }),
    [cliente, usuario, rol, login, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
