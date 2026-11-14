package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MTipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ITipoMovimiento extends JpaRepository<MTipoMovimiento,Integer> {
    // Busqueda por nombre del tipo
    List<MTipoMovimiento> findByNombreTipo(String nombreTipo);
    // El nombre del tipo es unico: se usa al registrar un movimiento
    Optional<MTipoMovimiento> findFirstByNombreTipo(String nombreTipo);
}
