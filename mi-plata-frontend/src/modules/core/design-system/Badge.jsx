/**
 * Badge — micro-badge e indicador semántico de estado del sistema.
 * tonos: neutro | ok | peligro | acento | aviso
 * Con punto: añade un punto de estado con latido suave ("en vivo").
 */
export default function Badge({
  tono = "neutro",
  punto = false,
  children,
  className = "",
  ...props
}) {
  const clases = [
    "badge",
    tono !== "neutro" ? `badge--${tono}` : "",
    punto ? "badge--punto" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={clases} {...props}>
      {punto && <span className="badge__punto" aria-hidden="true" />}
      {children}
    </span>
  );
}