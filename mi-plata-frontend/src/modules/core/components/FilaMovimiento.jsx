import { fmt } from "../utils/moneda.js";
import { fechaHora } from "../utils/fechas.js";
import Icono from "../design-system/Icono.jsx";
import { esSalida, iconoDeTipo, etiquetaTipo } from "../utils/tiposMovimiento.js";
import "./FilaMovimiento.css";

/** Una fila del historial estilo libro contable (firma #5). */
export default function FilaMovimiento({ movimiento, cuentaNumero, compacto = false }) {
  const salida = esSalida(movimiento.tipo);
  const icono = iconoDeTipo(movimiento.tipo);

  return (
    <li className={`mov-fila ${compacto ? "mov-fila--compacto" : ""}`}>
      <span className={`mov-fila__icono ${salida ? "es-salida" : "es-entrada"}`}>
        <Icono nombre={icono} size={18} />
      </span>

      <span className="mov-fila__info">
        <span className="mov-fila__tipo etiqueta">{etiquetaTipo(movimiento.tipo)}</span>
        {movimiento.descripcion && <span className="mov-fila__cuenta">{movimiento.descripcion}</span>}
        <span className="mov-fila__fecha">{fechaHora(movimiento.fechaHora)}</span>
        {cuentaNumero && <span className="mov-fila__cuenta">{cuentaNumero}</span>}
      </span>

      <span className="mov-fila__montos">
        <span className={`mov-fila__valor ${salida ? "es-salida" : "es-entrada"}`}>
          {salida ? "−" : "+"}{fmt(movimiento.valor)}
        </span>
        <span className="mov-fila__saldo">
          Saldo: {fmt(movimiento.saldoPosterior)}
        </span>
      </span>
    </li>
  );
}
