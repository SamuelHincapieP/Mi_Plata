import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { consignar, esTarjeta } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { soloMonto } from "../../core/utils/validacion.js";
import CuentaSelector from "./CuentaSelector.jsx";
import InfoDisponible from "./InfoDisponible.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import SinCuentas from "./SinCuentas.jsx";
import "./movimientos.css";

export default function Consignar() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  // Las tarjetas de credito no reciben consignaciones: se pagan desde la pantalla Pagar.
  const cuentas = (cliente?.cuentas || []).filter((c) => !esTarjeta(c));

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const [monto, setMonto] = useState("");
  const [alerta, setAlerta] = useState(null);

  const cuenta = cuentas.find((c) => c.numeroCuenta === numero);

  async function enviar(e) {
    e.preventDefault();
    const resultado = await consignar(clientes, cuenta, parseFloat(monto));
    if (resultado.ok) {
      recargar();
      setAlerta({ tipo: "ok", texto: `Consignación de ${fmt(resultado.monto)} exitosa.` });
      setMonto("");
    } else {
      setAlerta({ tipo: "error", texto: resultado.error });
    }
  }

  if (cuentas.length === 0) {
    return (cliente?.cuentas || []).length > 0 ? (
      <Vacio
        variante="cuentas"
        titulo="Sin cuenta de ahorros o corriente"
        texto="La tarjeta de crédito no recibe consignaciones. Para abonar a tu tarjeta usa la pantalla Pagar."
      />
    ) : (
      <SinCuentas />
    );
  }

  return (
    <section className="mov-form" aria-label="Consignar">
      <form className="mov-form__panel" onSubmit={enviar} noValidate>
        <h2 className="mov-form__titulo">Consignar</h2>
        <p className="mov-form__texto">
          Agrega dinero a la cuenta que elijas. El movimiento queda registrado con su saldo posterior.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} />

        <Campo etiqueta="Monto a consignar">
          <input
            className="campo__control"
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(soloMonto(e.target.value))}
            placeholder="Ej: 500000"
          />
        </Campo>

        <Boton type="submit" ancho>
          Consignar
        </Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Resumen</p>
        <InfoDisponible cuenta={cuenta} />
        <p className="mov-form__texto">
          Las consignaciones no generan costos. Solo las cuentas de ahorros y corriente reciben
          dinero; para abonar a una tarjeta usa la pantalla Pagar.
        </p>
      </aside>
    </section>
  );
}
