package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Dto.MovimientosCuentaDTO;
import com.Cesde.miplata.Modelo.MMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IMovimiento extends JpaRepository<MMovimiento,Integer> {
    // Movimientos de una cuenta
    List<MMovimiento> findByCuentaID(Integer cuentaID);
    // Movimientos por tipo de movimiento
    List<MMovimiento> findByTipoID(Integer tipoID);
    // Movimientos en un rango de fechas
    List<MMovimiento> findByFechaMovimientoBetween(LocalDateTime desde, LocalDateTime hasta);
    // Cantidad de movimientos de todas las cuentas de un usuario
    long countByCuenta_Usuario_UsuarioID(Integer usuarioID);
    // Movimientos de un cliente identificado por su usuario de login (para el reporte)
    List<MMovimiento> findByCuenta_Usuario_UsuarioLoginOrderByFechaMovimientoAsc(String usuarioLogin);
    // Todos los movimientos del banco ordenados por fecha (para el reporte del administrador)
    List<MMovimiento> findAllByOrderByFechaMovimientoAsc();
    // Todos los movimientos de un usuario (une movimiento con cuenta)
    @Query("select m from MMovimiento m " +
           "where m.cuenta.usuario.usuarioID = :usuarioID " +
           "order by m.fechaMovimiento desc")
    List<MMovimiento> consultaMovimientosPorUsuario(@Param("usuarioID") Integer usuarioID);
    // Movimientos de una cuenta con el numero de cuenta y el nombre del tipo de movimiento (DTO)
    @Query("select new com.Cesde.miplata.Dto.MovimientosCuentaDTO(" +
           "m.movimientoID, m.fechaMovimiento, m.montoMovimiento, m.descripcionMovimiento, " +
           "m.saldoPosterior, c.numeroCuenta, t.nombreTipo) " +
           "from MMovimiento m join m.cuenta c join m.tipoMovimiento t " +
           "where c.cuentaID = :cuentaID " +
           "order by m.fechaMovimiento desc")
    // Metodo para consumir la consulta anterior
    List<MovimientosCuentaDTO> buscarMovimientosCuenta(@Param("cuentaID") Integer cuentaID);
}
