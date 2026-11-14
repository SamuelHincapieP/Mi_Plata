package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MMetaAhorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMetaAhorro extends JpaRepository<MMetaAhorro, Integer> {
    // Query method: metas de una cuenta de ahorros
    List<MMetaAhorro> findByCuentaID(Integer cuentaID);

    // Metas de todas las cuentas de un usuario, usando la relacion con MCuenta
    List<MMetaAhorro> findByCuenta_Usuario_UsuarioID(Integer usuarioID);
}
