import { useEffect, useState } from "react";
import { useBank } from "../../employees/hooks/useBank.js";
import { obtenerTransferencias } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import "./resumen.css";

function fechaLegible(valor) {
  const d = new Date(valor);
  return isNaN(d) ? "" : d.toLocaleString("es-CO");
}

/** Resumen de las transferencias enviadas y recibidas por el cliente, con su mensaje. */
export default function ResumenTransferencias({ usuarioID }) {
  const { version } = useBank();
  const [lista, setLista] = useState([]);
  const [error, setError] = useState(null);

  // Se vuelve a consultar cuando cambia la versión de los datos (tras una transferencia)
  useEffect(() => {
    let activo = true;
    obtenerTransferencias(usuarioID).then((r) => {
      if (!activo) return;
      if (r.ok) setLista(r.lista);
      else setError(r.error);
    });
    return () => { activo = false; };
  }, [usuarioID, version]);

  const enviado = lista.filter((t) => t.sentido === "ENVIADA").reduce((s, t) => s + Number(t.monto), 0);
  const recibido = lista.filter((t) => t.sentido === "RECIBIDA").reduce((s, t) => s + Number(t.monto), 0);

  return (
    <section className="resumen" aria-label="Resumen de transferencias">
      <h3 className="resumen__titulo">Resumen de transferencias</h3>
      <p className="mov-form__texto">
        Transferencias que enviaste y recibiste, con el mensaje que dejó quien envió.
      </p>

      {error && <Alerta tipo="error">{error}</Alerta>}

      <div className="resumen__kpis">
        <div><span>Enviado</span><strong>{fmt(enviado)}</strong></div>
        <div><span>Recibido</span><strong>{fmt(recibido)}</strong></div>
        <div><span>Operaciones</span><strong>{lista.length}</strong></div>
      </div>

      {lista.length === 0 ? (
        <Vacio
          variante="busqueda"
          titulo="Sin transferencias"
          texto="Cuando envíes o recibas una transferencia, aparecerá aquí con su mensaje."
        />
      ) : (
        <ul className="resumen__lista">
          {lista.map((t) => (
            <li key={t.transferenciaid} className={`resumen__item resumen__item--${t.sentido.toLowerCase()}`}>
              <div className="resumen__cabecera">
                <span className="resumen__sentido">{t.sentido === "ENVIADA" ? "Enviaste" : "Recibiste"}</span>
                <strong className="resumen__monto">{fmt(t.monto)}</strong>
              </div>
              <p className="resumen__persona">
                {t.sentido === "ENVIADA"
                  ? `Para ${t.nombredestino} · ${t.cuentadestino}`
                  : `De ${t.nombreorigen} · ${t.cuentaorigen}`}
              </p>
              {t.mensaje && <p className="resumen__mensaje">“{t.mensaje}”</p>}
              <span className="resumen__fecha">{fechaLegible(t.fecha)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
