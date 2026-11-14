package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MCuentaCorriente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ICuentaCorriente extends JpaRepository<MCuentaCorriente,Integer> {
    // Cuentas corrientes con limite de sobregiro mayor o igual al indicado
    List<MCuentaCorriente> findByLimiteSobregiroGreaterThanEqual(BigDecimal limiteSobregiro);
}
