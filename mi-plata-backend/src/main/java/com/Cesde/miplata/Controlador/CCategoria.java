package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Servicio.SCategoria;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Catálogo de categorías de gasto (menú desplegable de compras)
@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
@Tag(name = "Categorías de gasto", description = "Catálogo de categorías para clasificar las compras con tarjeta")
public class CCategoria {

    private final SCategoria sCategoria;

    public CCategoria(SCategoria sCategoria) {
        this.sCategoria = sCategoria;
    }

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Devuelve todas las categorías de gasto disponibles")
    public ResponseEntity<?> listar() {
        try {
            return ResponseEntity.ok(sCategoria.consultaGeneral());
        } catch (Exception error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        }
    }
}
