import Logo from "../../core/design-system/Logo.jsx";
import Emblema from "../../core/design-system/Emblema.jsx";
import Icono from "../../core/design-system/Icono.jsx";

const SEGURIDAD = [
  "Bloqueo automático tras 3 intentos fallidos",
  "Sesión protegida con sessionStorage",
  "Tus datos se guardan solo en este navegador",
];

/** Mitad de marca de las pantallas divididas (login y registro). */
export default function MarcaPanel({ titulo, texto }) {
  return (
    <aside className="marca-panel">
      <Emblema variante="moneda" className="marca-panel__patron" />
      <div className="marca-panel__contenido">
        <Logo size={48} />
        <h1 className="marca-panel__titulo">{titulo}</h1>
        <p className="marca-panel__texto">{texto}</p>

        <ul className="marca-panel__seguridad">
          {SEGURIDAD.map((item) => (
            <li key={item}>
              <Icono nombre="candado" size={16} />
              {item}
            </li>
          ))}
        </ul>

        <p className="marca-panel__pie etiqueta">Libro mayor digital · Mi Plata</p>
      </div>
    </aside>
  );
}
