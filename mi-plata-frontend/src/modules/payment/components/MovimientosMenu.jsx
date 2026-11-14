import { Link } from "react-router-dom";
import Icono from "../../core/design-system/Icono.jsx";
import "./movimientos.css";

const OPERACIONES = [
  { ruta: "consignar", icono: "entrada", titulo: "Consignar", texto: "Agrega dinero a cualquiera de tus cuentas." },
  { ruta: "retirar", icono: "salida", titulo: "Retirar", texto: "Saca efectivo con las reglas de cada cuenta." },
  { ruta: "transferir", icono: "transferencia", titulo: "Transferir", texto: "Envía dinero a otra cuenta del sistema." },
  { ruta: "historial", icono: "historial", titulo: "Historial", texto: "Libro contable con fecha, monto y saldo." },
  { ruta: "comprar", icono: "compra", titulo: "Comprar con TC", texto: "Compra a cuotas con tu tarjeta de crédito." },
  { ruta: "pagar", icono: "recibo", titulo: "Pagar TC", texto: "Abona a la deuda y recupera cupo." },
  { ruta: "bolsillos", icono: "escudo", titulo: "Bolsillos", texto: "Aparta dinero para algo en particular, como en Nequi." },
  { ruta: "metas", icono: "ahorros", titulo: "Metas de ahorro", texto: "Define una meta con fecha y decide cuánto aportas." },
];

/** Menú de operaciones bancarias. */
export default function MovimientosMenu() {
  return (
    <section aria-label="Operaciones disponibles">
      <div className="panel__cabecera">
        <div>
          <p className="etiqueta">Operar</p>
          <h2 className="mov-form__titulo">¿Qué quieres hacer?</h2>
        </div>
      </div>

      <div className="mov-menu">
        {OPERACIONES.map((op) => (
          <Link key={op.ruta} to={`/movimientos/${op.ruta}`} className="mov-menu__tarjeta">
            <span className="mov-menu__icono"><Icono nombre={op.icono} size={20} /></span>
            <strong>{op.titulo}</strong>
            <p>{op.texto}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
