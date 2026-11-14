package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MTipoMovimiento;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ITipoMovimiento;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class STipoMovimiento {

    private final ITipoMovimiento iTipoMovimiento;
    private final IMovimiento iMovimiento;

    // Constructor
    public STipoMovimiento(ITipoMovimiento iTipoMovimiento, IMovimiento iMovimiento) {
        this.iTipoMovimiento = iTipoMovimiento;
        this.iMovimiento = iMovimiento;
    }

    // Adicionar un tipo de movimiento
    public MTipoMovimiento adicionarTipoMovimiento(MTipoMovimiento mTipoMovimiento) throws Exception{
        try{
            mTipoMovimiento.setTipoID(null); // el ID lo genera la base de datos
            return this.iTipoMovimiento.save(mTipoMovimiento);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MTipoMovimiento> consultaGeneral() throws Exception{
        try{
            return this.iTipoMovimiento.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MTipoMovimiento consultaIndividualID(Integer tipoID) throws Exception{
        try{
            Optional<MTipoMovimiento> tipoEncontrado=this.iTipoMovimiento.findById(tipoID);
            if (tipoEncontrado.isPresent())
                return tipoEncontrado.get();
            else
                throw new Exception("Tipo de movimiento no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por nombre del tipo
    public List<MTipoMovimiento> consultaPorNombre(String nombreTipo) throws Exception{
        try{
            return this.iTipoMovimiento.findByNombreTipo(nombreTipo);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un tipo de movimiento
    public MTipoMovimiento modificarTipoMovimiento(MTipoMovimiento mTipoMovimiento,Integer tipoID) throws Exception{
        try{
            Optional<MTipoMovimiento> tipoEncontrado=this.iTipoMovimiento.findById(tipoID);
            if (tipoEncontrado.isPresent()){
                MTipoMovimiento tipoNuevo=tipoEncontrado.get();
                tipoNuevo.setNombreTipo(mTipoMovimiento.getNombreTipo());
                tipoNuevo.setDescripcionTipo(mTipoMovimiento.getDescripcionTipo());
                return this.iTipoMovimiento.save(tipoNuevo);
            }else
                throw new Exception("No se puede modificar porque tipo de movimiento no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un tipo de movimiento
    public Boolean eliminarTipoMovimiento(Integer tipoID) throws Exception{
        try{
            if (this.iTipoMovimiento.existsById(tipoID)){
                if (this.iMovimiento.findByTipoID(tipoID).isEmpty()){
                    this.iTipoMovimiento.deleteById(tipoID);
                    return true;
                }else
                    throw new Exception("No se puede eliminar porque tiene movimientos relacionados");
            }else
                throw new Exception("Tipo de movimiento no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
