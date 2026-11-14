/**
 * Icono — set propio de iconos SVG (stroke, 24px, hereda currentColor).
 * Ningún emoji como icono.
 */
const TRAZOS = {
  casa: "M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M10 19v-5h4v5",
  movimientos: "M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5",
  perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
  admin: "M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3ZM9.5 12l1.8 1.8 3.5-3.6",
  salir: "M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8M17 8l4 4-4 4M21 12H10",
  ojo: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  "ojo-cerrado": "M3 3l18 18M10.6 10.7a2.6 2.6 0 0 0 3.5 3.6M6.5 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M9.9 5.8A8.6 8.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.8 3.6",
  descargar: "M12 4v10m0 0-4-4m4 4 4-4M5 19h14",
  candado: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z",
  escudo: "M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  cerrar: "M6 6l12 12M18 6 6 18",
  buscar: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5.5-1.5L21 21",
  mas: "M12 5v14M5 12h14",
  editar: "M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 6.5l3 3",
  ahorros: "M4 10.5C4 7 7.5 4.5 12 4.5s8 2.5 8 6c0 1.4-.8 2.7-2 3.6V18a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.7c-.8.2-1.7.3-2.5.3s-1.7-.1-2.5-.3V18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3.9c-1.2-.9-2-2.2-2-3.6Zm5-1.2h.01M15.5 9.5a5 5 0 0 1-4.7 2",
  corriente: "M4 20h16M6 20V9m4 11V9m4 11V9m4 11V9M3.5 9 12 4l8.5 5",
  tarjeta: "M3.5 7h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm-1 4h19M6 14.5h3",
  historial: "M12 7v5l3.5 2M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 4v4h-4",
  transferencia: "M7 7h10m0 0-3-3m3 3-3 3M17 17H7m0 0 3-3m-3 3 3 3",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13h.01M11 12h1v5h1",
  alerta: "M12 4 3 20h18L12 4Zm0 6v4m0 3h.01",
  recargar: "M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4",
  entrada: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14",
  salida: "M12 20V9m0 0L7.5 13.5M12 9l4.5 4.5M5 4h14",
  compra: "M4 4h7l9 9-7 7-9-9V4Zm4 4h.01",
  recibo: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6",
  reportes: "M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6",
  chevron: "m9 6 6 6-6 6",
};

export default function Icono({ nombre, size = 20, className = "", ...props }) {
  const trazo = TRAZOS[nombre];
  if (!trazo) return null;
  return (
    <svg
      className={`icono ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={trazo} />
    </svg>
  );
}
