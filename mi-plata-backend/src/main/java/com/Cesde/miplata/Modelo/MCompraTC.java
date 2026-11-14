package com.Cesde.miplata.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "compra_tc")
public class MCompraTC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Schema(description = "Llave primaria de la compra", example = "1")
    private Integer compraID;
    @Column(nullable = false)
    @Schema(description = "Tarjeta de crédito donde se hizo la compra (FK a cuenta)", example = "5")
    private Integer cuentaID;
    @Column(nullable = false)
    @Schema(description = "Categoría del gasto (FK a categoria_gasto)", example = "1")
    private Integer categoriaID;
    @Column(length = 120, nullable = false)
    @Schema(description = "Dónde se hizo la compra o qué se compró", example = "Almacén Éxito - Zapatos")
    private String comercio;
    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Valor de la compra sin manejo", example = "300000.00")
    private BigDecimal monto;
    @Column(nullable = false)
    @Schema(description = "Número de cuotas en que se pagará", example = "3")
    private Integer cuotas;
    @Column(nullable = false, precision = 18, scale = 2)
    @Schema(description = "Valor de cada cuota mensual", example = "104000.00")
    private BigDecimal cuotaMensual;
    @Column(nullable = false)
    @Schema(description = "Fecha y hora de la compra", example = "2026-11-09T12:00:00")
    private LocalDateTime fechaCompra;

    // Relación entre tablas: muchas compras pertenecen a una tarjeta de crédito
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuentaID", insertable = false, updatable = false)
    @JsonIgnore
    private MCuenta cuenta;

    // Relación entre tablas: muchas compras pertenecen a una categoría de gasto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoriaID", insertable = false, updatable = false)
    @JsonIgnore
    private MCategoriaGasto categoria;

    public MCompraTC() {
    }

    public Integer getCompraID() {
        return compraID;
    }

    public void setCompraID(Integer compraID) {
        this.compraID = compraID;
    }

    public Integer getCuentaID() {
        return cuentaID;
    }

    public void setCuentaID(Integer cuentaID) {
        this.cuentaID = cuentaID;
    }

    public Integer getCategoriaID() {
        return categoriaID;
    }

    public void setCategoriaID(Integer categoriaID) {
        this.categoriaID = categoriaID;
    }

    public String getComercio() {
        return comercio;
    }

    public void setComercio(String comercio) {
        this.comercio = comercio;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public Integer getCuotas() {
        return cuotas;
    }

    public void setCuotas(Integer cuotas) {
        this.cuotas = cuotas;
    }

    public BigDecimal getCuotaMensual() {
        return cuotaMensual;
    }

    public void setCuotaMensual(BigDecimal cuotaMensual) {
        this.cuotaMensual = cuotaMensual;
    }

    public LocalDateTime getFechaCompra() {
        return fechaCompra;
    }

    public void setFechaCompra(LocalDateTime fechaCompra) {
        this.fechaCompra = fechaCompra;
    }

    public MCuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(MCuenta cuenta) {
        this.cuenta = cuenta;
    }

    public MCategoriaGasto getCategoria() {
        return categoria;
    }

    public void setCategoria(MCategoriaGasto categoria) {
        this.categoria = categoria;
    }

}
