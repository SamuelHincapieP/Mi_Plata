package com.Cesde.miplata.Mapper;

import com.Cesde.miplata.Dto.TransferenciaDTO;
import com.Cesde.miplata.Repositorio.ITransferenciaProjection;
import org.mapstruct.Mapper;

import java.util.List;

// Los nombres de la Projection y del record coinciden, por eso MapStruct copia los campos sin @Mapping
@Mapper(componentModel = "spring")
public interface ITransferenciaMapper {
    TransferenciaDTO toDTO(ITransferenciaProjection p);
    List<TransferenciaDTO> toDTOList(List<ITransferenciaProjection> proyeccion);
}
