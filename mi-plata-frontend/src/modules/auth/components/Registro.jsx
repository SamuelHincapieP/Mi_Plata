import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarcaPanel from "./MarcaPanel.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import { useBank } from "../../employees/hooks/useBank.js";
import { crearClienteRegistro, validarRegistro } from "../../employees/services/banco.js";
import { soloDigitos, soloNombre, soloUsuario, soloContrasena, LIMITES } from "../../core/utils/validacion.js";
import "./auth.css";

const PRODUCTOS = [
  { campo: "quiereAhorros", etiqueta: "Cuenta de ahorros", detalle: "Saldo mínimo $0 · interés 2% al retirar" },
  { campo: "quiereCorriente", etiqueta: "Cuenta corriente", detalle: "Sobregiro hasta el 5% de tu saldo" },
  { campo: "quiereTC", etiqueta: "Tarjeta de crédito", detalle: "Cupo inicial de $3.000.000" },
];

export default function Registro() {
  const { clientes } = useBank();
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    cedula: "",
    nombre: "",
    celular: "",
    usuario: "",
    contrasena: "",
    confirmar: "",
    quiereAhorros: true,
    quiereCorriente: false,
    quiereTC: false,
  });
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Sanitizadores por campo: límites estrictos mientras se escribe
  const SANITIZAR = {
    cedula: (v) => soloDigitos(v, LIMITES.documento),
    celular: (v) => soloDigitos(v, LIMITES.celular),
    nombre: soloNombre,
    usuario: soloUsuario,
    contrasena: soloContrasena,
    confirmar: soloContrasena,
  };

  function cambiar(campo) {
    return (e) => {
      const crudo = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      const valor =
        typeof crudo === "string" && SANITIZAR[campo] ? SANITIZAR[campo](crudo) : crudo;
      setDatos((d) => ({ ...d, [campo]: valor }));
    };
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setOk("");
    setEnviando(true);

    const limpio = { ...datos, usuario: datos.usuario.trim().toLowerCase() };
    const problema = validarRegistro(limpio, clientes);

    if (problema) {
      setError(problema);
      setEnviando(false);
      return;
    }

    const resultado = await crearClienteRegistro(clientes, limpio);
    if (!resultado.ok) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }
    setOk(`Cuenta creada, ${limpio.nombre}. Te llevamos al inicio de sesión…`);
    setEnviando(false);
    setTimeout(() => navigate("/login", { replace: true }), 1800);
  }

  const bloqueado = Boolean(ok);

  return (
    <div className="auth">
      <MarcaPanel
        titulo="Abre tu cuenta"
        texto="Registro en tres minutos: elige tus productos y empieza a mover tu dinero con reglas claras."
      />

      <div className="auth__form-lado">
        <form className="auth__form" onSubmit={enviar} noValidate>
          <div className="auth__cabecera">
            <span className="etiqueta">Registro</span>
            <h2 className="auth__titulo">Crea tu cuenta</h2>
            <p className="auth__subtitulo">Todos los campos son obligatorios.</p>
          </div>

          <Alerta tipo="error">{error}</Alerta>
          <Alerta tipo="ok">{ok}</Alerta>

          <div className="campo__fila">
            <Campo etiqueta="Documento" error={null}>
              <input
                className="campo__control"
                type="text"
                inputMode="numeric"
                value={datos.cedula}
                onChange={cambiar("cedula")}
                placeholder="6 a 10 dígitos"
                disabled={bloqueado}
              />
            </Campo>
            <Campo etiqueta="Celular">
              <input
                className="campo__control"
                type="tel"
                inputMode="numeric"
                value={datos.celular}
                onChange={cambiar("celular")}
                placeholder="10 dígitos"
                disabled={bloqueado}
              />
            </Campo>
          </div>

          <Campo etiqueta="Nombre completo">
            <input
              className="campo__control"
              type="text"
              value={datos.nombre}
              onChange={cambiar("nombre")}
              placeholder="Tu nombre y apellido"
              disabled={bloqueado}
            />
          </Campo>

          <Campo etiqueta="Usuario">
            <input
              className="campo__control"
              type="text"
              value={datos.usuario}
              onChange={cambiar("usuario")}
              placeholder="3 a 20 caracteres: a-z, . _ -"
              autoComplete="username"
              disabled={bloqueado}
            />
          </Campo>

          <div className="campo__fila">
            <Campo etiqueta="Contraseña">
              <div className="campo__con-ojo">
                <input
                  className="campo__control"
                  type={verClave ? "text" : "password"}
                  value={datos.contrasena}
                  onChange={cambiar("contrasena")}
                  placeholder="Mínimo 4 caracteres"
                  autoComplete="new-password"
                  disabled={bloqueado}
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
            <Campo etiqueta="Confirmar contraseña">
              <input
                className="campo__control"
                type={verClave ? "text" : "password"}
                value={datos.confirmar}
                onChange={cambiar("confirmar")}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                disabled={bloqueado}
              />
            </Campo>
          </div>

          <span className="campo__etiqueta">Productos (mínimo uno)</span>
          <div className="registro__productos">
            {PRODUCTOS.map((p) => (
              <label
                key={p.campo}
                className={`casilla ${datos[p.campo] ? "casilla--activa" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={datos[p.campo]}
                  onChange={cambiar(p.campo)}
                  disabled={bloqueado}
                />
                <span>
                  <strong>{p.etiqueta}</strong>
                  <br />
                  <small className="campo__ayuda">{p.detalle}</small>
                </span>
              </label>
            ))}
          </div>

          <Boton type="submit" ancho cargando={enviando} disabled={bloqueado}>
            Crear cuenta
          </Boton>

          <p className="auth__pie">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
