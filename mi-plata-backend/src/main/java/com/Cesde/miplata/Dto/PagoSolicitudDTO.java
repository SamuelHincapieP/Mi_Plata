package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de POST /api/operaciones/pagar: la TC destino y la cuenta de origen.
public record PagoSolicitudDTO(String numeroCuenta, String cuentaOrigen, BigDecimal monto) {
}
