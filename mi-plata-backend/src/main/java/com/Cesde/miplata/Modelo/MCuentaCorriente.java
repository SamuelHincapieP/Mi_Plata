package com.Cesde.miplata.Modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "cuenta_corriente")
public class MCuentaCorriente {
    // Atributos
    @Id
    private Integer cuentaID; // es la misma llave de la tabla cuenta (no se autogenera)

    @Column(nullable = false)
    private BigDecimal porcentajeSobregiro;
    @Column(nullable = false)
    private BigDecimal limiteSobregiro;

    // Encapsulamiento
    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public BigDecimal getPorcentajeSobregiro() {
        return porcentajeSobregiro;
    }
    public void setPorcentajeSobregiro(BigDecimal porcentajeSobregiro) {
        this.porcentajeSobregiro = porcentajeSobregiro;
    }

    public BigDecimal getLimiteSobregiro() {
        return limiteSobregiro;
    }
    public void setLimiteSobregiro(BigDecimal limiteSobregiro) {
        this.limiteSobregiro = limiteSobregiro;
    }
}
