package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de POST /api/operaciones/comprar
public record CompraSolicitudDTO(String numeroCuenta, BigDecimal monto, Integer cuotas,
                                 String comercio, Integer categoriaID) {
}
