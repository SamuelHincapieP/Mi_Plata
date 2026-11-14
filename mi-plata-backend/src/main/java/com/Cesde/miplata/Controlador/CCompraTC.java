package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Servicio.SCompraTC;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Lo que se ha comprado con una tarjeta de crédito
@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
@Tag(name = "Compras con tarjeta", description = "Compras realizadas con una tarjeta de crédito, con su categoría y cuotas")
public class CCompraTC {

    private final SCompraTC sCompraTC;

    public CCompraTC(SCompraTC sCompraTC) {
        this.sCompraTC = sCompraTC;
    }

    @GetMapping("/{numeroCuenta}")
    @Operation(summary = "Compras de una tarjeta", description = "Lista las compras de la tarjeta, de la más reciente a la más antigua")
    public ResponseEntity<?> porTarjeta(@PathVariable String numeroCuenta) {
        try {
            return ResponseEntity.ok(sCompraTC.consultaPorNumeroCuenta(numeroCuenta));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
