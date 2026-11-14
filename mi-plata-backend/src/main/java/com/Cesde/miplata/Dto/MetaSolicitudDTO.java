package com.Cesde.miplata.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// Cuerpo de POST /api/metas
public record MetaSolicitudDTO(String numeroCuenta, String nombreMeta,
                               BigDecimal montoObjetivo, LocalDate fechaObjetivo) {
}
