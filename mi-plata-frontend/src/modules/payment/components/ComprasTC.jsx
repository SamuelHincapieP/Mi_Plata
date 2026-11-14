import { useEffect, useState } from "react";
import { useBank } from "../../employees/hooks/useBank.js";
import { obtenerComprasTC } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import "./resumen.css";

function fechaLegible(valor) {
  const d = new Date(valor);
  return isNaN(d) ? "" : d.toLocaleString("es-CO");
}

/** Lo que se ha comprado con la tarjeta: qué fue, en qué categoría y en cuántas cuotas. */
export default function ComprasTC({ numeroCuenta }) {
  const { version } = useBank();
  const [lista, setLista] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerComprasTC(numeroCuenta).then((r) => {
      if (!activo) return;
      if (r.ok) setLista(r.lista);
      else setError(r.error);
    });
    return () => { activo = false; };
  }, [numeroCuenta, version]);

  return (
    <section className="resumen" aria-label="Compras con la tarjeta">
      <h3 className="resumen__titulo">Lo que has comprado con esta tarjeta</h3>

      {error && <Alerta tipo="error">{error}</Alerta>}

      {lista.length === 0 ? (
        <Vacio
          variante="busqueda"
          titulo="Sin compras registradas"
          texto="Cada compra que hagas con esta tarjeta aparecerá aquí con su categoría y sus cuotas."
        />
      ) : (
        <ul className="resumen__lista">
          {lista.map((c) => (
            <li key={c.codcompra} className="resumen__item">
              <div className="resumen__cabecera">
                <strong>{c.comercio}</strong>
                <strong className="resumen__monto">{fmt(c.monto)}</strong>
              </div>
              <p className="resumen__persona">
                {c.categoria} · {c.cuotas} cuota{c.cuotas > 1 ? "s" : ""} de {fmt(c.cuotamensual)}
              </p>
              <span className="resumen__fecha">{fechaLegible(c.fecha)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
