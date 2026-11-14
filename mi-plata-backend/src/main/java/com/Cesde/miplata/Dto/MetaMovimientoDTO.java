package com.Cesde.miplata.Dto;

import java.math.BigDecimal;

// Cuerpo de aportar o retirar dinero de una meta de ahorro.
public record MetaMovimientoDTO(String numeroCuenta, Integer metaID, BigDecimal monto) {
}
