package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MTipoCuenta;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.ITipoCuenta;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class STipoCuenta {

    private final ITipoCuenta iTipoCuenta;
    private final ICuenta iCuenta;

    // Constructor
    public STipoCuenta(ITipoCuenta iTipoCuenta, ICuenta iCuenta) {
        this.iTipoCuenta = iTipoCuenta;
        this.iCuenta = iCuenta;
    }

    // Adicionar un tipo de cuenta
    public MTipoCuenta adicionarTipoCuenta(MTipoCuenta mTipoCuenta) throws Exception{
        try{
            mTipoCuenta.setTipoCuentaID(null); // el ID lo genera la base de datos
            return this.iTipoCuenta.save(mTipoCuenta);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MTipoCuenta> consultaGeneral() throws Exception{
        try{
            return this.iTipoCuenta.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MTipoCuenta consultaIndividualID(Integer tipoCuentaID) throws Exception{
        try{
            Optional<MTipoCuenta> tipoEncontrado=this.iTipoCuenta.findById(tipoCuentaID);
            if (tipoEncontrado.isPresent())
                return tipoEncontrado.get();
            else
                throw new Exception("Tipo de cuenta no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por nombre del tipo
    public List<MTipoCuenta> consultaPorNombre(String nombreTipo) throws Exception{
        try{
            return this.iTipoCuenta.findByNombreTipo(nombreTipo);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un tipo de cuenta
    public MTipoCuenta modificarTipoCuenta(MTipoCuenta mTipoCuenta,Integer tipoCuentaID) throws Exception{
        try{
            Optional<MTipoCuenta> tipoEncontrado=this.iTipoCuenta.findById(tipoCuentaID);
            if (tipoEncontrado.isPresent()){
                MTipoCuenta tipoNuevo=tipoEncontrado.get();
                tipoNuevo.setNombreTipo(mTipoCuenta.getNombreTipo());
                tipoNuevo.setDescripcionTipo(mTipoCuenta.getDescripcionTipo());
                return this.iTipoCuenta.save(tipoNuevo);
            }else
                throw new Exception("No se puede modificar porque tipo de cuenta no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un tipo de cuenta
    public Boolean eliminarTipoCuenta(Integer tipoCuentaID) throws Exception{
        try{
            if (this.iTipoCuenta.existsById(tipoCuentaID)){
                if (this.iCuenta.findByTipoCuentaID(tipoCuentaID).isEmpty()){
                    this.iTipoCuenta.deleteById(tipoCuentaID);
                    return true;
                }else
                    throw new Exception("No se puede eliminar porque tiene cuentas relacionadas");
            }else
                throw new Exception("Tipo de cuenta no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
