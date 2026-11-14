package com.Cesde.miplata.Mapper;

import com.Cesde.miplata.Dto.CompraTCDTO;
import com.Cesde.miplata.Repositorio.ICompraTCProjection;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ICompraTCMapper {
    CompraTCDTO toDTO(ICompraTCProjection p);
    List<CompraTCDTO> toDTOList(List<ICompraTCProjection> proyeccion);
}
