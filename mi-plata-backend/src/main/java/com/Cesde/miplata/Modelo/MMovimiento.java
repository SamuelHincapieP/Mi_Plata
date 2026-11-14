package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento")
public class MMovimiento {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer movimientoID;
    @Column(nullable = false)
    private BigDecimal montoMovimiento;
    @Column(nullable = false)
    private LocalDateTime fechaMovimiento;
    @Column(length = 300)
    private String descripcionMovimiento;
    @Column(nullable = false)
    private BigDecimal saldoPosterior;
    @Column(nullable = false)
    private Integer cuentaID;
    @Column(nullable = false)
    private Integer tipoID;

    // Relaciones entre tablas
    // Muchos movimientos pertenecen a una cuenta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuenta;

    // Muchos movimientos pertenecen a un tipo de movimiento
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipoID", insertable = false, updatable = false)
    @JsonIgnore
    private MTipoMovimiento tipoMovimiento;

    // Encapsulamiento
    public Integer getMovimientoID() {
        return movimientoID;
    }
    public void setMovimientoID(Integer movimientoID) {
        this.movimientoID = movimientoID;
    }

    public BigDecimal getMontoMovimiento() {
        return montoMovimiento;
    }
    public void setMontoMovimiento(BigDecimal montoMovimiento) {
        this.montoMovimiento = montoMovimiento;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }
    public void setFechaMovimiento(LocalDateTime fechaMovimiento) {
        this.fechaMovimiento = fechaMovimiento;
    }

    public String getDescripcionMovimiento() {
        return descripcionMovimiento;
    }
    public void setDescripcionMovimiento(String descripcionMovimiento) {
        this.descripcionMovimiento = descripcionMovimiento;
    }

    public BigDecimal getSaldoPosterior() {
        return saldoPosterior;
    }
    public void setSaldoPosterior(BigDecimal saldoPosterior) {
        this.saldoPosterior = saldoPosterior;
    }

    public Integer getCuentaID() {
        return cuentaID;
    }
    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public Integer getTipoID() {
        return tipoID;
    }
    public void setTipoID(Integer tipoID) {
        this.tipoID = tipoID;
    }

    public MCuenta getCuenta() {
        return cuenta;
    }
    public void setCuenta(MCuenta cuenta) {
        this.cuenta = cuenta;
    }

    public MTipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }
    public void setTipoMovimiento(MTipoMovimiento tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }
}
