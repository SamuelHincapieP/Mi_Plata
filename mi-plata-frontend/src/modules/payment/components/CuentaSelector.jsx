import Campo from "../../core/design-system/Campo.jsx";
import { esTarjeta, nombreTipo } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";

function textoOpcion(cuenta) {
  if (esTarjeta(cuenta)) {
    return `TC — ${cuenta.numeroCuenta} | Disp: ${fmt(cuenta.cupoDisponible)} | Deuda: ${fmt(cuenta.deuda)}`;
  }
  return `${nombreTipo(cuenta)} — ${cuenta.numeroCuenta}`;
}

/**
 * Selector de cuentas del cliente activo.
 * El valor es el número de cuenta (estable aunque cambien los índices).
 */
export default function CuentaSelector({
  cuentas,
  valor,
  onChange,
  soloTC = false,
  etiqueta = "Cuenta",
}) {
  const lista = soloTC ? cuentas.filter((c) => esTarjeta(c)) : cuentas;

  return (
    <Campo etiqueta={etiqueta}>
      <select
        className="campo__control"
        value={valor || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {lista.length === 0 && <option value="">Sin cuentas disponibles</option>}
        {lista.map((c) => (
          <option key={c.numeroCuenta} value={c.numeroCuenta}>
            {textoOpcion(c)}
          </option>
        ))}
      </select>
    </Campo>
  );
}
