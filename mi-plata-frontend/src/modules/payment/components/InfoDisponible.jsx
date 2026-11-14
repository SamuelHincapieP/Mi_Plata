import { esTarjeta, obtenerDisponible, tipoCuenta } from "../../employees/services/banco.js";
import { fmt, fmtExacto } from "../../core/utils/moneda.js";

/** Caja informativa con el saldo/disponible de la cuenta elegida. */
export default function InfoDisponible({ cuenta }) {
  if (!cuenta) return null;

  let contenido;

  if (esTarjeta(cuenta)) {
    const deudaColor = cuenta.deuda > 0 ? "var(--danger)" : "var(--positive)";
    contenido = (
      <>
        <span>Cupo total: <strong>{fmt(cuenta.cupo)}</strong></span>
        <span>Disponible: <strong>{fmt(cuenta.cupoDisponible)}</strong></span>
        <span>
          Deuda: <strong style={{ color: deudaColor }}>{fmtExacto(cuenta.deuda)}</strong>
        </span>
      </>
    );
  } else if (tipoCuenta(cuenta) === "CuentaCorriente") {
    contenido = (
      <>
        <span>Saldo: <strong>{fmt(cuenta.saldo)}</strong></span>
        <span>
          Con sobregiro: <strong>{fmt(obtenerDisponible(cuenta))}</strong>
        </span>
        <span>Zona de crédito 5%</span>
      </>
    );
  } else {
    contenido = (
      <>
        <span>Saldo disponible: <strong>{fmt(cuenta.saldo)}</strong></span>
        <span>Interés al retirar 2%</span>
      </>
    );
  }

  return (
    <div className="info-disponible" role="status">
      <span className="etiqueta">Disponible</span>
      <div className="info-disponible__fila">{contenido}</div>
    </div>
  );
}
