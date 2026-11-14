package com.Cesde.miplata.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Resumen de una transferencia: quién envió, quién recibió, cuánto y el mensaje
public record TransferenciaDTO(Integer transferenciaid, LocalDateTime fecha, BigDecimal monto,
        String mensaje, String cuentaorigen, String cuentadestino,
        String nombreorigen, String nombredestino, String sentido) {
}
