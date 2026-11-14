package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCuentaAhorros;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Modelo.MCuenta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class SCuentaAhorros {

    private final ICuentaAhorros iCuentaAhorros;
    private final SCuenta sCuenta;
    private final IMovimiento iMovimiento;

    // Constructor
    public SCuentaAhorros(ICuentaAhorros iCuentaAhorros, SCuenta sCuenta, IMovimiento iMovimiento) {
        this.iCuentaAhorros = iCuentaAhorros;
        this.sCuenta = sCuenta;
        this.iMovimiento = iMovimiento;
    }

    // Adicionar una cuenta de ahorros (primero guarda la cuenta y luego los datos propios con el mismo cuentaID)
    @Transactional
    public MCuentaAhorros adicionarCuentaAhorros(MCuenta mCuenta, MCuentaAhorros mCuentaAhorros) throws Exception{
        try{
            MCuenta cuentaNueva=this.sCuenta.adicionarCuenta(mCuenta);
            mCuentaAhorros.setCuentaID(cuentaNueva.getCuentaID());
            return this.iCuentaAhorros.save(mCuentaAhorros);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MCuentaAhorros> consultaGeneral() throws Exception{
        try{
            return this.iCuentaAhorros.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MCuentaAhorros consultaIndividualID(Integer cuentaID) throws Exception{
        try{
            Optional<MCuentaAhorros> ahorrosEncontrada=this.iCuentaAhorros.findById(cuentaID);
            if (ahorrosEncontrada.isPresent())
                return ahorrosEncontrada.get();
            else
                throw new Exception("Cuenta de ahorros no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de cuentas de ahorros por tasa de interes minima
    public List<MCuentaAhorros> consultaPorTasaMinima(BigDecimal tasaInteres) throws Exception{
        try{
            return this.iCuentaAhorros.findByTasaInteresGreaterThanEqual(tasaInteres);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar una cuenta de ahorros (solo los datos propios; los de la cuenta se modifican en SCuenta)
    public MCuentaAhorros modificarCuentaAhorros(MCuentaAhorros mCuentaAhorros,Integer cuentaID) throws Exception{
        try{
            Optional<MCuentaAhorros> ahorrosEncontrada=this.iCuentaAhorros.findById(cuentaID);
            if (ahorrosEncontrada.isPresent()){
                MCuentaAhorros ahorrosNueva=ahorrosEncontrada.get();
                ahorrosNueva.setTasaInteres(mCuentaAhorros.getTasaInteres());
                return this.iCuentaAhorros.save(ahorrosNueva);
            }else
                throw new Exception("No se puede modificar porque cuenta de ahorros no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar una cuenta de ahorros (borra las dos filas: la de la hija y la de cuenta)
    @Transactional
    public Boolean eliminarCuentaAhorros(Integer cuentaID) throws Exception{
        try{
            if (this.iCuentaAhorros.existsById(cuentaID)){
                if (!this.iMovimiento.findByCuentaID(cuentaID).isEmpty())
                    throw new Exception("No se puede eliminar porque tiene movimientos relacionados");
                this.iCuentaAhorros.deleteById(cuentaID);
                this.sCuenta.eliminarCuenta(cuentaID); // borra tambien la fila de cuenta
                return true;
            }else
                throw new Exception("Cuenta de ahorros no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
