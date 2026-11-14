package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Servicio.STransferencia;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Resumen de transferencias de un usuario: quién envió, quién recibió, monto y mensaje
@RestController
@RequestMapping("/api/transferencias")
@CrossOrigin(origins = "*")
@Tag(name = "Transferencias", description = "Resumen de transferencias enviadas y recibidas con su mensaje")
public class CTransferencia {

    private final STransferencia sTransferencia;

    public CTransferencia(STransferencia sTransferencia) {
        this.sTransferencia = sTransferencia;
    }

    @GetMapping("/usuario/{usuarioID}")
    @Operation(summary = "Transferencias de un usuario",
               description = "Devuelve las transferencias enviadas (ENVIADA) y recibidas (RECIBIDA) del usuario")
    public ResponseEntity<?> porUsuario(@PathVariable Integer usuarioID) {
        try {
            return ResponseEntity.ok(sTransferencia.consultaPorUsuario(usuarioID));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
