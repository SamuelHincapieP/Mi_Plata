package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transferencia")
public class MTransferencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Schema(description = "Llave primaria generada por la base de datos", example = "1")
    private Integer transferenciaID;
    @Column(nullable = false)
    @Schema(description = "Cuenta que envía el dinero (FK a cuenta)", example = "2")
    private Integer cuentaOrigenID;
    @Column(nullable = false)
    @Schema(description = "Cuenta que recibe el dinero (FK a cuenta)", example = "4")
    private Integer cuentaDestinoID;
    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Valor transferido en pesos", example = "200000.00")
    private BigDecimal monto;
    @Column(length = 200)
    @Schema(description = "Mensaje opcional que deja quien envía (máximo 200 caracteres)", example = "Pago del arriendo")
    private String mensaje;
    @Column(nullable = false)
    @Schema(description = "Fecha y hora en que se hizo la transferencia", example = "2026-11-09T10:30:00")
    private LocalDateTime fechaTransferencia;

    // Relación entre tablas: cada transferencia tiene una cuenta de origen y una de destino
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaOrigenID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuentaOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaDestinoID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuentaDestino;

    public MTransferencia() {
    }

    public Integer getTransferenciaID() {
        return transferenciaID;
    }

    public void setTransferenciaID(Integer transferenciaID) {
        this.transferenciaID = transferenciaID;
    }

    public Integer getCuentaOrigenID() {
        return cuentaOrigenID;
    }

    public void setCuentaOrigenID(Integer cuentaOrigenID) {
        this.cuentaOrigenID = cuentaOrigenID;
    }

    public Integer getCuentaDestinoID() {
        return cuentaDestinoID;
    }

    public void setCuentaDestinoID(Integer cuentaDestinoID) {
        this.cuentaDestinoID = cuentaDestinoID;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFechaTransferencia() {
        return fechaTransferencia;
    }

    public void setFechaTransferencia(LocalDateTime fechaTransferencia) {
        this.fechaTransferencia = fechaTransferencia;
    }

    public MCuenta getCuentaOrigen() {
        return cuentaOrigen;
    }

    public void setCuentaOrigen(MCuenta cuentaOrigen) {
        this.cuentaOrigen = cuentaOrigen;
    }

    public MCuenta getCuentaDestino() {
        return cuentaDestino;
    }

    public void setCuentaDestino(MCuenta cuentaDestino) {
        this.cuentaDestino = cuentaDestino;
    }

}
