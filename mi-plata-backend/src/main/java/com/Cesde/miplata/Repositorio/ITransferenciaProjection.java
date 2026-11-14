package com.Cesde.miplata.Repositorio;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Cada getter corresponde a un alias (AS) de la consulta nativa de ITransferencia
public interface ITransferenciaProjection {
    Integer getTransferenciaid();
    LocalDateTime getFecha();
    BigDecimal getMonto();
    String getMensaje();
    String getCuentaorigen();
    String getCuentadestino();
    String getNombreorigen();
    String getNombredestino();
    String getSentido();
}
