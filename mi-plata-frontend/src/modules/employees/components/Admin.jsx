import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBank } from "../hooks/useBank.js";
import {
  crearClienteAdmin,
  validarProductos,
  productosElegidos,
  guardarEdicionCliente,
  cambiarEstadoCliente,
  resetearSaldosCliente,
  eliminarCliente,
  validarDatosCliente,
  saldoCuenta,
  contarMovimientos,
  totalDinero,
} from "../services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { fechaCorta } from "../../core/utils/fechas.js";
import { soloDigitos, soloNombre, soloUsuario, soloContrasena, LIMITES } from "../../core/utils/validacion.js";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Badge from "../../core/design-system/Badge.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import Modal from "../../core/design-system/Modal.jsx";
import "./admin.css";

const VACIO = { cedula: "", nombre: "", celular: "", usuario: "", contrasena: "", rol: "cliente" };
// Alta: el admin elige qué cuentas tendrá el cliente (por defecto solo ahorros)
const NUEVO = { ...VACIO, quiereAhorros: true, quiereCorriente: false, quiereTC: false };
const PRODUCTOS = [
  { campo: "quiereAhorros", clave: "ahorros", etiqueta: "Cuenta de ahorros", nombre: "Ahorros" },
  { campo: "quiereCorriente", clave: "corriente", etiqueta: "Cuenta corriente", nombre: "Corriente" },
  { campo: "quiereTC", clave: "tc", etiqueta: "Tarjeta de crédito", nombre: "Tarjeta" },
];
const FILTROS_INICIALES = { busqueda: "", estado: "todos", producto: "todos", orden: "registro" };

const saldoDe = (cliente) => cliente.cuentas.reduce((t, c) => t + saldoCuenta(c), 0);

// Criterios de orden del listado de clientes
const ORDENES = {
  registro: (a, b) => b.fechaRegistro - a.fechaRegistro,
  nombre: (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, "es"),
  saldo: (a, b) => saldoDe(b) - saldoDe(a),
};

function nombreProducto(cuenta) {
  if (cuenta.tipo === "CuentaAhorros") return "Ahorros";
  if (cuenta.tipo === "CuentaCorriente") return "Corriente";
  return "Crédito";
}

export default function Admin() {
  const { clientes, recargar, version } = useBank();

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [nuevo, setNuevo] = useState(NUEVO);
  const [alertaNuevo, setAlertaNuevo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState(VACIO);
  const [alertaEdicion, setAlertaEdicion] = useState(null);

  // Métricas con useMemo: cambian cuando cambia la versión de datos
  const metricas = useMemo(() => {
    const cuentasActivas = clientes.reduce(
      (t, c) => (c.bloqueado ? t : t + c.cuentas.filter((k) => k.estado === "ACTIVA").length),
      0
    );
    const movimientos = clientes.reduce((t, c) => t + contarMovimientos(c), 0);
    return {
      usuarios: clientes.length,
      dinero: totalDinero(clientes),
      cuentasActivas,
      movimientos,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes, version]);

  // Últimas transacciones de todo el banco (quién, cuenta, tipo de cuenta, operación)
  const actividad = useMemo(
    () =>
      clientes
        .flatMap((c) =>
          c.cuentas.flatMap((k) =>
            k.movimientos.map((m) => ({
              clave: `${k.numeroCuenta}-${m.id}`,
              fecha: m.fechaHora,
              cliente: c.nombreCompleto,
              numero: k.numeroCuenta,
              producto: nombreProducto(k),
              tipo: m.tipo,
              valor: m.valor,
            }))
          )
        )
        .sort((a, b) => b.fecha - a.fecha)
        .slice(0, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientes, version]
  );

  const filtrados = useMemo(() => {
    const texto = filtros.busqueda.toLowerCase();
    const lista = clientes.filter((cliente) => {
      const haystack = [
        cliente.nombreCompleto,
        cliente.identificacion,
        cliente.usuario,
        `${cliente.usuario}@miplata.com`,
      ]
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = !texto || haystack.includes(texto);
      const coincideEstado =
        filtros.estado === "todos" ||
        (filtros.estado === "activos" && !cliente.bloqueado) ||
        (filtros.estado === "bloqueados" && cliente.bloqueado);
      const coincideProducto =
        filtros.producto === "todos" ||
        cliente.cuentas.some((c) => c.tipo === filtros.producto);
      return coincideBusqueda && coincideEstado && coincideProducto;
    });
    return [...lista].sort(ORDENES[filtros.orden] || ORDENES.registro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes, filtros, version]);

  const ultimos = useMemo(
    () => [...clientes].sort((a, b) => b.fechaRegistro - a.fechaRegistro).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientes, version]
  );

  const saldoCliente = (cliente) =>
    cliente.cuentas.reduce((t, c) => t + saldoCuenta(c), 0);

  const sincronizar = () => recargar();

  // Sanitizadores de formulario: límites estrictos mientras se escribe
  const SAN = {
    cedula: (v) => soloDigitos(v, LIMITES.documento),
    celular: (v) => soloDigitos(v, LIMITES.celular),
    nombre: soloNombre,
    usuario: soloUsuario,
    contrasena: soloContrasena,
  };
  const limpiar = (campo, v) => (SAN[campo] || ((x) => x))(v);
  const cambiarNuevo = (campo) => (e) =>
    setNuevo((d) => ({ ...d, [campo]: limpiar(campo, e.target.value) }));
  const cambiarEdicion = (campo) => (e) =>
    setEdicion((d) => ({ ...d, [campo]: limpiar(campo, e.target.value) }));

  // ── Alta ────────────────────────────────────────────
  async function crear(e) {
    e.preventDefault();
    const error = validarDatosCliente(nuevo, clientes, 0) || validarProductos(nuevo);
    if (error) return setAlertaNuevo({ tipo: "error", texto: error });
    const elegidos = productosElegidos(nuevo);
    const resultado = await crearClienteAdmin(clientes, { ...nuevo, usuario: nuevo.usuario.toLowerCase() });
    if (!resultado.ok) return setAlertaNuevo({ tipo: "error", texto: resultado.error });
    sincronizar();
    setNuevo(NUEVO);
    setAlertaNuevo({
      tipo: "ok",
      texto: nuevo.rol === "admin"
        ? "Administrador creado."
        : `Cliente creado con: ${PRODUCTOS.filter((p) => elegidos.includes(p.clave)).map((p) => p.nombre).join(", ")}.`,
    });
  }

  // ── Edición ─────────────────────────────────────────
  function abrirEdicion(cliente) {
    setEditandoId(cliente.id);
    setEdicion({
      cedula: cliente.identificacion,
      nombre: cliente.nombreCompleto,
      celular: cliente.celular,
      usuario: cliente.usuario,
      contrasena: cliente.contrasena,
    });
    setAlertaEdicion(null);
    document.getElementById("panel-edicion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    const resultado = await guardarEdicionCliente(clientes, editandoId, {
      ...edicion,
      usuario: edicion.usuario.toLowerCase(),
    });
    if (!resultado.ok) return setAlertaEdicion({ tipo: "error", texto: resultado.error });
    sincronizar();
    setEditandoId(null);
  }

  // ── Acciones de fila ────────────────────────────────
  // Las acciones que piden confirmación ya no usan el confirm() del
  // navegador: se confirman en el Modal del sistema. La lógica de negocio
  // (cambiarEstadoCliente, resetearSaldosCliente, eliminarCliente) queda igual.
  const [confirmacion, setConfirmacion] = useState(null);

  function accionCliente(accion, cliente) {
    if (accion === "editar") return abrirEdicion(cliente);

    setConfirmacion({ accion, cliente });
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return;
    const { accion, cliente } = confirmacion;
    setConfirmacion(null);

    // Cada acción se guarda en la base de datos; si el servidor rechaza algo, se avisa
    let resultado = null;
    if (accion === "bloquear") resultado = await cambiarEstadoCliente(clientes, cliente.id, true);
    if (accion === "desbloquear") resultado = await cambiarEstadoCliente(clientes, cliente.id, false);
    if (accion === "reset") resultado = await resetearSaldosCliente(clientes, cliente.id);
    if (accion === "eliminar") resultado = await eliminarCliente(clientes, cliente.id);

    if (resultado && !resultado.ok) alert(resultado.error);
    sincronizar();
  }

  // Textos del diálogo según la acción pendiente
  const CONFIRMAR = {
    bloquear: {
      titulo: "Bloquear la cuenta",
      texto: "El cliente no podrá iniciar sesión hasta que lo desbloquees.",
      ok: "Bloquear",
    },
    desbloquear: {
      titulo: "Desbloquear la cuenta",
      texto: "El cliente podrá volver a iniciar sesión de inmediato.",
      ok: "Desbloquear",
    },
    reset: {
      titulo: "Resetear saldos y deuda",
      texto: "Todos los saldos y deudas de sus productos quedarán en cero. No se puede deshacer.",
      ok: "Resetear",
    },
    eliminar: {
      titulo: "Eliminar cliente",
      texto: "Se borrará el cliente y sus productos vacíos de forma definitiva. Solo se permite si no tiene movimientos ni saldos pendientes.",
      ok: "Eliminar",
    },
  };

  const filtrosSet = (campo) => (e) =>
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  return (
    <div className="admin">
      {/* ── Métricas ── */}
      <section className="admin__metricas" aria-label="Métricas del sistema">
        <div className="admin__metrica">
          <span className="etiqueta">Usuarios</span>
          <strong className="admin__metrica-valor">{metricas.usuarios}</strong>
        </div>
        <div className="admin__metrica">
          <span className="etiqueta">Dinero en cuentas</span>
          <strong className="admin__metrica-valor">{fmt(metricas.dinero)}</strong>
        </div>
        <div className="admin__metrica">
          <span className="etiqueta">Cuentas activas</span>
          <strong className="admin__metrica-valor">{metricas.cuentasActivas}</strong>
        </div>
        <div className="admin__metrica">
          <span className="etiqueta">Movimientos</span>
          <strong className="admin__metrica-valor">{metricas.movimientos}</strong>
        </div>
      </section>

      {/* ── Actividad reciente ── */}
      <section className="panel" aria-label="Actividad reciente">
        <div className="panel__cabecera">
          <div>
            <p className="etiqueta">Trazabilidad</p>
            <h2 className="mov-form__titulo">Actividad reciente del banco</h2>
          </div>
          <Link className="boton boton--secundario" to="/reportes">
            <Icono nombre="reportes" size={16} />
            Ver reportes completos
          </Link>
        </div>
        {actividad.length === 0 ? (
          <Vacio titulo="Sin transacciones" texto="Aún no hay movimientos registrados en el banco." />
        ) : (
          <div className="admin__tabla-envoltura">
            <table className="admin__tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Realizado por</th>
                  <th>N.º de cuenta</th>
                  <th>Tipo de cuenta</th>
                  <th>Operación</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {actividad.map((a) => (
                  <tr key={a.clave}>
                    <td>{fechaCorta(a.fecha)}</td>
                    <td>{a.cliente}</td>
                    <td>{a.numero}</td>
                    <td>{a.producto}</td>
                    <td>{a.tipo.replaceAll("_", " ")}</td>
                    <td>{fmt(a.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Crear cliente ── */}
      <section className="panel" aria-label="Crear cliente">
        <div className="panel__cabecera">
          <div>
            <p className="etiqueta">Alta de clientes</p>
            <h2 className="mov-form__titulo">Crear usuario</h2>
          </div>
        </div>

        <Alerta tipo={alertaNuevo?.tipo}>{alertaNuevo?.texto}</Alerta>

        <form className="admin__form" onSubmit={crear} noValidate>
          <Campo etiqueta="Documento">
            <input className="campo__control" type="text" inputMode="numeric"
              value={nuevo.cedula}
              onChange={cambiarNuevo("cedula")} />
          </Campo>
          <Campo etiqueta="Nombre completo">
            <input className="campo__control" type="text"
              value={nuevo.nombre}
              onChange={cambiarNuevo("nombre")} />
          </Campo>
          <Campo etiqueta="Celular">
            <input className="campo__control" type="tel" inputMode="numeric"
              value={nuevo.celular}
              onChange={cambiarNuevo("celular")} />
          </Campo>
          <Campo etiqueta="Usuario">
            <input className="campo__control" type="text"
              value={nuevo.usuario}
              onChange={cambiarNuevo("usuario")} />
          </Campo>
          <Campo etiqueta="Contraseña">
            <input className="campo__control" type="text"
              value={nuevo.contrasena}
              onChange={cambiarNuevo("contrasena")} />
          </Campo>
          <Campo etiqueta="Rol">
            <select className="campo__control" value={nuevo.rol} onChange={cambiarNuevo("rol")}>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </Campo>
          {nuevo.rol === "cliente" && (
            <fieldset className="admin__productos">
              <legend className="campo__etiqueta">Cuentas del cliente (elige 1, 2 o las 3)</legend>
              {PRODUCTOS.map((p) => (
                <label key={p.campo} className={`admin__casilla ${nuevo[p.campo] ? "admin__casilla--activa" : ""}`}>
                  <input
                    type="checkbox"
                    checked={nuevo[p.campo]}
                    onChange={(e) => setNuevo((d) => ({ ...d, [p.campo]: e.target.checked }))}
                  />
                  <span>{p.etiqueta}</span>
                </label>
              ))}
            </fieldset>
          )}
          <div className="admin__form-accion">
            <Boton type="submit">Crear usuario</Boton>
          </div>
        </form>
      </section>

      {/* ── Panel de edición ── */}
      {editandoId !== null && (
        <section className="panel" id="panel-edicion" aria-label="Editar cliente">
          <div className="panel__cabecera">
            <div>
              <p className="etiqueta">Edición · ID {editandoId}</p>
              <h2 className="mov-form__titulo">Editar cliente</h2>
            </div>
            <Boton variante="fantasma" onClick={() => setEditandoId(null)}>Cancelar</Boton>
          </div>

          <Alerta tipo={alertaEdicion?.tipo}>{alertaEdicion?.texto}</Alerta>

          <form className="admin__form" onSubmit={guardarEdicion} noValidate>
            <Campo etiqueta="Documento">
              <input className="campo__control" type="text"
                value={edicion.cedula}
                onChange={cambiarEdicion("cedula")} />
            </Campo>
            <Campo etiqueta="Nombre completo">
              <input className="campo__control" type="text"
                value={edicion.nombre}
                onChange={cambiarEdicion("nombre")} />
            </Campo>
            <Campo etiqueta="Celular">
              <input className="campo__control" type="tel"
                value={edicion.celular}
                onChange={cambiarEdicion("celular")} />
            </Campo>
            <Campo etiqueta="Usuario">
              <input className="campo__control" type="text"
                value={edicion.usuario}
                onChange={cambiarEdicion("usuario")} />
            </Campo>
            <Campo etiqueta="Contraseña">
              <input className="campo__control" type="text"
                value={edicion.contrasena}
                onChange={cambiarEdicion("contrasena")} />
            </Campo>
            <div className="admin__form-accion">
              <Boton type="submit">Guardar cambios</Boton>
            </div>
          </form>
        </section>
      )}

      {/* ── Listado de clientes (tarjetas: todo visible, sin desplazar) ── */}
      <section className="panel" aria-label="Clientes">
        <div className="panel__cabecera">
          <div>
            <p className="etiqueta">Clientes · <span id="total-clientes">{filtrados.length}</span> de {clientes.length}</p>
            <h2 className="mov-form__titulo">Administración</h2>
          </div>
        </div>

        <div className="admin__filtros">
          <Campo etiqueta="Buscar">
            <input
              className="campo__control"
              type="search"
              placeholder="Nombre, documento, usuario…"
              value={filtros.busqueda}
              onChange={filtrosSet("busqueda")}
            />
          </Campo>
          <Campo etiqueta="Estado">
            <select className="campo__control" value={filtros.estado} onChange={filtrosSet("estado")}>
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="bloqueados">Bloqueados</option>
            </select>
          </Campo>
          <Campo etiqueta="Producto">
            <select className="campo__control" value={filtros.producto} onChange={filtrosSet("producto")}>
              <option value="todos">Todos</option>
              <option value="CuentaAhorros">Ahorros</option>
              <option value="CuentaCorriente">Corriente</option>
              <option value="TarjetaCredito">Crédito</option>
            </select>
          </Campo>
          <Campo etiqueta="Ordenar por">
            <select className="campo__control" value={filtros.orden} onChange={filtrosSet("orden")}>
              <option value="registro">Más recientes</option>
              <option value="nombre">Nombre (A–Z)</option>
              <option value="saldo">Mayor saldo</option>
            </select>
          </Campo>
        </div>

        {hayFiltros && (
          <div className="admin__filtros-pie">
            <Boton variante="fantasma" onClick={() => setFiltros(FILTROS_INICIALES)}>
              Limpiar filtros
            </Boton>
          </div>
        )}

        {filtrados.length === 0 ? (
          <Vacio
            variante="busqueda"
            titulo="Sin coincidencias"
            texto="Ningún cliente cumple con los filtros activos. Ajusta la búsqueda o limpia los filtros para ver el listado completo."
          />
        ) : (
          <div className="admin__lista">
            {filtrados.map((cliente) => {
              const movimientos = contarMovimientos(cliente);
              const ultimosMov = cliente.cuentas
                .flatMap((c) => c.movimientos.map((m) => ({
                  tipo: m.tipo,
                  valor: m.valor,
                  fechaHora: m.fechaHora,
                  numero: c.numeroCuenta,
                })))
                .sort((a, b) => b.fechaHora - a.fechaHora)
                .slice(0, 2);

              return (
                <article
                  key={cliente.id}
                  className={`admin__tarjeta${cliente.bloqueado ? " admin__tarjeta--bloqueada" : ""}`}
                >
                  <header className="admin__tarjeta-cab">
                    <span className="admin__avatar" aria-hidden="true">
                      {cliente.nombreCompleto.charAt(0).toUpperCase()}
                    </span>
                    <div className="admin__tarjeta-titulo">
                      <strong className="admin__nombre">{cliente.nombreCompleto}</strong>
                      <span className="admin__sub">
                        ID {cliente.id}{cliente.esAdmin ? " · admin" : ""} · Doc. {cliente.identificacion}
                      </span>
                    </div>
                    <Badge tono={cliente.bloqueado ? "peligro" : "ok"} punto>
                      {cliente.bloqueado ? "Bloqueado" : "Activo"}
                    </Badge>
                  </header>

                  <dl className="admin__datos">
                    <div>
                      <dt>Usuario</dt>
                      <dd>
                        {cliente.usuario}
                        <span className="admin__sub">{cliente.usuario}@miplata.com</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Clave</dt>
                      <dd className="mono admin__clave">{cliente.contrasena}</dd>
                    </div>
                    <div>
                      <dt>Saldo</dt>
                      <dd className="mono admin__saldo">{fmt(saldoCliente(cliente))}</dd>
                    </div>
                    <div>
                      <dt>Registro</dt>
                      <dd className="mono">{fechaCorta(cliente.fechaRegistro)}</dd>
                    </div>
                    <div className="admin__datos-ancho">
                      <dt>Productos</dt>
                      <dd className="admin__productos">
                        {cliente.cuentas.length === 0
                          ? <span className="admin__sub">Sin productos</span>
                          : cliente.cuentas.map((c) => (
                              <Badge key={c.numeroCuenta}>
                                {nombreProducto(c)} · {c.numeroCuenta}
                              </Badge>
                            ))}
                      </dd>
                    </div>
                    <div className="admin__datos-ancho">
                      <dt>Movimientos · {movimientos}</dt>
                      <dd>
                        {ultimosMov.length === 0
                          ? <span className="admin__sub">Sin movimientos</span>
                          : ultimosMov.map((m, i) => (
                              <span key={i} className="admin__sub">
                                {m.tipo.replaceAll("_", " ")} · {fmt(m.valor)}
                              </span>
                            ))}
                      </dd>
                    </div>
                  </dl>

                  <footer className="admin__acciones">
                    <button type="button" className="boton boton--secundario"
                      onClick={() => accionCliente("editar", cliente)}>
                      <Icono nombre="editar" size={16} /> Editar
                    </button>
                    <button type="button" className="boton boton--secundario"
                      onClick={() => accionCliente(cliente.bloqueado ? "desbloquear" : "bloquear", cliente)}>
                      <Icono nombre="candado" size={16} />
                      {cliente.bloqueado ? "Desbloquear" : "Bloquear"}
                    </button>
                    <button type="button" className="boton boton--secundario"
                      onClick={() => accionCliente("reset", cliente)}>
                      Reset saldo
                    </button>
                    <button type="button" className="boton boton--secundario admin__accion-peligro"
                      onClick={() => accionCliente("eliminar", cliente)}>
                      <Icono nombre="cerrar" size={16} /> Eliminar
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Últimos registros ── */}
      <section aria-label="Últimos registros">
        <p className="etiqueta">Últimos registros</p>
        <div className="admin__chips">
          {ultimos.map((c) => (
            <Badge key={c.id}>
              {c.nombreCompleto} · {fechaCorta(c.fechaRegistro)}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── Confirmación de acciones sensibles ── */}
      <Modal
        abierto={Boolean(confirmacion)}
        alCerrar={() => setConfirmacion(null)}
        titulo={confirmacion ? CONFIRMAR[confirmacion.accion].titulo : ""}
        descripcion={confirmacion ? CONFIRMAR[confirmacion.accion].texto : ""}
        ancho="440px"
        pie={
          <>
            <Boton variante="fantasma" onClick={() => setConfirmacion(null)}>
              Cancelar
            </Boton>
            <Boton
              variante={confirmacion?.accion === "eliminar" ? "peligro" : "primario"}
              onClick={ejecutarConfirmacion}
            >
              {confirmacion ? CONFIRMAR[confirmacion.accion].ok : ""}
            </Boton>
          </>
        }
      >
        {confirmacion && (
          <div className="admin__confirmacion">
            <span className="admin__confirmacion-avatar" aria-hidden="true">
              {confirmacion.cliente.nombreCompleto.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="admin__confirmacion-nombre">
                {confirmacion.cliente.nombreCompleto}
              </p>
              <p className="admin__confirmacion-dato mono">
                @{confirmacion.cliente.usuario} · {confirmacion.cliente.cuentas.length} producto(s)
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
