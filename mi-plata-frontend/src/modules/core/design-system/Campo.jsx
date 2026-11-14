import { useId, isValidElement, cloneElement } from "react";

const CONTROLES = ["input", "select", "textarea"];

/**
 * Asigna el id al primer control (input/select/textarea) encontrado,
 * aunque esté dentro de un contenedor (ej. div con botón de ojo).
 */
function asignarId(elemento, id, estado) {
  if (!isValidElement(elemento)) return elemento;

  if (typeof elemento.type === "string" && CONTROLES.includes(elemento.type)) {
    if (estado.hecho) return elemento;
    estado.hecho = true;
    return cloneElement(elemento, { id });
  }

  const hijos = elemento.props?.children;
  if (Array.isArray(hijos)) {
    return cloneElement(elemento, {
      children: hijos.map((hijo) => asignarId(hijo, id, estado)),
    });
  }
  if (isValidElement(hijos)) {
    return cloneElement(elemento, { children: asignarId(hijos, id, estado) });
  }
  return elemento;
}

/**
 * Campo de formulario con etiqueta, control y error (accesibilidad:
 * label asociada con htmlFor).
 * Uso: <Campo etiqueta="Monto" error={err}><input …/></Campo>
 */
export default function Campo({ etiqueta, error, ayuda, children, className = "" }) {
  const id = useId();
  const control = isValidElement(children)
    ? asignarId(children, id, { hecho: false })
    : children;

  return (
    <div className={`campo ${error ? "campo--error" : ""} ${className}`}>
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>
      {control}
      {ayuda && !error && <p className="campo__ayuda">{ayuda}</p>}
      {error && (
        <p className="campo__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
