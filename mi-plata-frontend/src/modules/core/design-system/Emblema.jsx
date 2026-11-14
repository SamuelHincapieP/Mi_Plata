/**
 * Emblema — motivo SVG de fondo.
 *
 * Sustituye al rosario de elipses porque un dibujo abstracto no
 * comunica nada. Hay dos variantes según la pantalla:
 *   · "tarjeta" → el inicio (landing), la promesa del banco.
 *   · "moneda"  → login y registro, donde se opera con dinero.
 *
 * El movimiento no lo define este componente: el contenedor ya le
 * aplica girar-lento (140s en el inicio, 160s en los formularios).
 */
const TAJADITOS = Array.from({ length: 24 }, (_, i) => i * 15);

export default function Emblema({ variante = "tarjeta", className = "" }) {
  return (
    <svg
      className={`emblema emblema--${variante} ${className}`}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <g className="emblema__linea" fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5">
        {variante === "moneda" ? (
          /* ── Moneda ── */
          <>
            {/* Borde dentado */}
            {TAJADITOS.map((a) => (
              <path key={a} d="M200 122v13" transform={`rotate(${a} 200 200)`} />
            ))}
            <circle cx="200" cy="200" r="78" />
            <circle cx="200" cy="200" r="64" />
          </>
        ) : (
          /* ── Tarjeta de crédito ── */
          <>
            <rect x="82" y="125" width="236" height="150" rx="18" />
            {/* Banda magnética */}
            <path d="M82 163h236" />
            {/* Chip */}
            <rect x="106" y="189" width="42" height="32" rx="6" />
            <path d="M106 205h42M120 189v32M134 189v32" />
            {/* Número enmascarado */}
            <rect x="106" y="240" width="64" height="8" rx="4" />
            <rect x="180" y="240" width="40" height="8" rx="4" />
          </>
        )}
      </g>

      {variante === "moneda" && (
        <text x="200" y="200" dy="0.34em" textAnchor="middle" className="emblema__signo">
          $
        </text>
      )}
    </svg>
  );
}