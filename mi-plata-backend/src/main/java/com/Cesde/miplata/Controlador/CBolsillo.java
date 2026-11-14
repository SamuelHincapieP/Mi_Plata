package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Dto.BolsilloSolicitudDTO;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Servicio.SBolsillo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Bolsillos: apartados de dinero dentro de una cuenta (como en Nequi)
@RestController
@RequestMapping("/api/bolsillos")
@CrossOrigin(origins = "*")
@Tag(name = "Bolsillos", description = "Crear, consultar y eliminar bolsillos. Para mover dinero ver /api/operaciones/bolsillo")
public class CBolsillo {

    private final SBolsillo sBolsillo;

    public CBolsillo(SBolsillo sBolsillo) {
        this.sBolsillo = sBolsillo;
    }

    @PostMapping
    @Operation(summary = "Crear bolsillo", description = "Cuerpo: numeroCuenta y nombreBolsillo (máximo 40 caracteres). No aplica a tarjetas de crédito")
    public ResponseEntity<?> crear(@RequestBody BolsilloSolicitudDTO datos) {
        try {
            return ResponseEntity.ok(sBolsillo.adicionar(
                    datos.numeroCuenta(), datos.nombreBolsillo()));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }

    @GetMapping("/cuenta/{numeroCuenta}")
    @Operation(summary = "Bolsillos de una cuenta", description = "Lista los bolsillos con su saldo")
    public ResponseEntity<?> porCuenta(@PathVariable String numeroCuenta) {
        try {
            return ResponseEntity.ok(sBolsillo.consultaPorNumeroCuenta(numeroCuenta));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }

    @DeleteMapping("/{bolsilloID}")
    @Operation(summary = "Eliminar bolsillo", description = "Solo se elimina si no tiene dinero guardado")
    public ResponseEntity<?> eliminar(@PathVariable Integer bolsilloID) {
        try {
            return ResponseEntity.ok(sBolsillo.eliminar(bolsilloID));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
