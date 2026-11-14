package com.Cesde.miplata.Repositorio;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Cada getter corresponde a un alias (AS) de la consulta nativa de ICompraTC
public interface ICompraTCProjection {
    Integer getCodcompra();
    LocalDateTime getFecha();
    String getComercio();
    String getCategoria();
    BigDecimal getMonto();
    Integer getCuotas();
    BigDecimal getCuotamensual();
}
