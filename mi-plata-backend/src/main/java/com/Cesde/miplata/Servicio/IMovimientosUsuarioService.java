package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.MovimientosUsuarioDTO;

import java.util.List;

public interface IMovimientosUsuarioService {
    List<MovimientosUsuarioDTO> obtenerMovimientosUsuarioDTO(Integer usuarioID);
}
