package com.Cesde.miplata.Modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tipo_cuenta")
public class MTipoCuenta {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tipoCuentaID;
    @Column(length = 40, nullable = false)
    private String nombreTipo;
    @Column(length = 200)
    private String descripcionTipo;

    // Relaciones entre tablas

    // Encapsulamiento
    public Integer getTipoCuentaID() {
        return tipoCuentaID;
    }
    public void setTipoCuentaID(Integer tipoCuentaID) {
        this.tipoCuentaID = tipoCuentaID;
    }

    public String getNombreTipo() {
        return nombreTipo;
    }
    public void setNombreTipo(String nombreTipo) {
        this.nombreTipo = nombreTipo;
    }

    public String getDescripcionTipo() {
        return descripcionTipo;
    }
    public void setDescripcionTipo(String descripcionTipo) {
        this.descripcionTipo = descripcionTipo;
    }
}
