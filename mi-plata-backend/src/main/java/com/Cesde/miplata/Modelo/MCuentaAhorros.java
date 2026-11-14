package com.Cesde.miplata.Modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "cuenta_ahorros")
public class MCuentaAhorros {
    // Atributos
    @Id
    private Integer cuentaID; // es la misma llave de la tabla cuenta (no se autogenera)

    @Column(nullable = false)
    private BigDecimal tasaInteres;

    // Encapsulamiento
    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public BigDecimal getTasaInteres() {
        return tasaInteres;
    }
    public void setTasaInteres(BigDecimal tasaInteres) {
        this.tasaInteres = tasaInteres;
    }
}
