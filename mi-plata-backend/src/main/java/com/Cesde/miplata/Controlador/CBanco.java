package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Servicio.SBanco;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Lectura de los clientes con sus cuentas y movimientos (base de datos)
@RestController
@RequestMapping("/api/banco")
@CrossOrigin(origins = "*")
@Tag(name = "Banco", description = "Lectura del estado completo del banco desde la base de datos")
public class CBanco {

    private final SBanco sBanco;

    public CBanco(SBanco sBanco) {
        this.sBanco = sBanco;
    }

    @GetMapping("/clientes")
    @Operation(summary = "Listar clientes", description = "Devuelve todos los clientes con sus cuentas y movimientos")
    public ResponseEntity<?> leer() {
        try {
            return ResponseEntity.ok(sBanco.leerClientes());
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(RespuestaOperacion.error("No fue posible consultar el banco en este momento."));
        }
    }
}
