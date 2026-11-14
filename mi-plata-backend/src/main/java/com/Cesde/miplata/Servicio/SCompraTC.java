package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.CompraTCDTO;
import com.Cesde.miplata.Mapper.ICompraTCMapper;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Repositorio.ICompraTC;
import com.Cesde.miplata.Repositorio.ICuenta;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// Consulta de lo que se ha comprado con una tarjeta de crédito
@Service
public class SCompraTC {

    private final ICompraTC iCompraTC;
    private final ICuenta iCuenta;
    private final ICompraTCMapper iCompraTCMapper;

    public SCompraTC(ICompraTC iCompraTC, ICuenta iCuenta, ICompraTCMapper iCompraTCMapper) {
        this.iCompraTC = iCompraTC;
        this.iCuenta = iCuenta;
        this.iCompraTCMapper = iCompraTCMapper;
    }

    // Compras de una tarjeta, a partir de su número de cuenta
    public List<CompraTCDTO> consultaPorNumeroCuenta(String numeroCuenta) throws Exception {
        try {
            Optional<MCuenta> cuenta = this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuenta.isEmpty())
                throw new Exception("La cuenta " + numeroCuenta + " no está registrada");
            return iCompraTCMapper.toDTOList(iCompraTC.consultaComprasCuenta(cuenta.get().getCuentaID()));
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
