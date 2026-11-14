package com.Cesde.miplata.Repositorio;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface IMovimientosUsuarioProjection {
    // Metodos get (cada uno corresponde a un alias de la consulta nativa)
    String getNomusuario();
    String getEmailusuario();
    String getNumcuenta();
    String getTipocuenta();
    Integer getCodmovimiento();
    LocalDateTime getFechamov();
    BigDecimal getValormov();
    BigDecimal getSaldoposterior();
    String getTipomov();
}
