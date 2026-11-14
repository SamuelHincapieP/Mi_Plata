package com.Cesde.miplata.Servicio;

import java.math.BigDecimal;
import java.math.RoundingMode;

// Utilidades pequenas para validar y mostrar montos de dinero.
public final class Dinero {

    private Dinero() {
    }

    // El monto llega del frontend como BigDecimal; siempre debe ser mayor que cero.
    public static BigDecimal validar(BigDecimal monto) {
        if (monto == null || monto.signum() <= 0)
            throw new ErrorNegocio("Ingresa un monto valido mayor a cero.");
        return monto.setScale(2, RoundingMode.HALF_UP);
    }

    // Formato sin decimales para los mensajes de error ($7.500.000).
    public static String pesos(BigDecimal monto) {
        return monto.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }
}
