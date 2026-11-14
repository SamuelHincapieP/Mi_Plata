// fechas.js — Formato de fechas en español (es-CO).
export function fechaCorta(fecha) {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "Sin fecha";
  return valor.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function fechaHora(fecha) {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "Sin fecha";
  return valor.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fechaLarga(fecha = new Date()) {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  return valor.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
