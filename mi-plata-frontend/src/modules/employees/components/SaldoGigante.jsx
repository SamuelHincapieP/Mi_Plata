import { useEffect, useRef, useState } from "react";
import { partesMonto } from "../../core/utils/moneda.js";
import "./SaldoGigante.css";

/**
 * Saldo gigante con conteo animado.
 * Respeta prefers-reduced-motion: muestra el valor final sin animar.
 */
export default function SaldoGigante({ monto, etiqueta, prefijo = "$" }) {
  // Se lee una sola vez al montar: si pide menos movimiento, no animamos.
  const [reducido] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const [valor, setValor] = useState(0);
  const rafRef = useRef(0);

  // El conteo sí sincroniza con el navegador (requestAnimationFrame),
  // por eso va en un efecto.
  useEffect(() => {
    if (reducido) return undefined;

    const inicio = performance.now();
    const duracion = 900;
    const animar = (ahora) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValor(monto * suave);
      if (t < 1) rafRef.current = requestAnimationFrame(animar);
    };
    rafRef.current = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(rafRef.current);
  }, [monto, reducido]);

  // Sin animación mostramos el saldo real directamente (derivado en render).
  const mostrado = reducido ? monto : valor;
  const { pesos, centavos, negativo } = partesMonto(mostrado);

  return (
    <p className="saldo-gigante" aria-label={`${prefijo} ${pesos} con ${centavos}`}>
      {etiqueta && <span className="etiqueta saldo-gigante__etiqueta">{etiqueta}</span>}
      <span className="saldo-gigante__valor">
        <span className="saldo-gigante__prefijo">{negativo ? "−" : ""}{prefijo}</span>
        {pesos}
        <span className="saldo-gigante__centavos">,{centavos}</span>
      </span>
    </p>
  );
}
