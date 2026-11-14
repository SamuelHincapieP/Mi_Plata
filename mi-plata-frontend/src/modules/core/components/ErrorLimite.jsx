// ErrorLimite — Si una pantalla falla al dibujarse, muestra el error en vez de dejar la página en blanco.
import { Component } from "react";

export default class ErrorLimite extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error al dibujar la pantalla:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: "32px", color: "var(--text)", maxWidth: "720px" }}>
        <h2>Algo falló al mostrar esta pantalla</h2>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {String(this.state.error?.message || this.state.error)}
        </p>
        <button type="button" onClick={() => this.setState({ error: null })}>
          Reintentar
        </button>
      </div>
    );
  }
}
