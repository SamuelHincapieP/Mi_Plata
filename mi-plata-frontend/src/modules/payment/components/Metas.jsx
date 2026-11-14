import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import {
  tipoCuenta,
  obtenerMetas,
  crearMeta,
  eliminarMeta,
  aportarMeta,
  retirarMeta,
  progresoMeta,
  faltaMeta,
} from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { soloMonto, soloTexto, LIMITES } from "../../core/utils/validacion.js";
import CuentaSelector from "./CuentaSelector.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import "./movimientos.css";
import "./resumen.css";

// Fecha de hoy en formato yyyy-mm-dd, según la hora local (mínimo del campo fecha)
function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Metas de ahorro. El cliente decide cuánto aporta a cada meta:
 * el dinero sale de su cuenta de ahorros y queda guardado en la meta
 * (el progreso cuenta solo lo aportado, no el saldo total de la cuenta).
 */
export default function Metas() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  const ahorros = (cliente?.cuentas || []).filter((c) => tipoCuenta(c) === "CuentaAhorros");

  const [numero, setNumero] = useState(ahorros[0]?.numeroCuenta || "");
  const [metas, setMetas] = useState([]);
  const [recarga, setRecarga] = useState(0);
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [montos, setMontos] = useState({});
  const [alerta, setAlerta] = useState(null);

  const cuenta = ahorros.find((c) => c.numeroCuenta === numero);

  useEffect(() => {
    if (!numero) return;
    let activo = true;
    obtenerMetas(numero).then((r) => {
      if (!activo) return;
      if (r.ok) setMetas(r.lista);
      else setAlerta({ tipo: "error", texto: r.error });
    });
    return () => { activo = false; };
  }, [numero, recarga]);

  async function crear(e) {
    e.preventDefault();
    if (!nombre.trim() || !objetivo || !fecha) {
      setAlerta({ tipo: "error", texto: "Completa el nombre, el monto objetivo y la fecha de la meta." });
      return;
    }
    if (fecha < hoyLocal()) {
      setAlerta({ tipo: "error", texto: "La fecha objetivo no puede ser anterior a hoy." });
      return;
    }
    const r = await crearMeta({
      numeroCuenta: numero,
      nombreMeta: nombre.trim(),
      montoObjetivo: parseFloat(objetivo),
      fechaObjetivo: fecha,
    });
    if (r.ok) {
      setAlerta({ tipo: "ok", texto: "Meta creada. Ahora decide cuánto quieres aportarle." });
      setNombre("");
      setObjetivo("");
      setFecha("");
      setRecarga((x) => x + 1);
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  // accion: "aportar" (cuenta → meta) o "retirar" (meta → cuenta)
  async function mover(accion, meta) {
    const valor = parseFloat(montos[meta.metaID]);
    if (!valor || valor <= 0) {
      setAlerta({ tipo: "error", texto: `Escribe cuánto quieres ${accion} en "${meta.nombreMeta}".` });
      return;
    }
    const operar = accion === "aportar" ? aportarMeta : retirarMeta;
    const r = await operar(clientes, cuenta, meta.metaID, valor);
    if (r.ok) {
      recargar(); // actualiza el saldo de la cuenta
      setRecarga((x) => x + 1); // vuelve a leer las metas
      setMontos((m) => ({ ...m, [meta.metaID]: "" }));
      setAlerta({
        tipo: "ok",
        texto: accion === "aportar"
          ? `Aportaste ${fmt(valor)} a "${meta.nombreMeta}".`
          : `Devolviste ${fmt(valor)} de "${meta.nombreMeta}" a tu cuenta.`,
      });
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  async function borrar(meta) {
    const r = await eliminarMeta(meta.metaID);
    if (r.ok) {
      setAlerta({ tipo: "ok", texto: `Meta "${meta.nombreMeta}" eliminada.` });
      setRecarga((x) => x + 1);
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  if (ahorros.length === 0) {
    return (
      <Vacio
        variante="cuentas"
        titulo="Sin cuentas de ahorros"
        texto="Las metas se crean sobre una cuenta de ahorros. Pide al administrador que te asigne una."
      />
    );
  }

  return (
    <section className="mov-form" aria-label="Metas de ahorro">
      <form className="mov-form__panel" onSubmit={crear} noValidate>
        <h2 className="mov-form__titulo">Metas de ahorro</h2>
        <p className="mov-form__texto">
          Crea una meta con su monto y su fecha límite. Tú decides cuánto aportas a cada una:
          el dinero sale de tu cuenta de ahorros y queda guardado en la meta. Aportar a una meta no
          es una transacción: no aparece en el historial.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={ahorros} valor={numero} onChange={setNumero} etiqueta="Cuenta de ahorros" />
        <p className="mov-form__texto">
          Disponible en la cuenta: <strong>{fmt(cuenta?.saldo ?? 0)}</strong>
        </p>

        <Campo etiqueta={`Nombre de la meta (${nombre.length}/${LIMITES.metaNombre})`}>
          <input
            className="campo__control"
            type="text"
            maxLength={LIMITES.metaNombre}
            value={nombre}
            onChange={(e) => setNombre(soloTexto(e.target.value, LIMITES.metaNombre))}
            placeholder="Ej: Viaje a Cartagena"
          />
        </Campo>

        <div className="campo__fila">
          <Campo etiqueta="Monto objetivo">
            <input
              className="campo__control"
              type="number"
              min="1"
              step="any"
              inputMode="decimal"
              value={objetivo}
              onChange={(e) => setObjetivo(soloMonto(e.target.value))}
              placeholder="Ej: 2000000"
            />
          </Campo>
          <Campo etiqueta="Fecha objetivo">
            <input
              className="campo__control"
              type="date"
              min={hoyLocal()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Campo>
        </div>

        <Boton type="submit" ancho>Crear meta</Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Tus metas</p>
        <p className="mov-form__texto">
          El dinero guardado en una meta no cuenta en el saldo disponible de la cuenta hasta que lo retires.
        </p>

        {metas.length === 0 ? (
          <Vacio variante="busqueda" titulo="Sin metas" texto="Crea tu primera meta de ahorro." />
        ) : (
          <ul className="resumen__lista">
            {metas.map((m) => (
              <li key={m.metaID} className="resumen__item">
                <div className="resumen__cabecera">
                  <strong>{m.nombreMeta}</strong>
                  <span className="resumen__monto">{fmt(m.montoAhorrado)} / {fmt(m.montoObjetivo)}</span>
                </div>
                <div
                  className="meta__barra"
                  role="progressbar"
                  aria-valuenow={progresoMeta(m)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso de ${m.nombreMeta}`}
                >
                  <div className="meta__relleno" style={{ width: `${progresoMeta(m)}%` }} />
                </div>
                <p className="resumen__persona">
                  {progresoMeta(m)}% · faltan {fmt(faltaMeta(m))} · fecha límite {m.fechaObjetivo}
                </p>

                <div className="apartado__acciones">
                  <input
                    className="campo__control"
                    type="number"
                    min="1"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Monto para ${m.nombreMeta}`}
                    placeholder="¿Cuánto?"
                    value={montos[m.metaID] ?? ""}
                    onChange={(e) => setMontos((x) => ({ ...x, [m.metaID]: soloMonto(e.target.value) }))}
                  />
                  <Boton type="button" onClick={() => mover("aportar", m)}>Aportar</Boton>
                  <Boton type="button" variante="secundario" onClick={() => mover("retirar", m)}>Retirar</Boton>
                  <Boton type="button" variante="fantasma" onClick={() => borrar(m)}>Eliminar</Boton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
}
