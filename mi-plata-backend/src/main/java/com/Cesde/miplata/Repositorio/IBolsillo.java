package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MBolsillo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IBolsillo extends JpaRepository<MBolsillo, Integer> {
    // Query method: bolsillos de una cuenta
    List<MBolsillo> findByCuentaID(Integer cuentaID);

    // Query method: buscar un bolsillo por nombre dentro de una cuenta (el nombre no se repite)
    Optional<MBolsillo> findByCuentaIDAndNombreBolsillo(Integer cuentaID, String nombreBolsillo);

    // Bolsillos de todas las cuentas de un usuario, usando la relacion con MCuenta
    List<MBolsillo> findByCuenta_Usuario_UsuarioID(Integer usuarioID);
}
