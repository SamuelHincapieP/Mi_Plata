package com.Cesde.miplata.Modelo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "categoria_gasto")
public class MCategoriaGasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Schema(description = "Llave primaria del catálogo de categorías", example = "1")
    private Integer categoriaID;
    @Column(length = 40, nullable = false, unique = true)
    @Schema(description = "Nombre de la categoría de gasto", example = "Mercado")
    private String nombreCategoria;

    public MCategoriaGasto() {
    }

    public Integer getCategoriaID() {
        return categoriaID;
    }

    public void setCategoriaID(Integer categoriaID) {
        this.categoriaID = categoriaID;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

}
