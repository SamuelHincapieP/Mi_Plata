import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useBank } from "../hooks/useBank.js";
import { esTarjeta, obtenerDisponible, nombreTipo, obtenerBolsillos, obtenerMetas } from "../services/banco.js";
import { fmt, enmascarar } from "../../core/utils/moneda.js";
import { fechaLarga } from "../../core/utils/fechas.js";
import SaldoGigante from "./SaldoGigante.jsx";
import Ticker from "../../core/components/Ticker.jsx";
import FinancialPulse from "./FinancialPulse.jsx";
import FilaMovimiento from "../../core/components/FilaMovimiento.jsx";
import { AhorrosCard, CorrienteCard, TarjetaCard } from "./Productos.jsx";
import Icono from "../../core/design-system/Icono.jsx";
import Badge from "../../core/design-system/Badge.jsx";
import Vacio from "../../core/design-system/Vacio.jsx";
import Boton from "../../core/design-system/Boton.jsx";
import "./dashboard.css";

const ACCIONES = [
  { ruta: "/movimientos/consignar", icono: "entrada", texto: "Consignar" },
  { ruta: "/movimientos/retirar", icono: "salida", texto: "Retirar" },
  { ruta: "/movimientos/transferir", icono: "transferencia", texto: "Transferir" },
  { ruta: "/movimientos/comprar", icono: "compra", texto: "Comprar con TC" },
];

export default function Dashboard() {
  const { cliente } = useAuth();
  const { version } = useBank();
  const [indice, setIndice] = useState(0);

  const cuentas = cliente?.cuentas || [];
  const cuenta = cuentas[indice] || cuentas[0] || null;

  // Resúmenes derivados (useMemo): cambian solo cuando hay una operación nueva
  const resumen = useMemo(() => {
    const saldoTotal = cuentas
      .filter((c) => !esTarjeta(c))
      .reduce((t, c) => t + c.saldo, 0);
    const deudaTotal = cuentas
      .filter((c) => esTarjeta(c))
      .reduce((t, c) => t + c.deuda, 0);
    const movimientos = cuentas.flatMap((c) => c.movimientos);
    return { saldoTotal, deudaTotal, totalMovimientos: movimientos.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentas, version]);

  const recientes = useMemo(() => {
    const todos = cuentas.flatMap((c) =>
      c.obtenerMovimientos().map((m) => ({ mov: m, cuenta: c }))
    );
    return todos
      .sort((a, b) => b.mov.fechaHora - a.mov.fechaHora)
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentas, version]);

  const pulse = useMemo(
    () => (cuenta ? cuenta.movimientos : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cuenta, version]
  );

  // Dinero apartado de la cuenta seleccionada (bolsillos y metas): el Pulse lo muestra aparte del disponible
  const [apartado, setApartado] = useState({ bolsillos: 0, metas: 0 });
  const numeroCuenta = cuenta?.numeroCuenta;
  const esAhorros = cuenta?.tipo === "CuentaAhorros";
  const conApartados = Boolean(cuenta) && !esTarjeta(cuenta);

  useEffect(() => {
    if (!conApartados) {
      setApartado({ bolsillos: 0, metas: 0 });
      return undefined;
    }
    let activo = true;
    const suma = (r, campo) => (r.ok ? r.lista.reduce((t, x) => t + Number(x[campo] || 0), 0) : 0);
    Promise.all([
      obtenerBolsillos(numeroCuenta),
      esAhorros ? obtenerMetas(numeroCuenta) : Promise.resolve({ ok: true, lista: [] }),
    ]).then(([b, m]) => {
      if (activo) setApartado({ bolsillos: suma(b, "saldo"), metas: suma(m, "montoAhorrado") });
    });
    return () => { activo = false; };
  }, [numeroCuenta, conApartados, esAhorros, version]);

  if (!cliente) return null;

  const nombreCorto = cliente.nombreCompleto.split(" ")[0];
  const primera = cliente.nombreCompleto.charAt(0).toUpperCase();

  // Datos del banner según el tipo de cuenta seleccionada
  let etiqueta = "Sin cuentas";
  let extra = "Registra tus productos desde el registro o pide apoyo al administrador.";
  if (cuenta) {
    if (esTarjeta(cuenta)) {
      etiqueta = "Cupo disponible";
      extra = `Cupo total ${fmt(cuenta.cupo)} · Deuda ${fmt(cuenta.deuda)}`;
    } else if (tipoCorriente(cuenta)) {
      etiqueta = "Saldo disponible";
      extra = `Con sobregiro: ${fmt(obtenerDisponible(cuenta))} · zona de crédito 5%`;
    } else {
      etiqueta = "Saldo";
      extra = "Tasa al retirar: 2% sobre el monto · sin sobregiro";
    }
  }

  return (
    <div className="dashboard">
      {/* ── Saludo ── */}
      <header className="dashboard__saludo">
        <div className="dashboard__avatar" aria-hidden="true">{primera}</div>
        <div>
          <h1 className="pagina__titulo">Hola, {nombreCorto}</h1>
          <p className="pagina__subtitulo">{fechaLarga()}</p>
        </div>
        <div className="dashboard__metricas">
          <Badge>
            Saldo total <strong>{fmt(resumen.saldoTotal)}</strong>
          </Badge>
          <Badge tono={resumen.deudaTotal > 0 ? "aviso" : "neutro"}>
            Deuda TC <strong>{fmt(resumen.deudaTotal)}</strong>
          </Badge>
          <Badge tono="acento" punto>
            {resumen.totalMovimientos} movimientos
          </Badge>
        </div>
      </header>

      {/* ── Banner saldo gigante ── */}
      <section className="dashboard__banner" aria-label="Saldo de la cuenta seleccionada">
        <div className="dashboard__banner-info">
          <span className="etiqueta">{etiqueta}</span>
          <SaldoGigante
            monto={cuenta ? (esTarjeta(cuenta) ? cuenta.cupoDisponible : cuenta.saldo) : 0}
          />
          <p className="dashboard__banner-extra">{extra}</p>
        </div>
        <div className="dashboard__banner-cuenta">
          <span className="etiqueta">{cuenta ? nombreTipo(cuenta) : "—"}</span>
          <span className="dashboard__banner-numero">
            {cuenta ? enmascarar(cuenta.numeroCuenta) : "****"}
          </span>
          {cuenta && (
            <Badge tono={cuenta.estado === "ACTIVA" ? "ok" : "peligro"} punto>
              {cuenta.estado}
            </Badge>
          )}
        </div>
      </section>

      <Ticker movimientos={recientes.map((r) => r.mov)} />

      {/* ── Pulse + acciones ── */}
      <section className="dashboard__rejilla">
        <FinancialPulse
          movimientos={pulse}
          apartados={conApartados}
          tasaRetiro={esAhorros ? cuenta.tasaInteres : 0}
          disponible={cuenta?.saldo ?? 0}
          enBolsillos={apartado.bolsillos}
          enMetas={apartado.metas}
        />

        <div className="panel dashboard__acciones">
          <div className="panel__cabecera">
            <p className="etiqueta">Acciones rápidas</p>
          </div>
          <div className="dashboard__acciones-lista">
            {ACCIONES.map((a) => (
              <Link key={a.ruta} to={a.ruta} className="accion-rapida">
                <span className="accion-rapida__icono"><Icono nombre={a.icono} size={18} /></span>
                {a.texto}
                <Icono nombre="chevron" size={16} className="accion-rapida__flecha" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Productos con composición distinta ── */}
      <section aria-label="Tus productos">
        <div className="panel__cabecera">
          <p className="etiqueta">Tus productos</p>
          <span className="etiqueta">Toca una tarjeta para ver su detalle arriba</span>
        </div>

        {cuentas.length === 0 ? (
          <Vacio
            variante="cuentas"
            titulo="Aún no tienes productos"
            texto="Registra tus cuentas desde el registro o pide apoyo al administrador para asociarlas."
            accion={
              <Boton variante="secundario" onClick={() => setIndice(0)}>
                <Icono nombre="recargar" size={16} />
                Actualizar
              </Boton>
            }
          />
        ) : (
          <div className="dashboard__productos">
            {cuentas.map((c, i) => {
              const comunes = {
                cuenta: c,
                seleccionada: cuenta === c,
                onSelect: () => setIndice(i),
              };
              if (esTarjeta(c)) return <TarjetaCard key={c.numeroCuenta} {...comunes} />;
              if (tipoCorriente(c)) return <CorrienteCard key={c.numeroCuenta} {...comunes} />;
              return <AhorrosCard key={c.numeroCuenta} {...comunes} />;
            })}
          </div>
        )}
      </section>

      {/* ── Movimientos recientes ── */}
      <section aria-label="Movimientos recientes">
        <div className="panel__cabecera">
          <p className="etiqueta">Movimientos recientes</p>
          <Link className="boton boton--fantasma" to="/movimientos/historial">
            Ver historial completo
          </Link>
        </div>

        {recientes.length === 0 ? (
          <Vacio
            variante="movimientos"
            titulo="Sin movimientos todavía"
            texto="Tu libro mayor está en blanco. Empieza con una consignación y cada asiento aparecerá aquí."
            accion={
              <Link to="/movimientos/consignar" className="boton boton--primario">
                <Icono nombre="entrada" size={16} />
                Hacer la primera consignación
              </Link>
            }
          />
        ) : (
          <ul className="mov-lista">
            {recientes.map(({ mov, cuenta: c }, i) => (
              <FilaMovimiento key={`${mov.id}-${i}`} movimiento={mov} cuentaNumero={c.numeroCuenta} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function tipoCorriente(cuenta) {
  return cuenta.tipo === "CuentaCorriente";
}
