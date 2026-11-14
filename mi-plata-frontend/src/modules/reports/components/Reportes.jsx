import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { pedirReporte } from "../services/reportes.js";
import Boton from "../../core/design-system/Boton.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Cargando from "../../core/design-system/Cargando.jsx";
import "./reportes.css";

export default function Reportes() {
  const { cliente, esAdmin } = useAuth();
  const { clientes } = useBank();
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setReporte(await pedirReporte({ esAdmin, clientes, cliente }));
    } catch {
      setError("No se pudo generar el reporte. Verifica que el servidor de Python esté corriendo (python servidor.py).");
    } finally {
      setCargando(false);
    }
  }, [esAdmin, clientes, cliente]);

  // Se genera al entrar a la pestaña.
  useEffect(() => {
    generar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="reportes" aria-label="Reportes">
      <div className="reportes__cabecera">
        <h1>{reporte?.titulo || "Reportes"}</h1>
        <Boton variante="secundario" onClick={generar} disabled={cargando}>
          <Icono nombre="recargar" size={16} />
          {cargando ? "Generando…" : "Generar / actualizar"}
        </Boton>
      </div>

      {error && <Alerta tipo="error">{error}</Alerta>}
      {cargando && !reporte && <Cargando texto="Generando reporte…" />}

      {reporte && (
        <>
          <div className="reportes__kpis">
            {reporte.kpis.map((k) => (
              <div className="reportes__kpi" key={k.etiqueta}>
                <span>{k.etiqueta}</span>
                <strong>{k.valor}</strong>
                {k.detalle && <small>{k.detalle}</small>}
              </div>
            ))}
          </div>

          {reporte.graficos.length > 0 && (
            <div className="reportes__graficos">
              {reporte.graficos.map((g) => (
                <figure
                  className={`reportes__tarjeta${g.ancha ? " reportes__tarjeta--ancha" : ""}`}
                  key={g.titulo}
                >
                  <img src={`data:image/png;base64,${g.imagen}`} alt={g.titulo} />
                </figure>
              ))}
            </div>
          )}

          {reporte.tablas.map((t) => (
            <div className="reportes__tarjeta" key={t.titulo}>
              <h2>{t.titulo}</h2>
              <div className="reportes__tabla" dangerouslySetInnerHTML={{ __html: t.html }} />
            </div>
          ))}

          <p className="reportes__conclusion">
            <Icono nombre="info" size={18} /> {reporte.conclusion}
          </p>
          <small className="reportes__conclusion">Fuente: {reporte.fuente}</small>
        </>
      )}
    </section>
  );
}
