// CSV pensado para Excel en Colombia: punto y coma, encabezados legibles y COP.

function escapar(valor) {
  const texto = String(valor ?? "");
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const formatoDinero = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", minimumFractionDigits: 2,
});

function formatoFecha(fecha) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short", timeStyle: "short", hour12: false,
  }).format(fecha);
}

function textoTipo(tipo) {
  return String(tipo || "MOVIMIENTO").replaceAll("_", " ");
}

/**
 * Genera el contenido CSV de las cuentas indicadas.
 * @param {Array<{cuenta: object, movimientos: object[]}>} filas
 */
export function generarCsv(cliente) {
  // "sep=;" hace que Excel separe las columnas correctamente aunque el
  // computador tenga coma decimal configurada.
  const lineas = ["sep=;", "Fecha;Tipo de movimiento;Monto (COP);Saldo posterior (COP);Cuenta;Descripción"];

  for (const cuenta of cliente.cuentas) {
    // Del más antiguo al más reciente para el análisis temporal
    const movs = [...cuenta.obtenerMovimientos()].reverse();
    for (const mov of movs) {
      lineas.push(
        [
          escapar(formatoFecha(mov.fechaHora)),
          escapar(textoTipo(mov.tipo)),
          escapar(formatoDinero.format(mov.valor)),
          escapar(formatoDinero.format(mov.saldoPosterior)),
          escapar(cuenta.numeroCuenta),
          escapar(mov.descripcion),
        ].join(";")
      );
    }
  }

  return lineas.join("\n");
}

/** Descarga el texto como archivo .csv en el navegador. */
export function descargarCsv(nombreArchivo, contenido) {
  const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
