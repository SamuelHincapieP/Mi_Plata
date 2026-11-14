package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de POST /api/operaciones/transferir
public record TransferenciaSolicitudDTO(String origen, String destino, BigDecimal monto, String mensaje) {
}
