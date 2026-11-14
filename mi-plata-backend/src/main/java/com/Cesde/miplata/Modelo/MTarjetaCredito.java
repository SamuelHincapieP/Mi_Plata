package com.Cesde.miplata.Modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "tarjeta_credito")
public class MTarjetaCredito {
    // Atributos
    @Id
    private Integer cuentaID; // es la misma llave de la tabla cuenta (no se autogenera)

    @Column(nullable = false)
    private BigDecimal cupo;
    @Column(nullable = false)
    private BigDecimal deuda;
    @Column(nullable = false)
    private Integer numeroCuotas;
    @Column(nullable = false)
    private BigDecimal tasaMensual;

    // Encapsulamiento
    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public BigDecimal getCupo() {
        return cupo;
    }
    public void setCupo(BigDecimal cupo) {
        this.cupo = cupo;
    }

    public BigDecimal getDeuda() {
        return deuda;
    }
    public void setDeuda(BigDecimal deuda) {
        this.deuda = deuda;
    }

    public Integer getNumeroCuotas() {
        return numeroCuotas;
    }
    public void setNumeroCuotas(Integer numeroCuotas) {
        this.numeroCuotas = numeroCuotas;
    }

    public BigDecimal getTasaMensual() {
        return tasaMensual;
    }
    public void setTasaMensual(BigDecimal tasaMensual) {
        this.tasaMensual = tasaMensual;
    }
}
