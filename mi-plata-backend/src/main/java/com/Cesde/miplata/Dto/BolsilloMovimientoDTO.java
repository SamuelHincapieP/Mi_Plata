package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de depositar o retirar dinero de un bolsillo.
public record BolsilloMovimientoDTO(String numeroCuenta, Integer bolsilloID, BigDecimal monto) {
}
