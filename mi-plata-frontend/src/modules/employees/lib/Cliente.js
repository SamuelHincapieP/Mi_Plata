export default class Cliente {
  constructor(id, identificacion, nombreCompleto, celular, usuario, contrasena, fechaRegistro, rol = "cliente") {
    this._id = id;
    this._rol = rol; // "cliente" | "admin" (rol nuevo para el login con roles)
    this._identificacion = identificacion;
    this._nombreCompleto = nombreCompleto;
    this._celular = celular;
    this._usuario = usuario;
    this._contrasena = contrasena;
    this._fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : new Date();
    this._intentosFallidos = 0;
    this._bloqueado = false;
    this._cuentas = [];
  }

  get id() {
    return this._id;
  }

  get identificacion() {
    return this._identificacion;
  }

  get nombreCompleto() {
    return this._nombreCompleto;
  }

  get celular() {
    return this._celular;
  }

  get usuario() {
    return this._usuario;
  }

  get contrasena() {
    return this._contrasena;
  }

  get fechaRegistro() {
    return this._fechaRegistro;
  }

  get rol() {
    return this._rol;
  }

  get esAdmin() {
    return this._rol === "admin";
  }

  get intentosFallidos() {
    return this._intentosFallidos;
  }

  get bloqueado() {
    return this._bloqueado;
  }

  get cuentas() {
    return this._cuentas;
  }

  // IAutenticable: autenticar
  autenticar(usuario, contrasena) {
    if (this._bloqueado) {
      throw new Error("Cuenta bloqueada por demasiados intentos fallidos.");
    }
    if (this._usuario === usuario && this._contrasena === contrasena) {
      this.resetearIntentos();
      return true;
    }
    this.incrementarIntentos();
    return false;
  }

  // IAutenticable: cambiarContrasena
  cambiarContrasena(antigua, nueva) {
    if (this._contrasena !== antigua) {
      throw new Error("La contraseña actual no es correcta.");
    }
    if (!nueva || nueva.length < 4) {
      throw new Error("La nueva contraseña debe tener al menos 4 caracteres.");
    }
    this._contrasena = nueva;
  }

  incrementarIntentos() {
    this._intentosFallidos++;
    if (this._intentosFallidos >= 3) {
      this._bloqueado = true;
    }
  }

  resetearIntentos() {
    this._intentosFallidos = 0;
  }

  editarPerfil(nombreCompleto, celular) {
    if (nombreCompleto) this._nombreCompleto = nombreCompleto;
    if (celular) this._celular = celular;
  }

  editarDatos(identificacion, nombreCompleto, celular, usuario, contrasena) {
    if (identificacion) this._identificacion = identificacion;
    if (nombreCompleto) this._nombreCompleto = nombreCompleto;
    if (celular) this._celular = celular;
    if (usuario) this._usuario = usuario;
    if (contrasena) this._contrasena = contrasena;
  }

  agregarCuenta(cuenta) {
    this._cuentas.push(cuenta);
  }

  desbloquear() {
    this._bloqueado = false;
    this._intentosFallidos = 0;
  }

  bloquear() {
    this._bloqueado = true;
  }
}
