import { fmt } from "../../core/utils/moneda.js";
import Icono from "../../core/design-system/Icono.jsx";
import Badge from "../../core/design-system/Badge.jsx";
import "./Productos.css";

/** Máximo histórico de saldo para la barra de ahorros (dato, no regla). */
function maxHistorico(cuenta) {
  const saldos = cuenta.movimientos.map((m) => m.saldoPosterior);
  if (saldos.length === 0) return null;
  return Math.max(cuenta.saldo, ...saldos);
}

/* ── Ahorros: barra segmentada hacia el máximo histórico ── */
export function AhorrosCard({ cuenta, seleccionada, onSelect }) {
  const max = maxHistorico(cuenta);
  const progreso = max ? Math.min((cuenta.saldo / max) * 100, 100) : 0;

  return (
    <button
      type="button"
      className={`producto producto--ahorros ${seleccionada ? "producto--activa" : ""}`}
      onClick={onSelect}
      aria-pressed={seleccionada}
    >
      <span className="producto__linea" />
      <span className="producto__top">
        <span className="producto__icono"><Icono nombre="ahorros" size={20} /></span>
        <Badge tono="ok" punto>Activa</Badge>
      </span>
      <span className="producto__nombre">Cuenta de ahorros</span>
      <span className="producto__valor">{fmt(cuenta.saldo)}</span>

      <span className="producto__barra" aria-hidden="true">
        <span className="producto__barra-relleno" style={{ width: `${progreso}%` }} />
      </span>
      <span className="producto__detalle">
        {max ? <>Máximo histórico: <strong>{fmt(max)}</strong></> : "Sin movimientos todavía"}
      </span>
      <span className="producto__pie">Interés al retirar 2% · sin sobregiro</span>
    </button>
  );
}

/* ── Corriente: medidor con zona de sobregiro ───────────── */
export function CorrienteCard({ cuenta, seleccionada, onSelect }) {
  const sobregiro = cuenta.calcularLimiteSobregiro();
  const disponible = cuenta.saldo + sobregiro;
  const posicion = disponible > 0 ? Math.min(Math.max((cuenta.saldo / disponible) * 100, 0), 100) : 0;
  const enSobregiro = cuenta.saldo < 0;

  return (
    <button
      type="button"
      className={`producto producto--corriente ${seleccionada ? "producto--activa" : ""} ${enSobregiro ? "producto--alerta" : ""}`}
      onClick={onSelect}
      aria-pressed={seleccionada}
    >
      <span className="producto__linea" />
      <span className="producto__top">
        <span className="producto__icono"><Icono nombre="corriente" size={20} /></span>
        <Badge tono="ok" punto>Activa</Badge>
      </span>
      <span className="producto__nombre">Cuenta corriente</span>
      <span className="producto__valor">{fmt(cuenta.saldo)}</span>

      <span className="producto__medidor" aria-hidden="true">
        <span className="producto__medidor-zona" />
        <span className="producto__medidor-marca" style={{ left: `${posicion}%` }} />
      </span>
      <span className="producto__detalle">
        Disponible: <strong>{fmt(disponible)}</strong> · sobregiro {fmt(sobregiro)}
      </span>
      <span className="producto__pie">Sobregiro del 5% del saldo · sin tasa</span>
    </button>
  );
}

/* ── Tarjeta: anillo de utilización ─────────────────────── */
export function TarjetaCard({ cuenta, seleccionada, onSelect }) {
  const utilizacion = cuenta.cupo > 0 ? (cuenta.deuda / cuenta.cupo) * 100 : 0;
  const radio = 34;
  const circunferencia = 2 * Math.PI * radio;
  const avance = circunferencia * Math.min(utilizacion, 100) / 100;

  return (
    <button
      type="button"
      className={`producto producto--tarjeta ${seleccionada ? "producto--activa" : ""}`}
      onClick={onSelect}
      aria-pressed={seleccionada}
    >
      <span className="producto__linea" />
      <span className="producto__top">
        <span className="producto__icono"><Icono nombre="tarjeta" size={20} /></span>
        <Badge>Cupo {fmt(cuenta.cupo)}</Badge>
      </span>
      <span className="producto__nombre">Tarjeta de crédito</span>

      <span className="producto__anillo-fila">
        <svg width="88" height="88" viewBox="0 0 88 88" role="img"
          aria-label={`Utilización ${utilizacion.toFixed(0)}% del cupo`}>
          <circle cx="44" cy="44" r={radio} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={radio} fill="none"
            stroke={utilizacion > 80 ? "var(--warning)" : "var(--accent)"}
            strokeWidth="8" strokeLinecap="butt"
            strokeDasharray={`${avance} ${circunferencia - avance}`}
            transform="rotate(-90 44 44)"
          />
          <text x="44" y="48" textAnchor="middle" className="producto__anillo-texto">
            {utilizacion.toFixed(0)}%
          </text>
        </svg>

        <span className="producto__anillo-datos">
          <span>Deuda <strong>{fmt(cuenta.deuda)}</strong></span>
          <span>Disponible <strong>{fmt(cuenta.cupoDisponible)}</strong></span>
        </span>
      </span>

      <span className="producto__pie">Tasa 0% · 1,9% · 2,3% según cuotas</span>
    </button>
  );
}
