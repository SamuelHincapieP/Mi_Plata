import { useMemo, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { generarCsv, descargarCsv } from "../utils/exportarCsv.js";
import CuentaSelector from "./CuentaSelector.jsx";
import FilaMovimiento from "../../core/components/FilaMovimiento.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import SinCuentas from "./SinCuentas.jsx";
import ResumenTransferencias from "./ResumenTransferencias.jsx";
import ComprasTC from "./ComprasTC.jsx";
import "./movimientos.css";

export default function Historial() {
  const { cliente } = useAuth();
  const { version } = useBank();
  const cuentas = cliente?.cuentas || [];

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const cuenta = cuentas.find((c) => c.numeroCuenta === numero);

  // Del más reciente al más antiguo (obtenerMovimientos ya invierte)
  const movimientos = useMemo(
    () => (cuenta ? cuenta.obtenerMovimientos() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cuenta, version]
  );

  function exportar() {
    const csv = generarCsv(cliente);
    const nombre = `movimientos-${cliente.usuario}-${new Date().toISOString().slice(0, 10)}.csv`;
    descargarCsv(nombre, csv);
  }

  if (cuentas.length === 0) return <SinCuentas />;

  return (
    <section aria-label="Historial de movimientos">
      <div className="historial-cabecera">
        <div style={{ flex: "1 1 320px" }}>
          <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} etiqueta="Cuenta" />
        </div>
        <Boton variante="secundario" onClick={exportar}>
          <Icono nombre="descargar" size={16} />
          Exportar movimientos (CSV)
        </Boton>
      </div>

      {movimientos.length === 0 ? (
        <Vacio
          variante="busqueda"
          titulo="Esta cuenta no tiene asientos"
          texto="El libro mayor está vacío para la cuenta seleccionada. Registra una consignación para abrirlo."
        />
      ) : (
        <ul className="mov-lista">
          {movimientos.map((mov, i) => (
            <FilaMovimiento key={`${mov.id}-${i}`} movimiento={mov} />
          ))}
        </ul>
      )}

      <ResumenTransferencias usuarioID={cliente.id} />
      {cuenta?.tipo === "TarjetaCredito" && <ComprasTC numeroCuenta={cuenta.numeroCuenta} />}
    </section>
  );
}
