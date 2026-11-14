package com.Cesde.miplata.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

// Cuenta tal como la espera React. Los campos que no aplican (por ejemplo _cupo en ahorros)
// quedan en null y NO se envian gracias a @JsonInclude(NON_NULL).
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CuentaBancoDTO(
        @JsonProperty("_tipo") String tipo,
        @JsonProperty("_numeroCuenta") String numeroCuenta,
        @JsonProperty("_fechaApertura") String fechaApertura,
        @JsonProperty("_estado") String estado,
        @JsonProperty("_tasaInteres") BigDecimal tasaInteres,
        @JsonProperty("_porcentajeSobregiro") BigDecimal porcentajeSobregiro,
        @JsonProperty("_limiteSobregiro") BigDecimal limiteSobregiro,
        @JsonProperty("_cupo") BigDecimal cupo,
        @JsonProperty("_deuda") BigDecimal deuda,
        @JsonProperty("_saldo") BigDecimal saldo,
        @JsonProperty("_movimientos") List<MovimientoBancoDTO> movimientos) {
}
