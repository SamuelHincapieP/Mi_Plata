package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Servicio.SReporte;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@Tag(name = "Reportes", description = "Reportes generados por el servidor Python (Pandas + Matplotlib)")
@CrossOrigin(origins = "*")
public class CReporte {

    private final SReporte sReporte;

    public CReporte(SReporte sReporte) {
        this.sReporte = sReporte;
    }

    // Reporte general (administrador)
    @GetMapping("/admin")
    @Operation(summary = "Reporte general", description = "Reporte del banco para el administrador")
    public ResponseEntity<String> reporteAdmin() {
        return responder(true, null);
    }

    // Reporte de un cliente
    @GetMapping("/usuario")
    @Operation(summary = "Reporte de un cliente", description = "Reporte de las transacciones del usuario indicado")
    public ResponseEntity<String> reporteUsuario(@RequestParam String usuario) {
        return responder(false, usuario);
    }

    // Si algo falla responde un JSON con el error en vez de romper la aplicacion
    private ResponseEntity<String> responder(boolean esAdmin, String nombre) {
        try {
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON)
                    .body(sReporte.generarReporte(esAdmin, nombre));
        } catch (Exception error) {
            String mensaje = String.valueOf(error.getMessage()).replace("\\", " ").replace("\"", "'").replace("\n", " ");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + mensaje + "\"}");
        }
    }
}
