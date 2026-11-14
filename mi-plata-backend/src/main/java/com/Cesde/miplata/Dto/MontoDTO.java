package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de consignar y retirar: { numeroCuenta, monto }
public record MontoDTO(String numeroCuenta, BigDecimal monto) {
}
