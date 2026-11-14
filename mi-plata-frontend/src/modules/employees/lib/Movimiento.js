export default class Movimiento {
  constructor(tipo, monto, saldo, descripcion = "") {
    this._id = Date.now();
    this._fechaHora = new Date();
    this._tipo = tipo;
    this._valor = monto;
    this._saldoPosterior = saldo;
    this._descripcion = descripcion;
  }

  /** Texto opcional del movimiento (por ejemplo: "A AHO-030" o "Bolsillo «Mercado»"). */
  get descripcion() {
    return this._descripcion || "";
  }

  get id() {
    return this._id;
  }

  get fechaHora() {
    return this._fechaHora;
  }

  get tipo() {
    return this._tipo;
  }

  get valor() {
    return this._valor;
  }

  get saldoPosterior() {
    return this._saldoPosterior;
  }

  get fechaFormateada() {
    return this._fechaHora.toLocaleString("es-CO");
  }
}
