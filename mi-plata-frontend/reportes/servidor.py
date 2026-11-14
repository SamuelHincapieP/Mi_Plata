"""
Servidor de reportes (solo librería estándar + reporte.py).
Ejecutar:  python servidor.py     ->  http://localhost:5000
La página React envía los movimientos reales y recibe KPIs, tablas HTML y gráficos.
"""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from reporte import reporte_admin, reporte_usuario


class Manejador(BaseHTTPRequestHandler):
    def _responder(self, codigo, cuerpo):
        datos = json.dumps(cuerpo).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")  # permite llamar desde Vite
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def do_OPTIONS(self):
        self._responder(204, {})

    def do_POST(self):
        try:
            largo = int(self.headers.get("Content-Length", 0))
            datos = json.loads(self.rfile.read(largo))
            if datos["rol"] == "admin":
                resultado = reporte_admin(datos["movimientos"], datos["totalUsuarios"])
            else:
                resultado = reporte_usuario(datos["movimientos"], datos["nombre"])
            self._responder(200, resultado)
        except Exception as error:
            self._responder(500, {"error": str(error)})


if __name__ == "__main__":
    print("Servidor de reportes en http://localhost:5000")
    ThreadingHTTPServer(("localhost", 5000), Manejador).serve_forever()
