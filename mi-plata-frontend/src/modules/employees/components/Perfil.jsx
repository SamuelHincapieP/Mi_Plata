import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../hooks/useBank.js";
import { fechaCorta } from "../../core/utils/fechas.js";
import { soloContrasena } from "../../core/utils/validacion.js";
import { nombreTipo, cambiarContrasenaCliente } from "../services/banco.js";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Badge from "../../core/design-system/Badge.jsx";
import "./perfil.css";

export default function Perfil() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();

  const [antigua, setAntigua] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [alerta, setAlerta] = useState(null);

  if (!cliente) return null;

  async function cambiarContrasena(e) {
    e.preventDefault();
    setAlerta(null);

    if (!antigua || !nueva || !confirmar) {
      setAlerta({ tipo: "error", texto: "Completa todos los campos." });
      return;
    }
    if (nueva !== confirmar) {
      setAlerta({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
      return;
    }

    const resultado = await cambiarContrasenaCliente(clientes, cliente.id, antigua, nueva);
    if (!resultado.ok) {
      setAlerta({ tipo: "error", texto: resultado.error });
      return;
    }
    recargar();
    setAlerta({ tipo: "ok", texto: "Contraseña cambiada exitosamente." });
    setAntigua("");
    setNueva("");
    setConfirmar("");
  }

  const datos = [
    ["Nombre completo", cliente.nombreCompleto],
    ["Usuario", `@${cliente.usuario}`],
    ["Documento", cliente.identificacion],
    ["Celular", cliente.celular],
    ["Rol", cliente.esAdmin ? "Administrador" : "Cliente"],
    ["Registro", fechaCorta(cliente.fechaRegistro)],
  ];

  return (
    <div className="perfil">
      {/* ── Datos ── */}
      <section className="perfil__datos" aria-label="Datos personales">
        <div className="perfil__cabecera">
          <span className="perfil__avatar" aria-hidden="true">
            {cliente.nombreCompleto.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="pagina__titulo">{cliente.nombreCompleto}</h1>
            <p className="pagina__subtitulo">@{cliente.usuario}</p>
          </div>
        </div>

        <dl className="perfil__lista">
          {datos.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="etiqueta">{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="perfil__productos">
          <p className="etiqueta">Productos ({cliente.cuentas.length})</p>
          <ul>
            {cliente.cuentas.map((c) => (
              <li key={c.numeroCuenta}>
                <Icono nombre="tarjeta" size={16} />
                <span>{nombreTipo(c)}</span>
                <span className="mono">{c.numeroCuenta}</span>
                <Badge tono={c.estado === "ACTIVA" ? "ok" : "peligro"} punto>
                  {c.estado}
                </Badge>
              </li>
            ))}
            {cliente.cuentas.length === 0 && (
              <li className="perfil__sin-productos">
                <Icono nombre="info" size={16} />
                Sin productos asociados
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* ── Seguridad ── */}
      <section className="perfil__seguridad" aria-label="Seguridad de la cuenta">
        <div className="panel">
          <div className="panel__cabecera">
            <div>
              <p className="etiqueta">Seguridad</p>
              <h2 className="mov-form__titulo">Cambiar contraseña</h2>
            </div>
            <Badge tono={cliente.bloqueado ? "peligro" : "ok"} punto>
              {cliente.bloqueado ? "Bloqueada" : "Activa"}
            </Badge>
          </div>

          <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

          <form onSubmit={cambiarContrasena} noValidate>
            <Campo etiqueta="Contraseña actual">
              <input
                className="campo__control"
                type="password"
                value={antigua}
                onChange={(e) => setAntigua(soloContrasena(e.target.value))}
                autoComplete="current-password"
              />
            </Campo>

            <div className="campo__fila">
              <Campo etiqueta="Nueva contraseña">
                <input
                  className="campo__control"
                  type="password"
                  value={nueva}
                  onChange={(e) => setNueva(soloContrasena(e.target.value))}
                  autoComplete="new-password"
                />
              </Campo>
              <Campo etiqueta="Confirmar nueva">
                <input
                  className="campo__control"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(soloContrasena(e.target.value))}
                  autoComplete="new-password"
                />
              </Campo>
            </div>

            <Boton type="submit">Guardar contraseña</Boton>
          </form>
        </div>

        <div className="panel">
          <div className="panel__cabecera">
            <p className="etiqueta">Estado de la sesión</p>
          </div>
          <ul className="perfil__estado">
            <li>
              <span className="sesion-segura">
                <span className="sesion-segura__punto" aria-hidden="true" />
                Sesión segura activa
              </span>
            </li>
            <li>Intentos fallidos: <strong className="mono">{cliente.intentosFallidos}/3</strong></li>
            <li>
              {cliente.bloqueado
                ? "Cuenta bloqueada: solo un administrador puede desbloquearla."
                : "Se bloquea automáticamente al tercer intento fallido."}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
