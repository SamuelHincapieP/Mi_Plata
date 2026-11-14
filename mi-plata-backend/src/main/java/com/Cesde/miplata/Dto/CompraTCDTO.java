package com.Cesde.miplata.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Una compra hecha con la tarjeta de crédito
public record CompraTCDTO(Integer codcompra, LocalDateTime fecha, String comercio,
        String categoria, BigDecimal monto, Integer cuotas, BigDecimal cuotamensual) {
}
