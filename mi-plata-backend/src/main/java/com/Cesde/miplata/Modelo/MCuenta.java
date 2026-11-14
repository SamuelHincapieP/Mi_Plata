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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cuenta")
public class MCuenta {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cuentaID;
    @Column(length = 20, nullable = false, unique = true)
    private String numeroCuenta;
    @Column(nullable = false)
    private BigDecimal saldo;
    @Column(length = 20, nullable = false)
    private String estado;
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    @Column(nullable = false)
    private Integer usuarioID;
    @Column(nullable = false)
    private Integer tipoCuentaID;

    // Relaciones entre tablas
    // Muchas cuentas pertenecen a un usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuarioID", insertable = false, updatable = false)
    @JsonIgnore
    private MUsuario usuario;

    // Muchas cuentas pertenecen a un tipo de cuenta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipoCuentaID", insertable = false, updatable = false)
    @JsonIgnore
    private MTipoCuenta tipoCuenta;

    // Una cuenta tiene muchos movimientos, bolsillos, metas y compras
    @OneToMany(mappedBy = "cuenta")
    @OrderBy("fechaMovimiento ASC, movimientoID ASC")
    @JsonIgnore
    private List<MMovimiento> movimientos;

    @OneToMany(mappedBy = "cuenta")
    @OrderBy("bolsilloID ASC")
    @JsonIgnore
    private List<MBolsillo> bolsillos;

    @OneToMany(mappedBy = "cuenta")
    @OrderBy("metaID ASC")
    @JsonIgnore
    private List<MMetaAhorro> metas;

    @OneToMany(mappedBy = "cuenta")
    @OrderBy("fechaCompra DESC, compraID DESC")
    @JsonIgnore
    private List<MCompraTC> compras;

    @OneToMany(mappedBy = "cuentaOrigen")
    @JsonIgnore
    private List<MTransferencia> transferenciasEnviadas;

    @OneToMany(mappedBy = "cuentaDestino")
    @JsonIgnore
    private List<MTransferencia> transferenciasRecibidas;

    // Encapsulamiento
    public Integer getCuentaID() {
        return cuentaID;
    }
    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }
    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }
    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Integer getUsuarioID() {
        return usuarioID;
    }
    public void setUsuarioID(Integer usuarioID) {
        this.usuarioID = usuarioID;
    }

    public Integer getTipoCuentaID() {
        return tipoCuentaID;
    }
    public void setTipoCuentaID(Integer tipoCuentaID) {
        this.tipoCuentaID = tipoCuentaID;
    }

    public MUsuario getUsuario() {
        return usuario;
    }
    public void setUsuario(MUsuario usuario) {
        this.usuario = usuario;
    }

    public MTipoCuenta getTipoCuenta() {
        return tipoCuenta;
    }
    public void setTipoCuenta(MTipoCuenta tipoCuenta) {
        this.tipoCuenta = tipoCuenta;
    }

    public List<MMovimiento> getMovimientos() {
        return movimientos;
    }
    public void setMovimientos(List<MMovimiento> movimientos) {
        this.movimientos = movimientos;
    }

    public List<MBolsillo> getBolsillos() {
        return bolsillos;
    }
    public void setBolsillos(List<MBolsillo> bolsillos) {
        this.bolsillos = bolsillos;
    }

    public List<MMetaAhorro> getMetas() {
        return metas;
    }
    public void setMetas(List<MMetaAhorro> metas) {
        this.metas = metas;
    }

    public List<MCompraTC> getCompras() {
        return compras;
    }
    public void setCompras(List<MCompraTC> compras) {
        this.compras = compras;
    }

    public List<MTransferencia> getTransferenciasEnviadas() {
        return transferenciasEnviadas;
    }
    public void setTransferenciasEnviadas(List<MTransferencia> transferenciasEnviadas) {
        this.transferenciasEnviadas = transferenciasEnviadas;
    }

    public List<MTransferencia> getTransferenciasRecibidas() {
        return transferenciasRecibidas;
    }
    public void setTransferenciasRecibidas(List<MTransferencia> transferenciasRecibidas) {
        this.transferenciasRecibidas = transferenciasRecibidas;
    }
}
