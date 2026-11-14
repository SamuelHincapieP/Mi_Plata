package com.Cesde.miplata.Dto;

import java.util.List;

// Cuerpo de POST /api/clientes y PUT /api/clientes/{id}
public record ClienteDTO(String cedula, String nombre, String celular, String usuario,
                         String contrasena, String rol, List<String> productos) {
}
