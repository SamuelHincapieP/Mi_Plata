import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import {
  esTarjeta,
  obtenerBolsillos,
  crearBolsillo,
  eliminarBolsillo,
  depositarBolsillo,
  retirarBolsillo,
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

/**
 * Bolsillos (como en Nequi): apartados de dinero dentro de una cuenta.
 * El dinero sale del saldo de la cuenta y queda guardado aparte, sin mezclarse con lo que gastas.
 */
export default function Bolsillos() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  // Las tarjetas de crédito no tienen bolsillos
  const cuentas = (cliente?.cuentas || []).filter((c) => !esTarjeta(c));

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const [bolsillos, setBolsillos] = useState([]);
  const [recarga, setRecarga] = useState(0);
  const [nombre, setNombre] = useState("");
  const [montos, setMontos] = useState({});
  const [alerta, setAlerta] = useState(null);

  const cuenta = cuentas.find((c) => c.numeroCuenta === numero);
  const totalGuardado = bolsillos.reduce((t, b) => t + Number(b.saldo || 0), 0);

  useEffect(() => {
    if (!numero) return;
    let activo = true;
    obtenerBolsillos(numero).then((r) => {
      if (!activo) return;
      if (r.ok) setBolsillos(r.lista);
      else setAlerta({ tipo: "error", texto: r.error });
    });
    return () => { activo = false; };
  }, [numero, recarga]);

  async function crear(e) {
    e.preventDefault();
    if (!nombre.trim()) {
      setAlerta({ tipo: "error", texto: "Escribe un nombre para el bolsillo." });
      return;
    }
    const r = await crearBolsillo(numero, nombre.trim());
    if (r.ok) {
      setAlerta({ tipo: "ok", texto: `Bolsillo "${nombre.trim()}" creado.` });
      setNombre("");
      setRecarga((x) => x + 1);
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  // accion: "guardar" (cuenta → bolsillo) o "sacar" (bolsillo → cuenta)
  async function mover(accion, b) {
    const valor = parseFloat(montos[b.bolsilloID]);
    if (!valor || valor <= 0) {
      setAlerta({ tipo: "error", texto: `Escribe cuánto quieres ${accion} en "${b.nombreBolsillo}".` });
      return;
    }
    const operar = accion === "guardar" ? depositarBolsillo : retirarBolsillo;
    const r = await operar(clientes, cuenta, b.bolsilloID, valor);
    if (r.ok) {
      recargar();
      setRecarga((x) => x + 1);
      setMontos((m) => ({ ...m, [b.bolsilloID]: "" }));
      setAlerta({
        tipo: "ok",
        texto: accion === "guardar"
          ? `Guardaste ${fmt(valor)} en "${b.nombreBolsillo}".`
          : `Sacaste ${fmt(valor)} de "${b.nombreBolsillo}" a tu cuenta.`,
      });
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  async function borrar(b) {
    const r = await eliminarBolsillo(b.bolsilloID);
    if (r.ok) {
      setAlerta({ tipo: "ok", texto: `Bolsillo "${b.nombreBolsillo}" eliminado.` });
      setRecarga((x) => x + 1);
    } else {
      setAlerta({ tipo: "error", texto: r.error });
    }
  }

  if (cuentas.length === 0) {
    return (
      <Vacio
        variante="cuentas"
        titulo="Sin cuentas para crear bolsillos"
        texto="Los bolsillos se crean sobre una cuenta de ahorros o corriente. Pide al administrador que te asigne una."
      />
    );
  }

  return (
    <section className="mov-form" aria-label="Bolsillos">
      <form className="mov-form__panel" onSubmit={crear} noValidate>
        <h2 className="mov-form__titulo">Bolsillos</h2>
        <p className="mov-form__texto">
          Aparta dinero para algo en particular (el mercado, un regalo, el arriendo). Lo que guardas
          en un bolsillo sale de tu saldo y queda separado hasta que lo saques. Mover plata entre tu
          cuenta y tus bolsillos no es una transacción: no aparece en el historial.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} />
        <p className="mov-form__texto">
          Disponible en la cuenta: <strong>{fmt(cuenta?.saldo ?? 0)}</strong>
        </p>

        <Campo etiqueta={`Nombre del bolsillo (${nombre.length}/${LIMITES.bolsilloNombre})`}>
          <input
            className="campo__control"
            type="text"
            maxLength={LIMITES.bolsilloNombre}
            value={nombre}
            onChange={(e) => setNombre(soloTexto(e.target.value, LIMITES.bolsilloNombre))}
            placeholder="Ej: Mercado del mes"
          />
        </Campo>

        <Boton type="submit" ancho>Crear bolsillo</Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Tus bolsillos</p>
        <p className="mov-form__texto">
          Guardado en total: <strong>{fmt(totalGuardado)}</strong>
        </p>

        {bolsillos.length === 0 ? (
          <Vacio variante="busqueda" titulo="Sin bolsillos" texto="Crea tu primer bolsillo para apartar dinero." />
        ) : (
          <ul className="resumen__lista">
            {bolsillos.map((b) => (
              <li key={b.bolsilloID} className="resumen__item">
                <div className="resumen__cabecera">
                  <strong>{b.nombreBolsillo}</strong>
                  <span className="resumen__monto">{fmt(b.saldo)}</span>
                </div>
                <div className="apartado__acciones">
                  <input
                    className="campo__control"
                    type="number"
                    min="1"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Monto para ${b.nombreBolsillo}`}
                    placeholder="¿Cuánto?"
                    value={montos[b.bolsilloID] ?? ""}
                    onChange={(e) => setMontos((x) => ({ ...x, [b.bolsilloID]: soloMonto(e.target.value) }))}
                  />
                  <Boton type="button" onClick={() => mover("guardar", b)}>Guardar</Boton>
                  <Boton type="button" variante="secundario" onClick={() => mover("sacar", b)}>Sacar</Boton>
                  <Boton type="button" variante="fantasma" onClick={() => borrar(b)}>Eliminar</Boton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
}
