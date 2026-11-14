/**
 * Vacio — estado vacío del sistema. Ilustración SVG propia (estilo ledger:
 * un libro mayor abierto con asientos), nunca emoji ni imagen externa.
 * Todos los colores salen de tokens.css.
 */

const ILUSTRACIONES = {
  // Libro mayor abierto con renglones sin llenar
  movimientos: (
    <>
      <path d="M32 26c-5-4-13-6-20-5v34c7-1 15 1 20 5 5-4 13-6 20-5V21c-7-1-15 1-20 5Z" />
      <path d="M32 26v34" />
      <path d="M17 32h10M17 38h10M17 44h7" />
      <path d="M37 32h10M37 38h10M37 44h6" />
    </>
  ),
  // Caja deStrong vacía con halo
  cuentas: (
    <>
      <path d="M18 24h28v26a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V24Z" />
      <path d="M18 24 32 13l14 11" />
      <path d="M26 33h12M26 39h12M26 45h7" />
    </>
  ),
  // Lupa sobre una lista
  busqueda: (
    <>
      <circle cx="28" cy="28" r="12" />
      <path d="m37 37 9 9" />
      <path d="M22 28h12M22 33h7" />
    </>
  ),
  // Candado: seguridad / sesión
  seguridad: (
    <>
      <rect x="19" y="27" width="26" height="21" rx="3" />
      <path d="M25 27v-5a7 7 0 0 1 14 0v5" />
      <path d="M32 34v7" />
    </>
  ),
};

/**
 * @param variante  clave de la ilustración
 * @param titulo    frase principal
 * @param texto     explicación breve
 * @param accion    nodo opcional (botón para salir del estado vacío)
 */
export default function Vacio({
  variante = "movimientos",
  titulo = "Sin movimientos",
  texto = "Cuando registres operaciones aparecerán aquí, en orden de fecha.",
  accion = null,
  className = "",
}) {
  return (
    <div className={`vacio ${className}`} role="status">
      <svg
        className="vacio__arte"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {ILUSTRACIONES[variante] || ILUSTRACIONES.movimientos}
      </svg>
      <p className="vacio__titulo">{titulo}</p>
      {texto && <p className="vacio__texto">{texto}</p>}
      {accion && <div className="vacio__accion">{accion}</div>}
    </div>
  );
}