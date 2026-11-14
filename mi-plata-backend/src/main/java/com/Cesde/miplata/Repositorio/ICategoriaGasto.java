package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MCategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICategoriaGasto extends JpaRepository<MCategoriaGasto, Integer> {
    // Query method: buscar una categoría por su nombre
    Optional<MCategoriaGasto> findByNombreCategoria(String nombreCategoria);
}
