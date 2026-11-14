package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MCuenta;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICuenta extends JpaRepository<MCuenta,Integer> {
    // Busqueda por numero de cuenta (es unico)
    Optional<MCuenta> findByNumeroCuenta(String numeroCuenta);
    // Cuenta bloqueada mientras dura la transaccion de dinero (evita dos operaciones al mismo tiempo)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from MCuenta c where c.numeroCuenta = :numeroCuenta")
    Optional<MCuenta> buscarPorNumeroBloqueada(@Param("numeroCuenta") String numeroCuenta);
    // Cuentas de un usuario
    List<MCuenta> findByUsuarioID(Integer usuarioID);
    // Cuentas de un usuario usando la relacion con MUsuario
    List<MCuenta> findByUsuario_UsuarioID(Integer usuarioID);
    // Cuentas por tipo de cuenta
    List<MCuenta> findByTipoCuentaID(Integer tipoCuentaID);
    // Cuentas por estado
    List<MCuenta> findByEstado(String estado);
}
