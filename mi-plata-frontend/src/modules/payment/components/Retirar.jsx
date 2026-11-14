import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { retirar } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { soloMonto } from "../../core/utils/validacion.js";
import CuentaSelector from "./CuentaSelector.jsx";
import InfoDisponible from "./InfoDisponible.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import SinCuentas from "./SinCuentas.jsx";
import "./movimientos.css";

export default function Retirar() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  const cuentas = cliente?.cuentas || [];

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const [monto, setMonto] = useState("");
  const [alerta, setAlerta] = useState(null);

  const cuenta = cuentas.find((c) => c.numeroCuenta === numero);

  async function enviar(e) {
    e.preventDefault();
    const resultado = await retirar(clientes, cuenta, parseFloat(monto));
    if (resultado.ok) {
      recargar();
      setAlerta({ tipo: "ok", texto: `Retiro de ${fmt(resultado.monto)} exitoso.` });
      setMonto("");
    } else {
      setAlerta({ tipo: "error", texto: resultado.error });
    }
  }

  if (cuentas.length === 0) return <SinCuentas />;

  return (
    <section className="mov-form" aria-label="Retirar">
      <form className="mov-form__panel" onSubmit={enviar} noValidate>
        <h2 className="mov-form__titulo">Retirar</h2>
        <p className="mov-form__texto">
          Cada cuenta tiene su regla: ahorros cobra 2% sobre el monto y no permite sobregiro;
          la corriente permite hasta el 5% adicional; la tarjeta hace un avance contra el cupo.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} />

        <Campo etiqueta="Monto a retirar">
          <input
            className="campo__control"
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(soloMonto(e.target.value))}
            placeholder="Ej: 100000"
          />
        </Campo>

        <Boton type="submit" ancho>
          Retirar
        </Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Disponible</p>
        <InfoDisponible cuenta={cuenta} />
        <p className="mov-form__texto">
          El retiro en ahorros descuenta monto + interés; si el saldo no cubre ambos, la operación
          se rechaza. En corriente puedes bajar hasta el límite de sobregiro.
        </p>
      </aside>
    </section>
  );
}
