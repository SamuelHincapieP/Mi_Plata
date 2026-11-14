package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MTipoCuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITipoCuenta extends JpaRepository<MTipoCuenta,Integer> {
    // Busqueda por nombre del tipo
    List<MTipoCuenta> findByNombreTipo(String nombreTipo);
}
