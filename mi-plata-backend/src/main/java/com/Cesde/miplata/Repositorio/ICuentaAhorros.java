package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MCuentaAhorros;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ICuentaAhorros extends JpaRepository<MCuentaAhorros,Integer> {
    // Cuentas de ahorros con tasa de interes mayor o igual a la indicada
    List<MCuentaAhorros> findByTasaInteresGreaterThanEqual(BigDecimal tasaInteres);
}
