import { useMemo, useState } from "react";
import { fmt } from "../../core/utils/moneda.js";
import { fechaCorta } from "../../core/utils/fechas.js";
import { etiquetaTipo } from "../../core/utils/tiposMovimiento.js";
import { apartadoEntre } from "../../core/utils/pulso.js";
import Badge from "../../core/design-system/Badge.jsx";
import "./FinancialPulse.css";

const ANCHO = 600;
const ALTO = 170;

/**
 * Financial Pulse — línea SVG propia del saldo DISPONIBLE (firma #3).
 * Puntos por movimiento, tooltip al hover/focus y trazo animado.
 *
 * Mover dinero a un bolsillo o a una meta no es un movimiento, pero baja el disponible. Para que la
 * línea no parezca "perder plata", cuando eso pasa entre dos puntos se avisa en el tooltip, y debajo
 * se muestra el desglose: disponible + bolsillos + metas = total.
 *
 * Props (solo cuentas de ahorros o corriente; en la tarjeta no hay bolsillos ni metas):
 *  - apartados:   true para activar el aviso de dinero apartado y el desglose
 *  - tasaRetiro:  interés de retiro de la cuenta de ahorros (para cuadrar los retiros)
 *  - disponible, enBolsillos, enMetas: montos actuales para el desglose
 */
export default function FinancialPulse({
  movimientos,
  apartados = false,
  tasaRetiro = 0,
  disponible = 0,
  enBolsillos = 0,
  enMetas = 0,
}) {
  const [hover, setHover] = useState(null);

  // Serie: saldo posterior de los últimos 14 movimientos, en orden cronológico
  const serie = useMemo(() => {
    const lista = [...movimientos].slice(-14);
    return lista.map((m) => ({ fecha: m.fechaHora, saldo: m.saldoPosterior, tipo: m.tipo, valor: m.valor }));
  }, [movimientos]);

  const { linea, area, puntos } = useMemo(() => {
    if (serie.length === 0) return { linea: "", area: "", puntos: [] };
    const valores = serie.map((s) => s.saldo);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const rango = max - min || 1;

    const puntos = serie.map((s, i) => ({
      x: serie.length === 1 ? ANCHO / 2 : (i / (serie.length - 1)) * (ANCHO - 24) + 12,
      y: ALTO - 18 - ((s.saldo - min) / rango) * (ALTO - 44),
      // dinero movido a bolsillos/metas entre el punto anterior y este (0 si no aplica)
      apartado: apartados && i > 0 ? apartadoEntre(serie[i - 1], s, tasaRetiro) : 0,
      ...s,
    }));

    const linea = puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${linea} L${puntos[puntos.length - 1].x.toFixed(1)},${ALTO} L${puntos[0].x.toFixed(1)},${ALTO} Z`;
    return { linea, area, puntos };
  }, [serie, apartados, tasaRetiro]);

  const hayApartado = puntos.some((p) => p.apartado !== 0);
  const enApartados = enBolsillos + enMetas;

  if (serie.length === 0) {
    return (
      <div className="pulse pulse--vacio">
        <p className="etiqueta">Financial Pulse</p>
        <svg
          className="pulse__vacio-arte"
          viewBox="0 0 120 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          {/* Trazo plano: la serie todavía no tiene recorrido */}
          <path d="M4 30h112" strokeDasharray="4 5" opacity="0.45" />
          <path d="M8 32 26 26l14 5 18-14 16 7 14-12 24 9" opacity="0.9" />
        </svg>
        <p>Sin movimientos suficientes para dibujar la tendencia.</p>
      </div>
    );
  }

  return (
    <div className="pulse">
      <div className="panel__cabecera">
        <div>
          <p className="etiqueta">Financial Pulse</p>
          <p className="pulse__subtitulo">Tendencia del saldo disponible · últimos movimientos</p>
        </div>
        <Badge tono="acento" punto>{serie.length} puntos</Badge>
      </div>

      <div className="pulse__lienzo">
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="pulse__svg" role="img"
          aria-label={`Gráfica de saldo: de ${fmt(serie[0].saldo)} a ${fmt(serie[serie.length - 1].saldo)}`}>
          <defs>
            <linearGradient id="pulso-relleno" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Guías horizontales tenues */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" y1={ALTO * f} x2={ANCHO} y2={ALTO * f}
              stroke="var(--line)" strokeWidth="1" />
          ))}

          <path d={area} fill="url(#pulso-relleno)" className="pulse__area" />
          <path d={linea} fill="none" stroke="var(--accent)" strokeWidth="2"
            vectorEffect="non-scaling-stroke" className="pulse__linea" />

          {puntos.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 4}
              fill="var(--bg)"
              stroke="var(--accent)"
              strokeWidth="2"
              tabIndex={0}
              role="button"
              aria-label={`${fechaCorta(p.fecha)}: ${fmt(p.saldo)}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            />
          ))}
        </svg>

        {hover !== null && puntos[hover] && (
          <span
            className="pulse__tooltip"
            style={{
              left: `${(puntos[hover].x / ANCHO) * 100}%`,
              top: `${(puntos[hover].y / ALTO) * 100}%`,
            }}
          >
            <strong>{fmt(puntos[hover].saldo)}</strong>
            <span>{fechaCorta(puntos[hover].fecha)} · {etiquetaTipo(puntos[hover].tipo)}</span>
            {puntos[hover].apartado !== 0 && (
              <span className="pulse__tooltip-aviso">
                {puntos[hover].apartado > 0 ? "Antes de este punto apartaste " : "Antes de este punto recuperaste "}
                {fmt(Math.abs(puntos[hover].apartado))} en bolsillos o metas
              </span>
            )}
          </span>
        )}
      </div>

      <div className="pulse__pies">
        <span>{fechaCorta(serie[0].fecha)} · {fmt(serie[0].saldo)}</span>
        <span>{fechaCorta(serie[serie.length - 1].fecha)} · {fmt(serie[serie.length - 1].saldo)}</span>
      </div>

      {hayApartado && (
        <p className="pulse__nota">
          La línea tiene saltos porque apartaste o recuperaste dinero de bolsillos y metas. No es un gasto:
          ese dinero sigue siendo tuyo, solo sale del disponible.
        </p>
      )}

      {apartados && enApartados > 0 && (
        <dl className="pulse__desglose" aria-label="Desglose de tu dinero">
          <div><dt>Disponible</dt><dd>{fmt(disponible)}</dd></div>
          <div><dt>En bolsillos</dt><dd>{fmt(enBolsillos)}</dd></div>
          <div><dt>En metas</dt><dd>{fmt(enMetas)}</dd></div>
          <div className="pulse__desglose-total"><dt>Total</dt><dd>{fmt(disponible + enApartados)}</dd></div>
        </dl>
      )}
    </div>
  );
}
