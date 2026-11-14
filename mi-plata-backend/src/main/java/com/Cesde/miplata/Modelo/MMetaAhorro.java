package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meta_ahorro")
public class MMetaAhorro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Schema(description = "Llave primaria de la meta de ahorro", example = "1")
    private Integer metaID;
    @Column(nullable = false)
    @Schema(description = "Cuenta de ahorros a la que pertenece la meta (FK a cuenta)", example = "1")
    private Integer cuentaID;
    @Column(length = 60, nullable = false)
    @Schema(description = "Nombre de la meta", example = "Viaje a Cartagena")
    private String nombreMeta;
    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Monto que se quiere ahorrar", example = "2000000.00")
    private BigDecimal montoObjetivo;

    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Dinero que el cliente ha aportado a la meta (sale de su cuenta de ahorros)", example = "350000.00")
    private BigDecimal montoAhorrado;
    @Column(nullable = false)
    @Schema(description = "Fecha límite para alcanzar la meta (no puede ser anterior a hoy)", example = "2027-06-30")
    private LocalDate fechaObjetivo;
    @Column(nullable = false)
    @Schema(description = "Fecha en que se creó la meta", example = "2026-11-09T09:00:00")
    private LocalDateTime fechaCreacion;

    // Relación entre tablas: muchas metas pertenecen a una cuenta de ahorros
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuenta;

    public MMetaAhorro() {
    }

    public Integer getMetaID() {
        return metaID;
    }

    public void setMetaID(Integer metaID) {
        this.metaID = metaID;
    }

    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public String getNombreMeta() {
        return nombreMeta;
    }

    public void setNombreMeta(String nombreMeta) {
        this.nombreMeta = nombreMeta;
    }

    public BigDecimal getMontoAhorrado() {
        return montoAhorrado;
    }

    public void setMontoAhorrado(BigDecimal montoAhorrado) {
        this.montoAhorrado = montoAhorrado;
    }

    public BigDecimal getMontoObjetivo() {
        return montoObjetivo;
    }

    public void setMontoObjetivo(BigDecimal montoObjetivo) {
        this.montoObjetivo = montoObjetivo;
    }

    public LocalDate getFechaObjetivo() {
        return fechaObjetivo;
    }

    public void setFechaObjetivo(LocalDate fechaObjetivo) {
        this.fechaObjetivo = fechaObjetivo;
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
