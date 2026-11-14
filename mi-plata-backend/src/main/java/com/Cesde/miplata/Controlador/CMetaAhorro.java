package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Dto.MetaSolicitudDTO;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Servicio.SMetaAhorro;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Metas de ahorro asociadas a una cuenta de ahorros
@RestController
@RequestMapping("/api/metas")
@CrossOrigin(origins = "*")
@Tag(name = "Metas de ahorro", description = "Crear, consultar y eliminar metas. Para aportar o retirar dinero ver /api/operaciones/meta")
public class CMetaAhorro {

    private final SMetaAhorro sMetaAhorro;

    public CMetaAhorro(SMetaAhorro sMetaAhorro) {
        this.sMetaAhorro = sMetaAhorro;
    }

    @PostMapping
    @Operation(summary = "Crear meta de ahorro",
               description = "Cuerpo: numeroCuenta, nombreMeta, montoObjetivo, fechaObjetivo (yyyy-mm-dd, no anterior a hoy)")
    public ResponseEntity<?> crear(@RequestBody MetaSolicitudDTO datos) {
        try {
            return ResponseEntity.ok(sMetaAhorro.adicionar(
                    datos.numeroCuenta(), datos.nombreMeta(),
                    datos.montoObjetivo(), datos.fechaObjetivo()));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }

    @GetMapping("/cuenta/{numeroCuenta}")
    @Operation(summary = "Metas de una cuenta", description = "Lista las metas de una cuenta de ahorros")
    public ResponseEntity<?> porCuenta(@PathVariable String numeroCuenta) {
        try {
            return ResponseEntity.ok(sMetaAhorro.consultaPorNumeroCuenta(numeroCuenta));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }

    @DeleteMapping("/{metaID}")
    @Operation(summary = "Eliminar meta", description = "Elimina una meta por su llave primaria, solo si no tiene dinero ahorrado")
    public ResponseEntity<?> eliminar(@PathVariable Integer metaID) {
        try {
            return ResponseEntity.ok(sMetaAhorro.eliminar(metaID));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
