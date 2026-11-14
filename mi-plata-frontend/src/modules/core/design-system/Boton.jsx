/** Botón con variantes del sistema (primario/secundario/peligro/fantasma). */
export default function Boton({
  variante = "primario",
  ancho = false,
  cargando = false,
  children,
  className = "",
  ...props
}) {
  const clases = [
    "boton",
    `boton--${variante}`,
    ancho ? "boton--ancho" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={clases} disabled={cargando || props.disabled} {...props}>
      {cargando && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
