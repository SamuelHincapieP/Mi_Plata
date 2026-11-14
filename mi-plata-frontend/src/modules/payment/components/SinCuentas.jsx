import Vacio from "../../core/design-system/Vacio.jsx";

/** Estado cuando el cliente no tiene cuentas asociadas. */
export default function SinCuentas() {
  return (
    <Vacio
      variante="cuentas"
      titulo="Sin productos asociados"
      texto="Esta cuenta no tiene cuentas ni tarjetas vinculadas. Solicita la creación de un producto con el administrador."
    />
  );
}