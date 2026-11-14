package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCuentaCorriente;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ICuentaCorriente;
import com.Cesde.miplata.Modelo.MCuenta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class SCuentaCorriente {

    private final ICuentaCorriente iCuentaCorriente;
    private final SCuenta sCuenta;
    private final IMovimiento iMovimiento;

    // Constructor
    public SCuentaCorriente(ICuentaCorriente iCuentaCorriente, SCuenta sCuenta, IMovimiento iMovimiento) {
        this.iCuentaCorriente = iCuentaCorriente;
        this.sCuenta = sCuenta;
        this.iMovimiento = iMovimiento;
    }

    // Adicionar una cuenta corriente (primero guarda la cuenta y luego los datos propios con el mismo cuentaID)
    @Transactional
    public MCuentaCorriente adicionarCuentaCorriente(MCuenta mCuenta, MCuentaCorriente mCuentaCorriente) throws Exception{
        try{
            MCuenta cuentaNueva=this.sCuenta.adicionarCuenta(mCuenta);
            mCuentaCorriente.setCuentaID(cuentaNueva.getCuentaID());
            return this.iCuentaCorriente.save(mCuentaCorriente);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MCuentaCorriente> consultaGeneral() throws Exception{
        try{
            return this.iCuentaCorriente.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MCuentaCorriente consultaIndividualID(Integer cuentaID) throws Exception{
        try{
            Optional<MCuentaCorriente> corrienteEncontrada=this.iCuentaCorriente.findById(cuentaID);
            if (corrienteEncontrada.isPresent())
                return corrienteEncontrada.get();
            else
                throw new Exception("Cuenta corriente no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de cuentas corrientes por limite de sobregiro minimo
    public List<MCuentaCorriente> consultaPorLimiteSobregiro(BigDecimal limiteSobregiro) throws Exception{
        try{
            return this.iCuentaCorriente.findByLimiteSobregiroGreaterThanEqual(limiteSobregiro);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar una cuenta corriente (solo los datos propios; los de la cuenta se modifican en SCuenta)
    public MCuentaCorriente modificarCuentaCorriente(MCuentaCorriente mCuentaCorriente,Integer cuentaID) throws Exception{
        try{
            Optional<MCuentaCorriente> corrienteEncontrada=this.iCuentaCorriente.findById(cuentaID);
            if (corrienteEncontrada.isPresent()){
                MCuentaCorriente corrienteNueva=corrienteEncontrada.get();
                corrienteNueva.setPorcentajeSobregiro(mCuentaCorriente.getPorcentajeSobregiro());
                corrienteNueva.setLimiteSobregiro(mCuentaCorriente.getLimiteSobregiro());
                return this.iCuentaCorriente.save(corrienteNueva);
            }else
                throw new Exception("No se puede modificar porque cuenta corriente no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar una cuenta corriente (borra las dos filas: la de la hija y la de cuenta)
    @Transactional
    public Boolean eliminarCuentaCorriente(Integer cuentaID) throws Exception{
        try{
            if (this.iCuentaCorriente.existsById(cuentaID)){
                if (!this.iMovimiento.findByCuentaID(cuentaID).isEmpty())
                    throw new Exception("No se puede eliminar porque tiene movimientos relacionados");
                this.iCuentaCorriente.deleteById(cuentaID);
                this.sCuenta.eliminarCuenta(cuentaID); // borra tambien la fila de cuenta
                return true;
            }else
                throw new Exception("Cuenta corriente no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
