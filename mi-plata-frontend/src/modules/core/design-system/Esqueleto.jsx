/**
 * Esqueleto — primitivas de carga con las MISMAS proporciones del contenido
 * final, para evitar saltos de pantalla (Emil Kowalski: Layout Shift Zero).
 *
 * Cada forma tiene medidas fijas en tokens: al llegar el dato real el bloque
 * ocupa el mismo alto y el usuario no perceivedndo "saltos".
 */
export function Linea({ ancho = "100%", alto = "0.85em" }) {
  return (
    <span
      className="esqueleto esqueleto--texto"
      style={{ width: ancho, height: alto }}
      aria-hidden="true"
    />
  );
}

export function Titulo({ ancho = "45%" }) {
  return (
    <span className="esqueleto esqueleto--titulo" style={{ width: ancho }} aria-hidden="true" />
  );
}

/** Bloque con la misma altura que una tarjeta de producto. */
export function Tarjeta({ alto = "188px" }) {
  return (
    <div className="esq-tarjeta" style={{ minHeight: alto }} aria-hidden="true">
      <div className="esq-tarjeta__fila">
        <span className="esqueleto esq-chip" />
        <span className="esqueleto esq-chip esq-chip--corta" />
      </div>
      <span className="esqueleto esq-saldo" />
      <Linea ancho="70%" />
      <Linea ancho="45%" />
      <span className="esqueleto esq-barra">
        <span className="esqueleto esq-barra__relleno" />
      </span>
    </div>
  );
}

/** Fila del libro mayor: fecha, concepto y monto (como Historial). */
export function Fila() {
  return (
    <div className="esq-fila" aria-hidden="true">
      <span className="esqueleto esq-fila__punto" />
      <span className="esq-fila__centro">
        <Linea ancho="55%" />
        <Linea ancho="35%" alto="0.7em" />
      </span>
      <span className="esqueleto esq-fila__monto" />
    </div>
  );
}

/** Bloque genérico con cabecera y cuerpo, equivalente a un panel. */
export function Panel({ lineas = 3, alto = "auto" }) {
  return (
    <div className="esq-panel" style={{ minHeight: alto }} aria-hidden="true">
      <Titulo ancho="30%" />
      {Array.from({ length: lineas }, (_, i) => (
        <Linea key={i} ancho={i % 2 === 0 ? "100%" : "78%"} />
      ))}
    </div>
  );
}

/**
 * Envoltorio accesible: anuncia la carga sin ensuciar el árbol visual.
 * kind: "panel" | "tarjetas" | "filas" | "bloque"
 */
export default function Esqueleto({
  kind = "panel",
  lineas = 3,
  cantidad = 3,
  texto = "Cargando datos…",
  className = "",
}) {
  return (
    <div className={`esq ${className}`} role="status" aria-live="polite">
      <span className="solo-lectura">{texto}</span>
      {kind === "panel" && <Panel lineas={lineas} />}
      {kind === "bloque" && <Panel lineas={lineas} alto="220px" />}
      {kind === "tarjetas" &&
        Array.from({ length: cantidad }, (_, i) => <Tarjeta key={i} />)}
      {kind === "filas" &&
        Array.from({ length: cantidad }, (_, i) => <Fila key={i} />)}
    </div>
  );
}