package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Servicio.SUsuario;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Consultas de los movimientos de un usuario (Projection + Mapper + DTO record)
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "Consulta de los movimientos de un usuario en todas sus cuentas")
public class CUsuario {

    private final SUsuario sUsuario;

    public CUsuario(SUsuario sUsuario) {
        this.sUsuario = sUsuario;
    }

    @GetMapping("/{usuarioID}/movimientos")
    @Operation(summary = "Movimientos de un usuario",
               description = "Lista cada movimiento de todas las cuentas del usuario, del más reciente al más antiguo")
    public ResponseEntity<?> movimientos(@PathVariable Integer usuarioID) {
        try {
            return ResponseEntity.ok(sUsuario.obtenerMovimientosUsuarioDTO(usuarioID));
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
