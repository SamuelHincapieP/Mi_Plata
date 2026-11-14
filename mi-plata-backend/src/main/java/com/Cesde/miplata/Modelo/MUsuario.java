package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuario")
public class MUsuario {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer usuarioID;
    @Column(length = 120, nullable = false)
    private String nombre;
    @Column(length = 180, nullable = false, unique = true)
    private String email;
    @Column(length = 255, nullable = false)
    private String clave;
    @Column(nullable = false)
    private Byte intentosFallidos;
    @Column(nullable = false)
    private Boolean cuentaBloqueada;
    @Column(length = 20, nullable = false)
    private String rol;
    @Column(length = 20)
    private String identificacion;
    @Column(length = 20)
    private String celular;
    @Column(length = 40)
    private String usuarioLogin;
    @Column
    private LocalDateTime fechaRegistro;

    // Relaciones entre tablas: un usuario tiene muchas cuentas
    @OneToMany(mappedBy = "usuario")
    @OrderBy("cuentaID ASC")
    @JsonIgnore
    private List<MCuenta> cuentas;

    // Encapsulamiento
    public Integer getUsuarioID() {
        return usuarioID;
    }
    public void setUsuarioID(Integer usuarioID) {
        this.usuarioID = usuarioID;
    }

    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getClave() {
        return clave;
    }
    public void setClave(String clave) {
        this.clave = clave;
    }

    public Byte getIntentosFallidos() {
        return intentosFallidos;
    }
    public void setIntentosFallidos(Byte intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public Boolean getCuentaBloqueada() {
        return cuentaBloqueada;
    }
    public void setCuentaBloqueada(Boolean cuentaBloqueada) {
        this.cuentaBloqueada = cuentaBloqueada;
    }

    public String getRol() {
        return rol;
    }
    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getIdentificacion() {
        return identificacion;
    }
    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getCelular() {
        return celular;
    }
    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getUsuarioLogin() {
        return usuarioLogin;
    }
    public void setUsuarioLogin(String usuarioLogin) {
        this.usuarioLogin = usuarioLogin;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public List<MCuenta> getCuentas() {
        return cuentas;
    }
    public void setCuentas(List<MCuenta> cuentas) {
        this.cuentas = cuentas;
    }
}
