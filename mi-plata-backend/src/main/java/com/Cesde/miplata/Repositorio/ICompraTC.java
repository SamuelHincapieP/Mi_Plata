package com.Cesde.miplata.Repositorio;

import com.Cesde.miplata.Modelo.MCompraTC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICompraTC extends JpaRepository<MCompraTC, Integer> {

    // Query method: todas las compras de una tarjeta
    List<MCompraTC> findByCuentaID(Integer cuentaID);

    // Consulta con JOIN a categoria_gasto usando la relacion de la entidad (devuelve la Projection)
    @Query("""
        select K.compraID as codcompra,
               K.fechaCompra as fecha,
               K.comercio as comercio,
               G.nombreCategoria as categoria,
               K.monto as monto,
               K.cuotas as cuotas,
               K.cuotaMensual as cuotamensual
        from MCompraTC K
        join K.categoria G
        where K.cuentaID = :cuentaID
        order by K.fechaCompra desc, K.compraID desc
        """)
    List<ICompraTCProjection> consultaComprasCuenta(@Param("cuentaID") Integer cuentaID);
}
