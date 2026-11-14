package com.Cesde.miplata.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MovimientosCuentaDTO {
    // Atributos
    private Integer movimientoID;
    private LocalDateTime fechaMovimiento;
    private BigDecimal montoMovimiento;
    private String descripcionMovimiento;
    private BigDecimal saldoPosterior;
    private String numeroCuenta;
    private String tipoMovimiento;

    // Constructores
    public MovimientosCuentaDTO(Integer movimientoID, LocalDateTime fechaMovimiento, BigDecimal montoMovimiento,
                                String descripcionMovimiento, BigDecimal saldoPosterior, String numeroCuenta,
                                String tipoMovimiento) {
        this.movimientoID = movimientoID;
        this.fechaMovimiento = fechaMovimiento;
        this.montoMovimiento = montoMovimiento;
        this.descripcionMovimiento = descripcionMovimiento;
        this.saldoPosterior = saldoPosterior;
        this.numeroCuenta = numeroCuenta;
        this.tipoMovimiento = tipoMovimiento;
    }
    public MovimientosCuentaDTO() {
    }

    // Encapsulamiento
    public Integer getMovimientoID() {
        return movimientoID;
    }
    public void setMovimientoID(Integer movimientoID) {
        this.movimientoID = movimientoID;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }
    public void setFechaMovimiento(LocalDateTime fechaMovimiento) {
        this.fechaMovimiento = fechaMovimiento;
    }

    public BigDecimal getMontoMovimiento() {
        return montoMovimiento;
    }
    public void setMontoMovimiento(BigDecimal montoMovimiento) {
        this.montoMovimiento = montoMovimiento;
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

    public String getNumeroCuenta() {
        return numeroCuenta;
    }
    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public String getTipoMovimiento() {
        return tipoMovimiento;
    }
    public void setTipoMovimiento(String tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }
}
