import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { comprar, resumenCompra, esTarjeta } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { soloMonto, soloTexto, LIMITES } from "../../core/utils/validacion.js";
import { obtenerCategorias } from "../../employees/services/banco.js";
import CuentaSelector from "./CuentaSelector.jsx";
import InfoDisponible from "./InfoDisponible.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import "./movimientos.css";

const CUOTAS = [1, 2, 3, 6, 12, 24, 36];

function Desglose({ monto, resumen }) {
  return (
    <div className="mov-form__resumen">
      <p className="desglose-titulo">Resumen de la compra</p>
      <div className="desglose-fila"><span>Compra</span><strong>{fmt(monto)}</strong></div>
      <div className="desglose-fila"><span>Cuota de manejo</span><strong>{fmt(resumen.cuotaManejo)}</strong></div>
      <div className="desglose-fila total"><span>Total deuda inicial</span><strong>{fmt(resumen.totalDeudaInicial)}</strong></div>
      <div className="desglose-fila"><span>Intereses estimados</span><strong>{fmt(resumen.intereses)}</strong></div>
      <div className="desglose-fila proyectado"><span>Total proyectado</span><strong>{fmt(resumen.totalProyectado)}</strong></div>
    </div>
  );
}

export default function Comprar() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  const cuentas = (cliente?.cuentas || []).filter((c) => esTarjeta(c));

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState(3);
  const [comercio, setComercio] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaID, setCategoriaID] = useState("");
  const [alerta, setAlerta] = useState(null);

  const tc = cuentas.find((c) => c.numeroCuenta === numero);
  const montoNum = parseFloat(monto) || 0;

  // Vista previa de la cuota (useMemo: solo cambia al editar monto/cuotas)
  const previa = useMemo(
    () => (tc && montoNum > 0 ? resumenCompra(tc, montoNum, cuotas) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tc, montoNum, cuotas]
  );

  // Carga el catálogo de categorías una sola vez (menú desplegable)
  useEffect(() => {
    obtenerCategorias().then((r) => {
      if (r.ok) setCategorias(r.lista);
      else setAlerta({ tipo: "error", texto: r.error });
    });
  }, []);

  async function enviar(e) {
    e.preventDefault();
    // Obligatorios según la base de datos: descripción, categoría, monto
    if (!monto || !comercio.trim() || !categoriaID) {
      setAlerta({ tipo: "error", texto: "Completa el monto, qué compraste y la categoría." });
      return;
    }
    const resultado = await comprar(clientes, tc, parseFloat(monto), cuotas, comercio.trim(), Number(categoriaID));
    if (resultado.ok) {
      recargar();
      setAlerta({ tipo: "ok", texto: "Compra registrada correctamente." });
      setMonto("");
      setComercio("");
      setCategoriaID("");
    } else {
      setAlerta({ tipo: "error", texto: resultado.error });
    }
  }

  if (cuentas.length === 0) {
    return (
      <Vacio
        variante="cuentas"
        titulo="Sin tarjetas de crédito"
        texto="No tienes tarjetas asociadas para comprar. Solicita al administrador que te asigne una."
      />
    );
  }

  return (
    <section className="mov-form" aria-label="Comprar con tarjeta">
      <form className="mov-form__panel" onSubmit={enviar} noValidate>
        <h2 className="mov-form__titulo">Comprar con TC</h2>
        <p className="mov-form__texto">
          1–2 cuotas: sin interés ni manejo. 3–6: 1,9% mensual + manejo $8.500. 7 o más: 2,3%
          mensual + manejo $15.000. El manejo se cobra al momento de la compra.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} soloTC etiqueta="Tarjeta" />

        <div className="campo__fila">
          <Campo etiqueta="Monto de la compra">
            <input
              className="campo__control"
              type="number"
              min="1"
              step="any"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(soloMonto(e.target.value))}
              placeholder="Ej: 300000"
            />
          </Campo>
          <Campo etiqueta="Cuotas">
            <select
              className="campo__control"
              value={cuotas}
              onChange={(e) => setCuotas(parseInt(e.target.value, 10))}
            >
              {CUOTAS.map((c) => (
                <option key={c} value={c}>{c} cuota{c > 1 ? "s" : ""}</option>
              ))}
            </select>
          </Campo>
        </div>

        <div className="campo__fila">
          <Campo etiqueta={`¿Qué compraste? (${comercio.length}/${LIMITES.comercio})`}>
            <input
              className="campo__control"
              type="text"
              maxLength={LIMITES.comercio}
              value={comercio}
              onChange={(e) => setComercio(soloTexto(e.target.value, LIMITES.comercio))}
              placeholder="Ej: Almacén Éxito - Zapatos"
            />
          </Campo>
          <Campo etiqueta="Categoría">
            <select
              className="campo__control"
              value={categoriaID}
              onChange={(e) => setCategoriaID(e.target.value)}
            >
              <option value="">Selecciona…</option>
              {categorias.map((c) => (
                <option key={c.categoriaID} value={c.categoriaID}>{c.nombreCategoria}</option>
              ))}
            </select>
          </Campo>
        </div>

        {previa && (
          <div className="cuota-preview" role="status">
            <span className="etiqueta">Cuota mensual estimada</span>
            <p className="cuota-preview__valor">{fmt(previa.cuota)} / mes</p>
            <p className="cuota-preview__extra">
              {previa.tasa === 0 ? (
                <>
                  Sin interés. Total debitado al cupo: <strong>{fmt(previa.totalDeudaInicial)}</strong>
                </>
              ) : (
                <>
                  Tasa {(previa.tasa * 100).toFixed(1)}% mensual · Total debitado al cupo:{" "}
                  <strong>{fmt(previa.totalDeudaInicial)}</strong>
                </>
              )}
            </p>
            <Desglose monto={montoNum} resumen={previa} />
          </div>
        )}

        <div style={{ marginTop: "var(--space-md)" }}>
          <Boton type="submit" ancho>
            Registrar compra
          </Boton>
        </div>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Tarjeta</p>
        <InfoDisponible cuenta={tc} />
        <p className="mov-form__texto">
          La cuota mensual se calcula con amortización francesa sobre el capital de la compra.
          El resultado final puede variar por redondeos.
        </p>
      </aside>
    </section>
  );
}
