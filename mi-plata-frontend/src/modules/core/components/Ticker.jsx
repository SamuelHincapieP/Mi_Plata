import { fmt } from "../utils/moneda.js";
import { fechaCorta } from "../utils/fechas.js";
import { esSalida, etiquetaTipo } from "../utils/tiposMovimiento.js";
import "./Ticker.css";

/**
 * Ticker fino de últimos movimientos.
 * Cinta en marquesina; se pausa al hover y se congela con reduced-motion.
 */
export default function Ticker({ movimientos }) {
  if (!movimientos || movimientos.length === 0) return null;

  const items = movimientos.map((mov, i) => ({
    id: i,
    texto: `${etiquetaTipo(mov.tipo)} · ${esSalida(mov.tipo) ? "−" : "+"}${fmt(mov.valor)}`,
    fecha: fechaCorta(mov.fechaHora),
    salida: esSalida(mov.tipo),
  }));

  return (
    <div className="ticker" role="marquee" aria-label="Últimos movimientos">
      <div className="ticker__pista">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="ticker__item">
            <span className={`ticker__tipo ${item.salida ? "es-salida" : ""}`}>
              {item.texto}
            </span>
            <span className="ticker__fecha">{item.fecha}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
