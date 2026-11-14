package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MTarjetaCredito;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ITarjetaCredito;
import com.Cesde.miplata.Modelo.MCuenta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class STarjetaCredito {

    private final ITarjetaCredito iTarjetaCredito;
    private final SCuenta sCuenta;
    private final IMovimiento iMovimiento;

    // Constructor
    public STarjetaCredito(ITarjetaCredito iTarjetaCredito, SCuenta sCuenta, IMovimiento iMovimiento) {
        this.iTarjetaCredito = iTarjetaCredito;
        this.sCuenta = sCuenta;
        this.iMovimiento = iMovimiento;
    }

    // Adicionar una tarjeta de credito (primero guarda la cuenta y luego los datos propios con el mismo cuentaID)
    @Transactional
    public MTarjetaCredito adicionarTarjetaCredito(MCuenta mCuenta, MTarjetaCredito mTarjetaCredito) throws Exception{
        try{
            MCuenta cuentaNueva=this.sCuenta.adicionarCuenta(mCuenta);
            mTarjetaCredito.setCuentaID(cuentaNueva.getCuentaID());
            if (mTarjetaCredito.getDeuda() == null)
                mTarjetaCredito.setDeuda(BigDecimal.ZERO);
            return this.iTarjetaCredito.save(mTarjetaCredito);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MTarjetaCredito> consultaGeneral() throws Exception{
        try{
            return this.iTarjetaCredito.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MTarjetaCredito consultaIndividualID(Integer cuentaID) throws Exception{
        try{
            Optional<MTarjetaCredito> tarjetaEncontrada=this.iTarjetaCredito.findById(cuentaID);
            if (tarjetaEncontrada.isPresent())
                return tarjetaEncontrada.get();
            else
                throw new Exception("Tarjeta de credito no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de tarjetas con deuda mayor a un valor
    public List<MTarjetaCredito> consultaConDeudaMayorA(BigDecimal deuda) throws Exception{
        try{
            return this.iTarjetaCredito.findByDeudaGreaterThan(deuda);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar una tarjeta de credito (solo los datos propios; los de la cuenta se modifican en SCuenta)
    public MTarjetaCredito modificarTarjetaCredito(MTarjetaCredito mTarjetaCredito,Integer cuentaID) throws Exception{
        try{
            Optional<MTarjetaCredito> tarjetaEncontrada=this.iTarjetaCredito.findById(cuentaID);
            if (tarjetaEncontrada.isPresent()){
                MTarjetaCredito tarjetaNueva=tarjetaEncontrada.get();
                tarjetaNueva.setCupo(mTarjetaCredito.getCupo());
                tarjetaNueva.setDeuda(mTarjetaCredito.getDeuda());
                tarjetaNueva.setNumeroCuotas(mTarjetaCredito.getNumeroCuotas());
                tarjetaNueva.setTasaMensual(mTarjetaCredito.getTasaMensual());
                return this.iTarjetaCredito.save(tarjetaNueva);
            }else
                throw new Exception("No se puede modificar porque tarjeta de credito no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar una tarjeta de credito (borra las dos filas: la de la hija y la de cuenta)
    @Transactional
    public Boolean eliminarTarjetaCredito(Integer cuentaID) throws Exception{
        try{
            if (this.iTarjetaCredito.existsById(cuentaID)){
                if (!this.iMovimiento.findByCuentaID(cuentaID).isEmpty())
                    throw new Exception("No se puede eliminar porque tiene movimientos relacionados");
                this.iTarjetaCredito.deleteById(cuentaID);
                this.sCuenta.eliminarCuenta(cuentaID); // borra tambien la fila de cuenta
                return true;
            }else
                throw new Exception("Tarjeta de credito no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
