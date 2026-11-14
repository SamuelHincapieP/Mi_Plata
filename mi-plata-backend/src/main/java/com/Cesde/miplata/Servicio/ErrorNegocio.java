package com.Cesde.miplata.Servicio;

// Error de una regla de negocio (saldo insuficiente, cupo, datos repetidos...).
// El controlador lo convierte en una respuesta 400 con el mensaje para el usuario.
public class ErrorNegocio extends RuntimeException {

    public ErrorNegocio(String mensaje) {
        super(mensaje);
    }
}
