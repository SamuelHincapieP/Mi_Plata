package com.Cesde.miplata.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

// Respuesta de una operacion bancaria o de administracion de clientes.
// Solo se envian los campos que tienen valor (los null no aparecen en el JSON),
// asi se conserva exactamente el contrato que ya usa React.
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RespuestaOperacion {

    private Boolean ok;
    private String error;
    private BigDecimal monto;
    private Integer cuotas;
    private BigDecimal cuotaMensual;
    private BigDecimal deuda;
    private String origen;
    private String destino;
    private String bolsillo;
    private String meta;
    private BigDecimal ahorrado;
    private Integer id;
    private String usuario;
    private Integer intentos;
    private Boolean bloqueado;
    private List<ClienteBancoDTO> clientes;

    public static RespuestaOperacion ok() {
        RespuestaOperacion respuesta = new RespuestaOperacion();
        respuesta.ok = true;
        return respuesta;
    }

    public static RespuestaOperacion error(String mensaje) {
        RespuestaOperacion respuesta = new RespuestaOperacion();
        respuesta.ok = false;
        respuesta.error = mensaje;
        return respuesta;
    }

    public RespuestaOperacion conMonto(BigDecimal monto) {
        this.monto = monto;
        return this;
    }

    public RespuestaOperacion conCuotas(Integer cuotas) {
        this.cuotas = cuotas;
        return this;
    }

    public RespuestaOperacion conCuotaMensual(BigDecimal cuotaMensual) {
        this.cuotaMensual = cuotaMensual;
        return this;
    }

    public RespuestaOperacion conDeuda(BigDecimal deuda) {
        this.deuda = deuda;
        return this;
    }

    public RespuestaOperacion conOrigen(String origen) {
        this.origen = origen;
        return this;
    }

    public RespuestaOperacion conDestino(String destino) {
        this.destino = destino;
        return this;
    }

    public RespuestaOperacion conBolsillo(String bolsillo) {
        this.bolsillo = bolsillo;
        return this;
    }

    public RespuestaOperacion conMeta(String meta) {
        this.meta = meta;
        return this;
    }

    public RespuestaOperacion conAhorrado(BigDecimal ahorrado) {
        this.ahorrado = ahorrado;
        return this;
    }

    public RespuestaOperacion conId(Integer id) {
        this.id = id;
        return this;
    }

    public RespuestaOperacion conUsuario(String usuario) {
        this.usuario = usuario;
        return this;
    }

    public RespuestaOperacion conIntentos(Integer intentos) {
        this.intentos = intentos;
        return this;
    }

    public RespuestaOperacion conBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
        return this;
    }

    public Boolean getOk() {
        return ok;
    }

    public String getError() {
        return error;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public Integer getCuotas() {
        return cuotas;
    }

    public BigDecimal getCuotaMensual() {
        return cuotaMensual;
    }

    public BigDecimal getDeuda() {
        return deuda;
    }

    public String getOrigen() {
        return origen;
    }

    public String getDestino() {
        return destino;
    }

    public String getBolsillo() {
        return bolsillo;
    }

    public String getMeta() {
        return meta;
    }

    public BigDecimal getAhorrado() {
        return ahorrado;
    }

    public Integer getId() {
        return id;
    }

    public String getUsuario() {
        return usuario;
    }

    public Integer getIntentos() {
        return intentos;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public List<ClienteBancoDTO> getClientes() {
        return clientes;
    }

    public void setClientes(List<ClienteBancoDTO> clientes) {
        this.clientes = clientes;
    }
}
