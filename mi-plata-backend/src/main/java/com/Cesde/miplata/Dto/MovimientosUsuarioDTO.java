package com.Cesde.miplata.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimientosUsuarioDTO(String nombreUsuario, String emailUsuario,
       String numeroCuenta, String tipoCuenta, Integer movimientoID,
       LocalDateTime fechaMovimiento, BigDecimal montoMovimiento,
       BigDecimal saldoPosterior, String tipoMovimiento) {
}
