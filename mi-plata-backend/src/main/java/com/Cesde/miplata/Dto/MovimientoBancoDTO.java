package com.Cesde.miplata.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

// Movimiento tal como lo espera React.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MovimientoBancoDTO(
        @JsonProperty("_id") Long id,
        @JsonProperty("_fechaHora") String fechaHora,
        @JsonProperty("_tipo") String tipo,
        @JsonProperty("_valor") BigDecimal valor,
        @JsonProperty("_saldoPosterior") BigDecimal saldoPosterior,
        @JsonProperty("_descripcion") String descripcion) {
}
