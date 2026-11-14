package com.Cesde.miplata.Mapper;

import com.Cesde.miplata.Dto.MovimientosUsuarioDTO;
import com.Cesde.miplata.Repositorio.IMovimientosUsuarioProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IMovimientosUsuarioMapper {
    @Mapping(source = "nomusuario", target = "nombreUsuario")
    @Mapping(source = "emailusuario", target = "emailUsuario")
    @Mapping(source = "numcuenta", target = "numeroCuenta")
    @Mapping(source = "tipocuenta", target = "tipoCuenta")
    @Mapping(source = "codmovimiento", target = "movimientoID")
    @Mapping(source = "fechamov", target = "fechaMovimiento")
    @Mapping(source = "valormov", target = "montoMovimiento")
    @Mapping(source = "saldoposterior", target = "saldoPosterior")
    @Mapping(source = "tipomov", target = "tipoMovimiento")
    MovimientosUsuarioDTO toDTO (IMovimientosUsuarioProjection p);
    List<MovimientosUsuarioDTO> toDTOList (List<IMovimientosUsuarioProjection> proyeccion);
}
