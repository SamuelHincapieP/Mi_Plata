import { Link } from "react-router-dom";
import Logo from "../design-system/Logo.jsx";
import Icono from "../design-system/Icono.jsx";
import Emblema from "../design-system/Emblema.jsx";
import Ticker from "./Ticker.jsx";
import "./landing.css";

const MOVIMIENTOS_EJEMPLO = [
  { tipo: "CONSIGNACION", valor: 800000, fechaHora: new Date("2026-09-02T09:00:00") },
  { tipo: "RETIRO", valor: 150000, fechaHora: new Date("2026-09-05T11:30:00") },
  { tipo: "COMPRA_TC", valor: 480000, fechaHora: new Date("2026-09-10T17:00:00") },
  { tipo: "TRANSFERENCIA_OUT", valor: 350000, fechaHora: new Date("2026-09-12T16:20:00") },
  { tipo: "CONSIGNACION", valor: 1200000, fechaHora: new Date("2026-09-15T08:45:00") },
];

/* Productos que se muestran en la vista previa del inicio (solo informativo) */
const VISTA_PRODUCTOS = [
  { icono: "ahorros", nombre: "Cuenta de ahorros", detalle: "Para guardar tu dinero con reglas claras" },
  { icono: "corriente", nombre: "Cuenta corriente", detalle: "Con sobregiro para tus imprevistos" },
  { icono: "tarjeta", nombre: "Tarjeta de crédito", detalle: "Compra a cuotas y paga cuando quieras" },
];

const OPERACIONES = [
  "Consignar", "Retirar", "Transferir", "Comprar a cuotas", "Pagar tarjeta", "Historial y CSV",
];

const PRODUCTOS = [
  {
    icono: "ahorros",
    titulo: "Cuenta de ahorros",
    lema: "Tu plata quieta, con reglas claras.",
    datos: [
      ["Sin sobregiro", "El saldo nunca baja de cero"],
      ["Interés 2%", "Se aplica sobre el monto retirado"],
      ["Movimientos", "Cada giro queda registrado"],
    ],
  },
  {
    icono: "corriente",
    titulo: "Cuenta corriente",
    lema: "Respaldo para los imprevistos.",
    datos: [
      ["Sobregiro 5%", "Hasta el 5% de tu saldo actual"],
      ["Sin costo extra", "Retiros y transferencias sin tasa"],
      ["Disponible", "Siempre a la vista en tu panel"],
    ],
  },
  {
    icono: "tarjeta",
    titulo: "Tarjeta de crédito",
    lema: "Compra a cuotas sin sorpresas.",
    datos: [
      ["1–2 cuotas", "Sin interés y sin cuota de manejo"],
      ["3–6 cuotas", "1,9% mensual · manejo $8.500"],
      ["7+ cuotas", "2,3% mensual · manejo $15.000"],
    ],
  },
];

const SEGURIDAD = [
  { icono: "candado", titulo: "Bloqueo inteligente", texto: "A los 3 intentos fallidos la cuenta se bloquea y solo un administrador puede desbloquearla." },
  { icono: "escudo", titulo: "Roles definidos", texto: "Cada persona entra con su rol: cliente para operar, administrador para auditar." },
  { icono: "historial", titulo: "Todo queda registrado", texto: "Consignaciones, retiros, transferencias y compras con su fecha, monto y saldo posterior." },
];

/** Vista previa del banco: una tarjeta y el resumen de los productos. */
function VistaProductos() {
  return (
    <div className="vista-productos" aria-hidden="true">
      <div className="tarjeta-banco revelar" style={{ "--i": 3 }}>
        <div className="tarjeta-banco__fila">
          <span className="tarjeta-banco__marca">Mi Plata</span>
        </div>
        <svg className="tarjeta-banco__chip" viewBox="0 0 40 30" focusable="false">
          <rect x="1" y="1" width="38" height="28" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 10h38M1 20h38M14 1v28M26 1v28" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <p className="tarjeta-banco__producto">Tarjeta de crédito</p>
      </div>

      <div className="vista-productos__panel revelar" style={{ "--i": 4 }}>
        <h3 className="vista-productos__titulo">Productos disponibles</h3>
        <ul className="vista-productos__lista">
          {VISTA_PRODUCTOS.map((r) => (
            <li key={r.nombre} className="vista-productos__fila">
              <span className="producto-landing__icono">
                <Icono nombre={r.icono} size={20} />
              </span>
              <span className="vista-productos__nombre">
                <strong>{r.nombre}</strong>
                <small>{r.detalle}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      {/* ── Navegación ── */}
      <header className="landing__nav">
        <Logo size={36} />
        <nav aria-label="Navegación de la landing">
          <a href="#productos">Productos</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <div className="landing__nav-acciones">
          <Link className="boton boton--secundario" to="/login">Ingresar</Link>
          <Link className="boton boton--primario" to="/registro">Crear cuenta</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing__hero">
        <Emblema variante="tarjeta" className="landing__patron" />
        <div className="landing__hero-grid">
          <div className="landing__hero-texto">
            <span className="landing__chip revelar" style={{ "--i": 0 }}>
              <span className="landing__chip-punto" />
              Banca digital · Colombia
            </span>

            <h1 className="landing__titulo revelar" style={{ "--i": 1 }}>
              Tu dinero, claro como un{" "}
              <span className="texto-bronce">libro contable</span>.
            </h1>

            <p className="landing__texto revelar" style={{ "--i": 2 }}>
              Mi Plata reúne tu cuenta de ahorros, tu cuenta corriente y tu tarjeta
              en un solo panel: cada movimiento con fecha, monto y saldo posterior.
            </p>

            <div className="landing__cta revelar" style={{ "--i": 3 }}>
              <Link className="boton boton--primario" to="/registro">
                Abrir mi cuenta
              </Link>
              <Link className="boton boton--secundario" to="/login">
                Ya soy cliente
              </Link>
            </div>

            <ul className="landing__promesas revelar" style={{ "--i": 4 }}>
              <li>Reglas claras</li>
              <li>Acceso seguro</li>
              <li>Disponible 24/7</li>
            </ul>
          </div>

          <div className="landing__hero-visual">
            <div className="landing__halo" aria-hidden="true" />
            <VistaProductos />
          </div>
        </div>

        <div className="landing__ticker">
          <Ticker movimientos={MOVIMIENTOS_EJEMPLO} />
        </div>
      </section>

      {/* ── Capacidades ── */}
      <section className="landing__capacidades" aria-label="Operaciones disponibles">
        <ul>
          {OPERACIONES.map((op) => (
            <li key={op}>
              <Icono nombre="entrada" size={14} />
              {op}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Productos ── */}
      <section id="productos" className="landing__seccion">
        <div className="landing__seccion-cabecera">
          <span className="etiqueta">Productos</span>
          <h2>Tres formas de manejar tu plata</h2>
          <p>Reglas de negocio publicadas tal cual funcionan: lo que ves es lo que se aplica.</p>
        </div>

        <div className="landing__productos">
          {PRODUCTOS.map((p, i) => (
            <article key={p.titulo} className="producto-landing revelar" style={{ "--i": i }}>
              <div className="producto-landing__encabezado">
                <span className="producto-landing__icono">
                  <Icono nombre={p.icono} size={22} />
                </span>
                <div>
                  <h3>{p.titulo}</h3>
                  <p className="producto-landing__lema">{p.lema}</p>
                </div>
              </div>
              <dl className="producto-landing__datos">
                {p.datos.map(([dt, dd]) => (
                  <div key={dt}>
                    <dt>{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* ── Seguridad ── */}
      <section id="seguridad" className="landing__seccion landing__seguridad">
        <div className="landing__seccion-cabecera">
          <span className="etiqueta">Seguridad</span>
          <h2>Seguridad que se ve y se entiende</h2>
          <p>La confianza empieza por mostrar las reglas, no esconderlas.</p>
        </div>

        <div className="landing__seguridad-grid">
          {SEGURIDAD.map((s, i) => (
            <article key={s.titulo} className="seguridad-item revelar" style={{ "--i": i }}>
              <span className="seguridad-item__numero mono">0{i + 1}</span>
              <span className="seguridad-item__icono">
                <Icono nombre={s.icono} size={22} />
              </span>
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
            </article>
          ))}
        </div>

        <div className="landing__banner">
          <p>
            <strong>Abre tu cuenta en minutos.</strong> Elige tus productos, empieza a
            mover tu dinero y consulta cada movimiento cuando quieras.
          </p>
          <Link className="boton boton--primario" to="/registro">Abrir mi cuenta</Link>
        </div>
      </section>

      {/* ── Pie ── */}
      <footer className="landing__pie">
        <Logo size={28} />
        <p>© 2026 Mi Plata — Seguridad y confianza financiera.</p>
        <p className="etiqueta">Proyecto académico · Tecnología en Desarrollo de Software</p>
      </footer>
    </div>
  );
}
