/**
 * Logo Mi Plata — imagen oficial (public/logo.png, fondo transparente).
 * srcSet entrega la versión de 792 px a pantallas de alta densidad.
 */
export function Marca({ size = 40 }) {
  return (
    <img
      src="/logo.png"
      srcSet="/logo-128.png 128w, /logo.png 792w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt="Mi Plata"
      className="marca-img"
      decoding="async"
    />
  );
}

/** Marca + logotipo en texto (header y landing). */
export default function Logo({ size = 40, compacto = false }) {
  return (
    <span className="logo">
      <Marca size={size} />
      {!compacto && (
        <span className="logo__texto">
          Mi <strong>Plata</strong>
        </span>
      )}
    </span>
  );
}
