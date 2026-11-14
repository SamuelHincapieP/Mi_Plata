package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MTransferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITransferencia extends JpaRepository<MTransferencia, Integer> {

    // Resumen de transferencias de un usuario: enviadas y recibidas, con nombre de quien envia y de quien recibe
    @Query("""
        select T.transferenciaID as transferenciaid,
               T.fechaTransferencia as fecha,
               T.monto as monto,
               T.mensaje as mensaje,
               CO.numeroCuenta as cuentaorigen,
               CD.numeroCuenta as cuentadestino,
               UO.nombre as nombreorigen,
               UD.nombre as nombredestino,
               case when CO.usuarioID = :usuarioID then 'ENVIADA' else 'RECIBIDA' end as sentido
        from MTransferencia T
        join T.cuentaOrigen CO
        join T.cuentaDestino CD
        join CO.usuario UO
        join CD.usuario UD
        where CO.usuarioID = :usuarioID or CD.usuarioID = :usuarioID
        order by T.fechaTransferencia desc, T.transferenciaID desc
        """)
    List<ITransferenciaProjection> consultaTransferenciasUsuario(@Param("usuarioID") Integer usuarioID);
}
