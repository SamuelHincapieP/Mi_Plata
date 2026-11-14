import Esqueleto from "./Esqueleto.jsx";

/**
 * Pantalla de carga. Con forma="app" dibuja un esqueleto con la silueta
 * exacta del layout que viene (banner de saldo + tarjetas + asientos), de
 * modo que al cargar el contenido real nada salta de sitio
 * (Emil Kowalski: Layout Shift Zero).
 */
export default function Cargando({ texto = "Cargando…", forma = "app" }) {
  if (forma === "texto") {
    return (
      <div className="pantalla-carga" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        {texto}
      </div>
    );
  }

  return (
    <div className="carga-app">
      <span className="solo-lectura">{texto}</span>

      <div className="carga-app__banner">
        <span className="esqueleto esq-chip esq-chip--corta" />
        <span className="esqueleto esq-saldo" />
        <span className="esqueleto esqueleto--texto" style={{ width: "38%" }} />
      </div>

      <Esqueleto kind="tarjetas" cantidad={3} />

      <Esqueleto kind="filas" cantidad={4} texto={texto} />
    </div>
  );
}