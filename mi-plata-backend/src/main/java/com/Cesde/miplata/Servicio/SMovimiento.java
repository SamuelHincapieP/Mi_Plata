package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.MovimientosCuentaDTO;
import com.Cesde.miplata.Modelo.MMovimiento;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ITipoMovimiento;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SMovimiento {

    private final IMovimiento iMovimiento;
    private final ICuenta iCuenta;
    private final ITipoMovimiento iTipoMovimiento;

    // Constructor
    public SMovimiento(IMovimiento iMovimiento, ICuenta iCuenta, ITipoMovimiento iTipoMovimiento) {
        this.iMovimiento = iMovimiento;
        this.iCuenta = iCuenta;
        this.iTipoMovimiento = iTipoMovimiento;
    }

    // Adicionar un movimiento
    // Nota: los movimientos son un historial, por eso solo se adicionan y se consultan
    public MMovimiento adicionarMovimiento(MMovimiento mMovimiento) throws Exception{
        try{
            if (!this.iCuenta.existsById(mMovimiento.getCuentaID()))
                throw new Exception("La cuenta del movimiento no esta registrada");
            if (!this.iTipoMovimiento.existsById(mMovimiento.getTipoID()))
                throw new Exception("El tipo de movimiento no esta registrado");
            mMovimiento.setMovimientoID(null); // el ID lo genera la base de datos
            if (mMovimiento.getFechaMovimiento() == null)
                mMovimiento.setFechaMovimiento(LocalDateTime.now());
            return this.iMovimiento.save(mMovimiento);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MMovimiento> consultaGeneral() throws Exception{
        try{
            return this.iMovimiento.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MMovimiento consultaIndividualID(Integer movimientoID) throws Exception{
        try{
            Optional<MMovimiento> movimientoEncontrado=this.iMovimiento.findById(movimientoID);
            if (movimientoEncontrado.isPresent())
                return movimientoEncontrado.get();
            else
                throw new Exception("Movimiento no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de los movimientos de una cuenta
    public List<MMovimiento> consultaPorCuenta(Integer cuentaID) throws Exception{
        try{
            return this.iMovimiento.findByCuentaID(cuentaID);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de movimientos por tipo de movimiento
    public List<MMovimiento> consultaPorTipo(Integer tipoID) throws Exception{
        try{
            return this.iMovimiento.findByTipoID(tipoID);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de movimientos en un rango de fechas
    public List<MMovimiento> consultaPorRangoFechas(LocalDateTime desde, LocalDateTime hasta) throws Exception{
        try{
            return this.iMovimiento.findByFechaMovimientoBetween(desde, hasta);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de todos los movimientos de un usuario
    public List<MMovimiento> consultaPorUsuario(Integer usuarioID) throws Exception{
        try{
            return this.iMovimiento.consultaMovimientosPorUsuario(usuarioID);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de los movimientos de una cuenta con su tipo (DTO)
    public List<MovimientosCuentaDTO> consultaMovimientosCuenta(Integer cuentaID) throws Exception{
        try{
            return this.iMovimiento.buscarMovimientosCuenta(cuentaID);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
