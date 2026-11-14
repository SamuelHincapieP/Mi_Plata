package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MUsuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUsuario extends JpaRepository<MUsuario,Integer> {
    // Busqueda por email (es unico)
    Optional<MUsuario> findByEmail(String email);
    // Busqueda por el nombre de usuario que se escribe en el login
    Optional<MUsuario> findByUsuarioLogin(String usuarioLogin);
    // Login: bloquea la fila mientras se valida la clave y se actualizan los intentos fallidos
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from MUsuario u where u.usuarioLogin = :usuarioLogin")
    Optional<MUsuario> buscarPorUsuarioLoginBloqueado(@Param("usuarioLogin") String usuarioLogin);
    // Busqueda por rol
    List<MUsuario> findByRol(String rol);
    // Cantidad de usuarios de un rol (para el reporte del administrador)
    long countByRol(String rol);
    // Busqueda por nombre (parcial, sin importar mayusculas)
    List<MUsuario> findByNombreContainingIgnoreCase(String nombre);
    // Clientes visibles en la pagina: los que tienen usuario de login
    List<MUsuario> findAllByUsuarioLoginIsNotNullOrderByUsuarioIDAsc();
    // Validar que el documento no lo tenga otro usuario
    boolean existsByIdentificacionAndUsuarioIDNot(String identificacion, Integer usuarioID);
    // Consulta completa de los movimientos de un usuario (usuario, cuenta, tipo de cuenta, movimiento y tipo de movimiento)
    @Query("""
    select
        u.nombre as nomusuario,
        u.email as emailusuario,
        c.numeroCuenta as numcuenta,
        tc.nombreTipo as tipocuenta,
        m.movimientoID as codmovimiento,
        m.fechaMovimiento as fechamov,
        m.montoMovimiento as valormov,
        m.saldoPosterior as saldoposterior,
        tm.nombreTipo as tipomov
    from MUsuario u
    join u.cuentas c
    join c.tipoCuenta tc
    join c.movimientos m
    join m.tipoMovimiento tm
    where u.usuarioID = :usuarioID
    order by m.fechaMovimiento desc""")
    // Metodo para consumir la consulta anterior
    List<IMovimientosUsuarioProjection> consultaGeneralMovimientos(@Param("usuarioID") Integer usuarioID);
}
