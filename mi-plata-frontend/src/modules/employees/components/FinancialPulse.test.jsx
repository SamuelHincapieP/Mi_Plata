import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FinancialPulse from "./FinancialPulse.jsx";

const mov = (tipo, valor, saldoPosterior, hora) => ({
  tipo, valor, saldoPosterior, fechaHora: new Date(`2026-11-10T${hora}:00`),
});

// El caso real: 5 M consignados; 500 K a un bolsillo y 300 K a una meta; luego 3 M más → disponible 7,2 M
const casoReal = [mov("CONSIGNACION", 5000000, 5000000, "17:55"), mov("CONSIGNACION", 3000000, 7200000, "22:51")];
const dibujar = (props) => renderToStaticMarkup(<FinancialPulse {...props} />);

describe("FinancialPulse", () => {
  it("aclara que dibuja el saldo disponible", () => {
    expect(dibujar({ movimientos: casoReal })).toContain("saldo disponible");
  });

  it("sin movimientos muestra el estado vacío", () => {
    expect(dibujar({ movimientos: [] })).toContain("Sin movimientos suficientes");
  });

  it("con dinero apartado explica los saltos de la línea", () => {
    const html = dibujar({ movimientos: casoReal, apartados: true });
    expect(html).toContain("La línea tiene saltos");
    expect(html).toContain("No es un gasto");
  });

  it("si todo cuadra con los movimientos no avisa nada", () => {
    const cuadra = [mov("CONSIGNACION", 5000000, 5000000, "17:55"), mov("CONSIGNACION", 3000000, 8000000, "22:51")];
    expect(dibujar({ movimientos: cuadra, apartados: true })).not.toContain("La línea tiene saltos");
  });

  it("muestra el desglose: disponible + bolsillos + metas = total (7,2 M + 500 K + 300 K = 8 M)", () => {
    const html = dibujar({ movimientos: casoReal, apartados: true, disponible: 7200000, enBolsillos: 500000, enMetas: 300000 });
    expect(html).toContain("Disponible");
    expect(html).toContain("En bolsillos");
    expect(html).toContain("En metas");
    expect(html).toMatch(/7\.200\.000/);
    expect(html).toMatch(/8\.000\.000/); // total
  });

  it("sin dinero apartado no dibuja el desglose", () => {
    const html = dibujar({ movimientos: casoReal, apartados: true, disponible: 7200000, enBolsillos: 0, enMetas: 0 });
    expect(html).not.toContain("En bolsillos");
  });

  it("en una tarjeta (apartados desactivado) no hay avisos ni desglose", () => {
    const html = dibujar({ movimientos: casoReal, apartados: false, enBolsillos: 500000, enMetas: 300000 });
    expect(html).not.toContain("La línea tiene saltos");
    expect(html).not.toContain("En bolsillos");
  });
});
