package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.TransferenciaDTO;
import com.Cesde.miplata.Mapper.ITransferenciaMapper;
import com.Cesde.miplata.Repositorio.ITransferencia;
import org.springframework.stereotype.Service;

import java.util.List;

// Consulta del resumen de transferencias (enviadas y recibidas) de un usuario
@Service
public class STransferencia {

    private final ITransferencia iTransferencia;
    private final ITransferenciaMapper iTransferenciaMapper;

    public STransferencia(ITransferencia iTransferencia, ITransferenciaMapper iTransferenciaMapper) {
        this.iTransferencia = iTransferencia;
        this.iTransferenciaMapper = iTransferenciaMapper;
    }

    // Resumen de transferencias de un usuario (Projection -> Mapper -> DTO record)
    public List<TransferenciaDTO> consultaPorUsuario(Integer usuarioID) throws Exception {
        try {
            if (usuarioID == null || usuarioID <= 0)
                throw new Exception("El identificador del usuario no es válido");
            return iTransferenciaMapper.toDTOList(iTransferencia.consultaTransferenciasUsuario(usuarioID));
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
