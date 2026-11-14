package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MMovimiento;
import com.Cesde.miplata.Modelo.MTipoCuenta;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.IUsuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

// Lee los movimientos reales de la base de datos (con las relaciones de las entidades)
// y se los envia a Python (Pandas + Matplotlib).
@Service
public class SReporte {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final IMovimiento iMovimiento;
    private final IUsuario iUsuario;

    @Value("${python.reportes.url}")
    private String urlPython;

    public SReporte(IMovimiento iMovimiento, IUsuario iUsuario) {
        this.iMovimiento = iMovimiento;
        this.iUsuario = iUsuario;
    }

    // Reporte del administrador (todo el banco) o de un cliente (por su usuario de la pagina).
    // La transaccion permite leer las relaciones lazy (cuenta, usuario, tipo de cuenta) al armar el JSON.
    @Transactional(readOnly = true)
    public String generarReporte(boolean esAdmin, String nombre) throws Exception {
        try {
            List<MMovimiento> movimientos = esAdmin
                    ? iMovimiento.findAllByOrderByFechaMovimientoAsc()
                    : iMovimiento.findByCuenta_Usuario_UsuarioLoginOrderByFechaMovimientoAsc(nombre);

            long clientes = iUsuario.countByRol("cliente");

            StringBuilder json = new StringBuilder("{");
            json.append("\"rol\":\"").append(esAdmin ? "admin" : "cliente").append("\",");
            json.append("\"nombre\":").append(texto(nombre)).append(",");
            json.append("\"totalUsuarios\":").append(clientes).append(",");
            json.append("\"movimientos\":[");
            for (int i = 0; i < movimientos.size(); i++) {
                MMovimiento movimiento = movimientos.get(i);
                if (i > 0) json.append(",");
                json.append("{\"fecha\":").append(texto(fecha(movimiento.getFechaMovimiento())))
                        .append(",\"tipo\":").append(texto(nombreTipoMovimiento(movimiento)))
                        .append(",\"monto\":").append(monto(movimiento.getMontoMovimiento()))
                        .append(",\"nombre\":").append(texto(nombreUsuario(movimiento)))
                        .append(",\"cuenta\":").append(texto(numeroCuenta(movimiento)))
                        .append(",\"tipoCuenta\":").append(texto(nombreTipoCuenta(movimiento)))
                        .append(",\"nombreCuenta\":").append(texto(nombreTipoCuenta(movimiento))).append("}");
            }
            json.append("]}");
            return enviarAPython(json.toString());
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // ── Datos de un movimiento usando las relaciones de la entidad ──

    private static MCuenta cuenta(MMovimiento movimiento) {
        return movimiento.getCuenta();
    }

    private static String nombreTipoMovimiento(MMovimiento movimiento) {
        return movimiento.getTipoMovimiento() == null ? "" : movimiento.getTipoMovimiento().getNombreTipo();
    }

    private static String nombreUsuario(MMovimiento movimiento) {
        MCuenta cuenta = cuenta(movimiento);
        return cuenta == null || cuenta.getUsuario() == null ? "" : cuenta.getUsuario().getNombre();
    }

    private static String numeroCuenta(MMovimiento movimiento) {
        MCuenta cuenta = cuenta(movimiento);
        return cuenta == null ? "" : cuenta.getNumeroCuenta();
    }

    // Nombre del tipo de cuenta; si la relacion no esta cargada se deduce del ID.
    private static String nombreTipoCuenta(MMovimiento movimiento) {
        MCuenta cuenta = cuenta(movimiento);
        if (cuenta == null) return "";
        MTipoCuenta tipoCuenta = cuenta.getTipoCuenta();
        if (tipoCuenta != null && tipoCuenta.getNombreTipo() != null)
            return tipoCuenta.getNombreTipo();
        return switch (cuenta.getTipoCuentaID()) {
            case 1 -> "Ahorros";
            case 2 -> "Corriente";
            default -> "Credito";
        };
    }

    private static String fecha(LocalDateTime valor) {
        return valor == null ? null : valor.format(FECHA);
    }

    private static String monto(BigDecimal valor) {
        return valor == null ? "0" : valor.toPlainString();
    }

    // Llama al servidor de Python y devuelve el reporte (JSON)
    private String enviarAPython(String json) throws Exception {
        try {
            HttpRequest peticion = HttpRequest.newBuilder(URI.create(urlPython))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> respuesta = HttpClient.newHttpClient()
                    .send(peticion, HttpResponse.BodyHandlers.ofString());
            if (respuesta.statusCode() != 200)
                throw new Exception("Python respondio con error: " + respuesta.body());
            return respuesta.body();
        } catch (Exception error) {
            throw new Exception("No se pudo contactar el servidor de reportes (python servidor.py): " + error.getMessage());
        }
    }

    // Convierte un valor en texto JSON escapando comillas y saltos de linea
    private static String texto(String valor) {
        if (valor == null) return "null";
        String s = valor.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", " ").replace("\r", " ");
        return "\"" + s + "\"";
    }
}
