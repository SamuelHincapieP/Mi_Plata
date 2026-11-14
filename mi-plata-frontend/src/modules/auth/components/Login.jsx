import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import MarcaPanel from "./MarcaPanel.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Badge from "../../core/design-system/Badge.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Cargando from "../../core/design-system/Cargando.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { soloUsuario, soloContrasena } from "../../core/utils/validacion.js";
import "./auth.css";

const MAX_INTENTOS = 3;

export default function Login() {
  const { login, autenticado, esAdmin } = useAuth();
  const { cargando } = useBank();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Aquí no hay layout que conservar: basta el indicador centrado.
  if (cargando) return <Cargando forma="texto" texto="Preparando tu sesión…" />;
  if (autenticado) {
    // Si ya hay sesión, salimos del login respetando el rol
    const destino = location.state?.desde || (esAdmin ? "/admin" : "/dashboard");
    return <Navigate to={destino} replace />;
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);

    const resultado = await login(usuario.trim().toLowerCase(), contrasena);
    setEnviando(false);

    if (resultado.ok) {
      const destino = resultado.cliente.esAdmin
        ? "/admin"
        : location.state?.desde || "/dashboard";
      navigate(destino, { replace: true });
      return;
    }

    setError(resultado.error);
    if (typeof resultado.intentos === "number") setIntentos(resultado.intentos);
    if (resultado.bloqueado) setBloqueado(true);
  }

  const agotado = bloqueado || intentos >= MAX_INTENTOS;

  return (
    <div className="auth">
      <MarcaPanel
        titulo="Entrar a tu cuenta"
        texto="Revisa saldos, mueve dinero y controla tu tarjeta con la claridad de un libro contable."
      />

      <div className="auth__form-lado">
        <form className="auth__form" onSubmit={enviar} noValidate>
          <div className="auth__cabecera">
            <span className="etiqueta">Acceso</span>
            <h2 className="auth__titulo">Inicia sesión</h2>
            <p className="auth__subtitulo">Usa tu usuario y contraseña de Mi Plata.</p>
          </div>

          <div className="auth__indicador">
            <span className="sesion-segura">
              <span className="sesion-segura__punto" aria-hidden="true" />
              Conexión segura
            </span>
            <Badge
              tono={agotado ? "peligro" : intentos > 0 ? "aviso" : "neutro"}
              punto={agotado}
            >
              Intentos {intentos}/{MAX_INTENTOS}
            </Badge>
          </div>

          <Alerta tipo="error">{error}</Alerta>
          {agotado && (
            <Alerta tipo="aviso">
              Cuenta bloqueada por demasiados intentos fallidos. Contacta al administrador.
            </Alerta>
          )}

          <Campo etiqueta="Usuario">
            <input
              className="campo__control"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(soloUsuario(e.target.value))}
              placeholder="ej. samuel"
              autoComplete="username"
              autoFocus
            />
          </Campo>

          <Campo etiqueta="Contraseña">
            <div className="campo__con-ojo">
              <input
                className="campo__control"
                type={verClave ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(soloContrasena(e.target.value))}
                placeholder="••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="campo__ojo"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Icono nombre={verClave ? "ojo-cerrado" : "ojo"} size={18} />
              </button>
            </div>
          </Campo>

          <Boton type="submit" ancho cargando={enviando} disabled={agotado}>
            Ingresar
          </Boton>

          <p className="auth__pie">
            ¿Aún no tienes cuenta? <Link to="/registro">Créala aquí</Link>
          </p>
          <p className="auth__pie auth__pie--sin-borde">
            <Link to="/">Volver al inicio</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
