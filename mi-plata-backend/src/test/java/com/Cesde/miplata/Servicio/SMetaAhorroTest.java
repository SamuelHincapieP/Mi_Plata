package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MMetaAhorro;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Repositorio.IMetaAhorro;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Pruebas unitarias de SMetaAhorro. Los repositorios se simulan con Mockito,
// así no hace falta la base de datos para probar las reglas.
class SMetaAhorroTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 9);

    private IMetaAhorro iMetaAhorro;
    private ICuenta iCuenta;
    private ICuentaAhorros iCuentaAhorros;
    private SMetaAhorro servicio;

    @BeforeEach
    void preparar() {
        iMetaAhorro = mock(IMetaAhorro.class);
        iCuenta = mock(ICuenta.class);
        iCuentaAhorros = mock(ICuentaAhorros.class);
        servicio = new SMetaAhorro(iMetaAhorro, iCuenta, iCuentaAhorros);
    }

    @Test
    void fechaAnteriorAHoyDebeFallar() {
        assertThrows(Exception.class, () -> SMetaAhorro.validarFecha(HOY.minusDays(1), HOY));
    }

    @Test
    void fechaDeHoyYFuturaDebenSerAceptadas() {
        assertDoesNotThrow(() -> SMetaAhorro.validarFecha(HOY, HOY));
        assertDoesNotThrow(() -> SMetaAhorro.validarFecha(HOY.plusMonths(6), HOY));
    }

    @Test
    void montoCeroONegativoDebeFallar() {
        assertThrows(Exception.class, () ->
                servicio.adicionar("AHO-010", "Viaje", BigDecimal.ZERO, HOY.plusMonths(3)));
    }

    @Test
    void cuentaInexistenteDebeFallar() throws Exception {
        when(iCuenta.findByNumeroCuenta("AHO-999")).thenReturn(Optional.empty());
        Exception error = assertThrows(Exception.class, () ->
                servicio.adicionar("AHO-999", "Viaje", new BigDecimal("500000"), LocalDate.now().plusMonths(3)));
        assertTrue(error.getMessage().contains("no está registrada"));
        verify(iMetaAhorro, never()).save(any());
    }

    @Test
    void cuentaQueNoEsDeAhorrosDebeFallar() throws Exception {
        MCuenta tarjeta = new MCuenta();
        tarjeta.setCuentaID(5);
        when(iCuenta.findByNumeroCuenta("TC-032")).thenReturn(Optional.of(tarjeta));
        when(iCuentaAhorros.existsById(5)).thenReturn(false);
        assertThrows(Exception.class, () ->
                servicio.adicionar("TC-032", "Viaje", new BigDecimal("500000"), LocalDate.now().plusMonths(3)));
    }

    @Test
    void metaConDineroAhorradoNoSeElimina() throws Exception {
        MMetaAhorro meta = new MMetaAhorro();
        meta.setMontoAhorrado(new BigDecimal("150000"));
        when(iMetaAhorro.findById(1)).thenReturn(Optional.of(meta));
        Exception error = assertThrows(Exception.class, () -> servicio.eliminar(1));
        assertTrue(error.getMessage().contains("dinero ahorrado"));
        verify(iMetaAhorro, never()).deleteById(any());
    }

    @Test
    void metaInexistenteNoSeElimina() throws Exception {
        when(iMetaAhorro.findById(99)).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> servicio.eliminar(99));
    }
}
