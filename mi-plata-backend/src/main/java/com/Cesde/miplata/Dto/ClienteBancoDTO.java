package com.Cesde.miplata.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// Cliente tal como lo espera React (los nombres llevan guion bajo).
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ClienteBancoDTO(
        @JsonProperty("_id") Integer id,
        @JsonProperty("_identificacion") String identificacion,
        @JsonProperty("_nombreCompleto") String nombreCompleto,
        @JsonProperty("_celular") String celular,
        @JsonProperty("_usuario") String usuario,
        @JsonProperty("_contrasena") String contrasena,
        @JsonProperty("_fechaRegistro") String fechaRegistro,
        @JsonProperty("_rol") String rol,
        @JsonProperty("_intentosFallidos") Integer intentosFallidos,
        @JsonProperty("_bloqueado") Boolean bloqueado,
        @JsonProperty("_cuentas") List<CuentaBancoDTO> cuentas) {
}
