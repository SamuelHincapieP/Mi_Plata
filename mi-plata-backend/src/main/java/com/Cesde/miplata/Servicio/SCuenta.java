package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ITipoCuenta;
import com.Cesde.miplata.Repositorio.IUsuario;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SCuenta {

    private final ICuenta iCuenta;
    private final IUsuario iUsuario;
    private final ITipoCuenta iTipoCuenta;
    private final IMovimiento iMovimiento;

    // Constructor
    public SCuenta(ICuenta iCuenta, IUsuario iUsuario, ITipoCuenta iTipoCuenta,
                   IMovimiento iMovimiento) {
        this.iCuenta = iCuenta;
        this.iUsuario = iUsuario;
        this.iTipoCuenta = iTipoCuenta;
        this.iMovimiento = iMovimiento;
    }

    // Valida y completa los datos de una cuenta nueva.
    // Tambien lo usan las cuentas hijas (ahorros, corriente y tarjeta) porque heredan de MCuenta
    public void prepararCuentaNueva(MCuenta mCuenta) throws Exception{
        if (!this.iUsuario.existsById(mCuenta.getUsuarioID()))
            throw new Exception("El usuario de la cuenta no esta registrado");
        if (!this.iTipoCuenta.existsById(mCuenta.getTipoCuentaID()))
            throw new Exception("El tipo de cuenta no esta registrado");
        if (this.iCuenta.findByNumeroCuenta(mCuenta.getNumeroCuenta()).isPresent())
            throw new Exception("Ya existe una cuenta con ese numero");
        mCuenta.setCuentaID(null); // el ID lo genera la base de datos
        if (mCuenta.getSaldo() == null)
            mCuenta.setSaldo(BigDecimal.ZERO);
        if (mCuenta.getFechaCreacion() == null)
            mCuenta.setFechaCreacion(LocalDateTime.now());
    }

    // Valida y copia los datos modificables de una cuenta (origen) sobre la cuenta encontrada (destino).
    // Tambien lo usan las cuentas hijas
    public void copiarDatosCuenta(MCuenta destino, MCuenta origen) throws Exception{
        if (!this.iTipoCuenta.existsById(origen.getTipoCuentaID()))
            throw new Exception("El tipo de cuenta no esta registrado");
        Optional<MCuenta> otraConNumero=this.iCuenta.findByNumeroCuenta(origen.getNumeroCuenta());
        if (otraConNumero.isPresent() && !otraConNumero.get().getCuentaID().equals(destino.getCuentaID()))
            throw new Exception("Ya existe otra cuenta con ese numero");
        destino.setNumeroCuenta(origen.getNumeroCuenta());
        destino.setSaldo(origen.getSaldo());
        destino.setEstado(origen.getEstado());
        destino.setTipoCuentaID(origen.getTipoCuentaID());
    }

    // Adicionar una cuenta
    public MCuenta adicionarCuenta(MCuenta mCuenta) throws Exception{
        try{
            prepararCuentaNueva(mCuenta);
            return this.iCuenta.save(mCuenta);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MCuenta> consultaGeneral() throws Exception{
        try{
            return this.iCuenta.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MCuenta consultaIndividualID(Integer cuentaID) throws Exception{
        try{
            Optional<MCuenta> cuentaEncontrada=this.iCuenta.findById(cuentaID);
            if (cuentaEncontrada.isPresent())
                return cuentaEncontrada.get();
            else
                throw new Exception("Cuenta no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de cuenta por numero de cuenta
    public MCuenta consultaPorNumero(String numeroCuenta) throws Exception{
        try{
            Optional<MCuenta> cuentaEncontrada=this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuentaEncontrada.isPresent())
                return cuentaEncontrada.get();
            else
                throw new Exception("No existe una cuenta con ese numero");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de las cuentas de un usuario
    public List<MCuenta> consultaPorUsuario(Integer usuarioID) throws Exception{
        try{
            return this.iCuenta.findByUsuarioID(usuarioID);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de cuentas por estado
    public List<MCuenta> consultaPorEstado(String estado) throws Exception{
        try{
            return this.iCuenta.findByEstado(estado);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un registro de cuenta
    public MCuenta modificarCuenta(MCuenta mCuenta,Integer cuentaID) throws Exception{
        try{
            Optional<MCuenta> cuentaEncontrada=this.iCuenta.findById(cuentaID);
            if (cuentaEncontrada.isPresent()){
                MCuenta cuentaNueva=cuentaEncontrada.get();
                copiarDatosCuenta(cuentaNueva, mCuenta);
                return this.iCuenta.save(cuentaNueva);
            }else
                throw new Exception("No se puede modificar porque cuenta no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un registro de cuenta
    public Boolean eliminarCuenta(Integer cuentaID) throws Exception{
        try{
            if (this.iCuenta.existsById(cuentaID)){
                if (!this.iMovimiento.findByCuentaID(cuentaID).isEmpty())
                    throw new Exception("No se puede eliminar porque tiene movimientos relacionados");
                this.iCuenta.deleteById(cuentaID);
                return true;
            }else
                throw new Exception("Cuenta no registrada");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }
}
