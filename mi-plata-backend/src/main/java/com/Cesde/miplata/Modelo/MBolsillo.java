package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bolsillo")
public class MBolsillo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Schema(description = "Llave primaria generada por la base de datos", example = "1")
    private Integer bolsilloID;

    @Column(nullable = false)
    @Schema(description = "Cuenta a la que pertenece el bolsillo (FK a cuenta)", example = "1")
    private Integer cuentaID;

    @Column(length = 40, nullable = false)
    @Schema(description = "Nombre del bolsillo (máximo 40 caracteres, único por cuenta)", example = "Mercado del mes")
    private String nombreBolsillo;

    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Dinero guardado en el bolsillo (sale del saldo de la cuenta)", example = "150000.00")
    private BigDecimal saldo;

    @Column(nullable = false)
    @Schema(description = "Fecha en que se creó el bolsillo", example = "2026-11-09T09:00:00")
    private LocalDateTime fechaCreacion;

    // Relación entre tablas: muchos bolsillos pertenecen a una cuenta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuenta;

    public MBolsillo() {
    }

    public Integer getBolsilloID() {
        return bolsilloID;
    }

    public void setBolsilloID(Integer bolsilloID) {
        this.bolsilloID = bolsilloID;
    }

    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public String getNombreBolsillo() {
        return nombreBolsillo;
    }

    public void setNombreBolsillo(String nombreBolsillo) {
        this.nombreBolsillo = nombreBolsillo;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public MCuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(MCuenta cuenta) {
        this.cuenta = cuenta;
    }
}
