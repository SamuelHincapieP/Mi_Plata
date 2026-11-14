// BankProvider — Carga los clientes desde la base de datos (API) y comparte el estado.
import { useEffect, useState, useCallback } from "react";
import { BankContext } from "./BankContext.js";
import { cargarClientes } from "../services/banco.js";

export function BankProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  // Las clases se actualizan en la lista: version permite revalidar useMemo tras una operación
  const [version, setVersion] = useState(0);

  // Carga inicial desde el backend
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const datos = await cargarClientes();
        if (activo) setClientes(datos);
      } catch (e) {
        if (activo) setError(e.message || "Error cargando los datos.");
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  /** Notifica a las pantallas que la lista cambió (tras una operación que ya se guardó en la BD). */
  const recargar = useCallback(() => {
    setClientes((prev) => [...prev]);
    setVersion((v) => v + 1);
  }, []);

  return (
    <BankContext.Provider value={{ clientes, setClientes, recargar, cargando, error, version }}>
      {children}
    </BankContext.Provider>
  );
}
