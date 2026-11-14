/** Mensaje de estado: ok | error | aviso. role=alert para lectores de pantalla. */
export default function Alerta({ tipo = "ok", children }) {
  if (!children) return null;
  return (
    <div className={`alerta alerta--${tipo}`} role="alert">
      <span aria-hidden="true">
        {tipo === "ok" ? "✓" : tipo === "error" ? "✕" : "!"}
      </span>
      <div>{children}</div>
    </div>
  );
}
