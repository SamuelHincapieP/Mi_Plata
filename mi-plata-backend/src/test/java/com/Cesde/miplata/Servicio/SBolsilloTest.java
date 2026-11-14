package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MBolsillo;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Repositorio.IBolsillo;
import com.Cesde.miplata.Repositorio.ICuenta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Pruebas unitarias de SBolsillo. Los repositorios se simulan con Mockito (no hace falta la base de datos).
class SBolsilloTest {

    private IBolsillo iBolsillo;
    private ICuenta iCuenta;
    private SBolsillo servicio;

    @BeforeEach
    void preparar() {
        iBolsillo = mock(IBolsillo.class);
        iCuenta = mock(ICuenta.class);
        servicio = new SBolsillo(iBolsillo, iCuenta);
    }

    @Test
    void nombreVacioDebeFallar() {
        assertThrows(Exception.class, () -> SBolsillo.validarNombre("   "));
    }

    @Test
    void nombreDeMasDe40CaracteresDebeFallar() {
        assertThrows(Exception.class, () -> SBolsillo.validarNombre("x".repeat(41)));
    }

    @Test
    void nombreValidoSeAcepta() {
        assertDoesNotThrow(() -> SBolsillo.validarNombre("Mercado del mes"));
    }

    @Test
    void cuentaInexistenteDebeFallar() throws Exception {
        when(iCuenta.findByNumeroCuenta("ZZZ-999")).thenReturn(Optional.empty());
        Exception error = assertThrows(Exception.class, () -> servicio.adicionar("ZZZ-999", "Viaje"));
        assertTrue(error.getMessage().contains("no está registrada"));
        verify(iBolsillo, never()).save(any());
    }

    @Test
    void tarjetaDeCreditoNoTieneBolsillos() throws Exception {
        MCuenta tarjeta = new MCuenta();
        tarjeta.setCuentaID(3);
        tarjeta.setTipoCuentaID(3);
        when(iCuenta.findByNumeroCuenta("TC-022")).thenReturn(Optional.of(tarjeta));
        Exception error = assertThrows(Exception.class, () -> servicio.adicionar("TC-022", "Compras"));
        assertTrue(error.getMessage().contains("tarjetas"));
    }

    @Test
    void bolsilloConDineroNoSeElimina() throws Exception {
        MBolsillo bolsillo = new MBolsillo();
        bolsillo.setSaldo(new BigDecimal("50000"));
        when(iBolsillo.findById(1)).thenReturn(Optional.of(bolsillo));
        Exception error = assertThrows(Exception.class, () -> servicio.eliminar(1));
        assertTrue(error.getMessage().contains("dinero guardado"));
        verify(iBolsillo, never()).deleteById(any());
    }
}
