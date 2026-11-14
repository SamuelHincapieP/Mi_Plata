import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { pagarTarjeta, esTarjeta } from "../../employees/services/banco.js";
import { fmtExacto } from "../../core/utils/moneda.js";
import { soloMonto } from "../../core/utils/validacion.js";
import CuentaSelector from "./CuentaSelector.jsx";
import InfoDisponible from "./InfoDisponible.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import "./movimientos.css";

export default function Pagar() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  const tarjetas = (cliente?.cuentas || []).filter((c) => esTarjeta(c));
  const cuentasOrigen = (cliente?.cuentas || []).filter((c) => !esTarjeta(c));

  const [numero, setNumero] = useState(tarjetas[0]?.numeroCuenta || "");
  const [origenNumero, setOrigenNumero] = useState(cuentasOrigen[0]?.numeroCuenta || "");
  const [monto, setMonto] = useState("");
  const [alerta, setAlerta] = useState(null);

  const tc = tarjetas.find((c) => c.numeroCuenta === numero);
  const origen = cuentasOrigen.find((c) => c.numeroCuenta === origenNumero);

  async function pagar(montoAPagar) {
    if (!tc) return;
    if (!origen) {
      setAlerta({
        tipo: "error",
        texto: "Necesitas una cuenta de ahorros o corriente para pagar la tarjeta.",
      });
      return;
    }
    const resultado = await pagarTarjeta(clientes, tc, origen, montoAPagar);
    if (resultado.ok) {
      recargar();
      setAlerta({
        tipo: "ok",
        texto: `Pago de ${fmtExacto(resultado.monto)} desde ${origen.numeroCuenta}. Deuda restante: ${fmtExacto(resultado.deuda)}.`,
      });
      setMonto("");
    } else {
      setAlerta({ tipo: "error", texto: resultado.error });
    }
  }

  function enviar(e) {
    e.preventDefault();
    pagar(parseFloat(monto));
  }

  /** Salda la deuda exacta de un clic, sin depender de teclear el monto. */
  function pagarTotal() {
    if (!tc || !origen || !(tc.deuda > 0)) return;
    pagar(tc.deuda);
  }

  if (tarjetas.length === 0) {
    return (
      <Vacio
        variante="cuentas"
        titulo="Sin tarjetas de crédito"
        texto="No tienes tarjetas asociadas para pagar. Solicita al administrador que te asigne una."
      />
    );
  }

  return (
    <section className="mov-form" aria-label="Pagar tarjeta">
      <form className="mov-form__panel" onSubmit={enviar} noValidate>
        <h2 className="mov-form__titulo">Pagar TC</h2>
        <p className="mov-form__texto">
          Abona a la deuda de tu tarjeta y recupera cupo al instante. El dinero sale de una de
          tus cuentas de ahorros o corriente; no puedes pagar más del saldo adeudado.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={tarjetas} valor={numero} onChange={setNumero} soloTC etiqueta="Tarjeta a pagar" />

        {cuentasOrigen.length > 0 ? (
          <CuentaSelector
            cuentas={cuentasOrigen}
            valor={origenNumero}
            onChange={setOrigenNumero}
            etiqueta="Cuenta de origen"
          />
        ) : (
          <Alerta tipo="error">
            No tienes una cuenta de ahorros o corriente para pagar. Solicita una al administrador.
          </Alerta>
        )}

        <Campo etiqueta="Monto a pagar">
          <input
            className="campo__control"
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(soloMonto(e.target.value))}
            placeholder="Ej: 150000"
          />
        </Campo>

        <Boton type="submit" ancho disabled={!origen}>
          Pagar
        </Boton>

        <Boton
          type="button"
          variante="secundario"
          ancho
          onClick={pagarTotal}
          disabled={!tc || !origen || !(tc.deuda > 0)}
        >
          {tc && tc.deuda > 0 ? `Pagar total ${fmtExacto(tc.deuda)}` : "Pagar total"}
        </Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Tarjeta</p>
        <InfoDisponible cuenta={tc} />
        {origen && (
          <>
            <p className="etiqueta">Cuenta de origen</p>
            <InfoDisponible cuenta={origen} />
          </>
        )}
        <p className="mov-form__texto">
          El pago descuenta el monto de la cuenta de origen y reduce la deuda de la tarjeta. Un
          pago parcial libera cupo proporcionalmente; paga el total para volver a cero la deuda.
        </p>
      </aside>
    </section>
  );
}
