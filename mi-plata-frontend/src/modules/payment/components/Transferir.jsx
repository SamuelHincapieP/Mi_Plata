import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../../employees/hooks/useBank.js";
import { transferir } from "../../employees/services/banco.js";
import { fmt } from "../../core/utils/moneda.js";
import { soloMonto, soloCuenta, soloTexto, LIMITES } from "../../core/utils/validacion.js";
import CuentaSelector from "./CuentaSelector.jsx";
import InfoDisponible from "./InfoDisponible.jsx";
import Campo from "../../core/design-system/Campo.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import Alerta from "../../core/design-system/Alerta.jsx";
import SinCuentas from "./SinCuentas.jsx";
import "./movimientos.css";

export default function Transferir() {
  const { cliente } = useAuth();
  const { clientes, recargar } = useBank();
  const cuentas = cliente?.cuentas || [];

  const [numero, setNumero] = useState(cuentas[0]?.numeroCuenta || "");
  const [destino, setDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [alerta, setAlerta] = useState(null);

  const cuenta = cuentas.find((c) => c.numeroCuenta === numero);

  async function enviar(e) {
    e.preventDefault();
    const destinoLimpio = destino.trim().toUpperCase();
    // Obligatorios: no se envía nada si faltan (la base no admite campos vacíos)
    if (!destinoLimpio || !monto) {
      setAlerta({ tipo: "error", texto: "Completa el número de cuenta destino y el monto." });
      return;
    }
    const resultado = await transferir(clientes, cuenta, destinoLimpio, parseFloat(monto), mensaje.trim());
    if (resultado.ok) {
      recargar();
      setAlerta({
        tipo: "ok",
        texto: `Transferencia de ${fmt(resultado.monto)} a ${resultado.destino} exitosa.`,
      });
      setMonto("");
      setDestino("");
      setMensaje("");
    } else {
      setAlerta({ tipo: "error", texto: resultado.error });
    }
  }

  if (cuentas.length === 0) return <SinCuentas />;

  return (
    <section className="mov-form" aria-label="Transferir">
      <form className="mov-form__panel" onSubmit={enviar} noValidate>
        <h2 className="mov-form__titulo">Transferir</h2>
        <p className="mov-form__texto">
          Envía dinero a cualquier cuenta del sistema (otros clientes incluidos). La cuenta
          destino recibe el monto como transferencia.
        </p>

        <Alerta tipo={alerta?.tipo}>{alerta?.texto}</Alerta>

        <CuentaSelector cuentas={cuentas} valor={numero} onChange={setNumero} etiqueta="Cuenta origen" />

        <Campo etiqueta="Número de cuenta destino">
          <input
            className="campo__control"
            type="text"
            value={destino}
            onChange={(e) => setDestino(soloCuenta(e.target.value))}
            placeholder="Ej: AHO-030"
            autoCapitalize="characters"
          />
        </Campo>

        <Campo etiqueta="Monto a transferir">
          <input
            className="campo__control"
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(soloMonto(e.target.value))}
            placeholder="Ej: 200000"
          />
        </Campo>

        <Campo etiqueta={`Mensaje para el destinatario (opcional, ${mensaje.length}/${LIMITES.mensaje})`}>
          <textarea
            className="campo__control"
            rows={3}
            maxLength={LIMITES.mensaje}
            value={mensaje}
            onChange={(e) => setMensaje(soloTexto(e.target.value, LIMITES.mensaje))}
            placeholder="Ej: Pago del arriendo de noviembre"
          />
        </Campo>

        <Boton type="submit" ancho>
          Transferir
        </Boton>
      </form>

      <aside className="mov-form__panel">
        <p className="etiqueta">Origen</p>
        <InfoDisponible cuenta={cuenta} />
        <p className="mov-form__texto">
          Prueba con <strong>AHO-030</strong> (María) o <strong>CTE-041</strong> (Juan). No
          puedes transferir a la misma cuenta de origen.
        </p>
      </aside>
    </section>
  );
}
