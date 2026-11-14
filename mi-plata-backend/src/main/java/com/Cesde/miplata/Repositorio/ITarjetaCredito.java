package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MTarjetaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ITarjetaCredito extends JpaRepository<MTarjetaCredito,Integer> {
    // Tarjetas con deuda mayor a la indicada
    List<MTarjetaCredito> findByDeudaGreaterThan(BigDecimal deuda);
}
