package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Modelo.MBolsillo;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Repositorio.IBolsillo;
import com.Cesde.miplata.Repositorio.ICuenta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

// Bolsillos (apartados de dinero dentro de una cuenta, como en Nequi).
// Aquí se crean, consultan, eliminan y se mueve dinero entre la cuenta y el bolsillo.
// Mover dinero NO genera movimientos: no es una transaccion bancaria, es solo repartir el dinero propio.
@Service
public class SBolsillo {

    public static final int MAX_NOMBRE = 40;

    private final IBolsillo iBolsillo;
    private final ICuenta iCuenta;

    public SBolsillo(IBolsillo iBolsillo, ICuenta iCuenta) {
        this.iBolsillo = iBolsillo;
        this.iCuenta = iCuenta;
    }

    // Validar el nombre (obligatorio y de maximo 40 caracteres, como la columna de la base)
    public static void validarNombre(String nombre) throws Exception {
        if (nombre == null || nombre.isBlank())
            throw new Exception("El nombre del bolsillo es obligatorio");
        if (nombre.trim().length() > MAX_NOMBRE)
            throw new Exception("El nombre del bolsillo no puede superar " + MAX_NOMBRE + " caracteres");
    }

    // Adicionar: la cuenta debe existir, no ser tarjeta de credito y el nombre no repetirse
    public MBolsillo adicionar(String numeroCuenta, String nombreBolsillo) throws Exception {
        try {
            validarNombre(nombreBolsillo);
            Optional<MCuenta> cuenta = this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuenta.isEmpty())
                throw new Exception("La cuenta " + numeroCuenta + " no está registrada");
            if (cuenta.get().getTipoCuentaID() == 3)
                throw new Exception("Las tarjetas de crédito no tienen bolsillos");
            if (this.iBolsillo.findByCuentaIDAndNombreBolsillo(cuenta.get().getCuentaID(), nombreBolsillo.trim()).isPresent())
                throw new Exception("Ya tienes un bolsillo llamado \"" + nombreBolsillo.trim() + "\" en esta cuenta");

            MBolsillo bolsillo = new MBolsillo();
            bolsillo.setCuentaID(cuenta.get().getCuentaID());
            bolsillo.setNombreBolsillo(nombreBolsillo.trim());
            bolsillo.setSaldo(BigDecimal.ZERO);
            bolsillo.setFechaCreacion(LocalDateTime.now());
            return this.iBolsillo.save(bolsillo);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Bolsillos de una cuenta
    public List<MBolsillo> consultaPorNumeroCuenta(String numeroCuenta) throws Exception {
        try {
            Optional<MCuenta> cuenta = this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuenta.isEmpty())
                throw new Exception("La cuenta " + numeroCuenta + " no está registrada");
            return this.iBolsillo.findByCuentaID(cuenta.get().getCuentaID());
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar: integridad, un bolsillo con dinero no se borra (primero se retira el dinero)
    public Boolean eliminar(Integer bolsilloID) throws Exception {
        try {
            Optional<MBolsillo> bolsillo = this.iBolsillo.findById(bolsilloID);
            if (bolsillo.isEmpty())
                throw new Exception("El bolsillo no está registrado");
            if (bolsillo.get().getSaldo().signum() > 0)
                throw new Exception("El bolsillo tiene dinero guardado: retíralo a tu cuenta antes de eliminarlo");
            this.iBolsillo.deleteById(bolsilloID);
            return true;
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Cuenta -> bolsillo. La cuenta se bloquea durante la transacción para que dos
    // operaciones no muevan el mismo dinero al mismo tiempo.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion depositar(String numeroCuenta, Integer bolsilloID, BigDecimal montoRaw) {
        BigDecimal monto = Dinero.validar(montoRaw);
        MCuenta cuenta = cargarCuenta(numeroCuenta);
        MBolsillo bolsillo = cargarBolsillo(bolsilloID, cuenta);

        if (monto.compareTo(cuenta.getSaldo()) > 0)
            throw new ErrorNegocio("Saldo insuficiente. Disponible en la cuenta: $"
                    + Dinero.pesos(cuenta.getSaldo().max(BigDecimal.ZERO)));

        cuenta.setSaldo(cuenta.getSaldo().subtract(monto));
        iCuenta.save(cuenta);

        bolsillo.setSaldo(bolsillo.getSaldo().add(monto));
        iBolsillo.save(bolsillo);

        return RespuestaOperacion.ok().conMonto(monto).conBolsillo(bolsillo.getNombreBolsillo());
    }

    // Bolsillo -> cuenta
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion retirar(String numeroCuenta, Integer bolsilloID, BigDecimal montoRaw) {
        BigDecimal monto = Dinero.validar(montoRaw);
        MCuenta cuenta = cargarCuenta(numeroCuenta);
        MBolsillo bolsillo = cargarBolsillo(bolsilloID, cuenta);

        if (monto.compareTo(bolsillo.getSaldo()) > 0)
            throw new ErrorNegocio("El bolsillo solo tiene $" + Dinero.pesos(bolsillo.getSaldo()) + ".");

        bolsillo.setSaldo(bolsillo.getSaldo().subtract(monto));
        iBolsillo.save(bolsillo);

        cuenta.setSaldo(cuenta.getSaldo().add(monto));
        iCuenta.save(cuenta);

        return RespuestaOperacion.ok().conMonto(monto).conBolsillo(bolsillo.getNombreBolsillo());
    }

    // Cuenta activa y bloqueada para operar con dinero.
    private MCuenta cargarCuenta(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank())
            throw new ErrorNegocio("El numero de cuenta es obligatorio.");
        MCuenta cuenta = iCuenta.buscarPorNumeroBloqueada(numeroCuenta)
                .orElseThrow(() -> new ErrorNegocio("La cuenta \"" + numeroCuenta + "\" no está registrada."));
        if (!"ACTIVA".equals(cuenta.getEstado()))
            throw new ErrorNegocio("La cuenta " + numeroCuenta + " no está activa.");
        if (cuenta.getTipoCuentaID() == 3)
            throw new ErrorNegocio("Las tarjetas de crédito no tienen bolsillos.");
        return cuenta;
    }

    // El bolsillo debe existir y pertenecer a la cuenta indicada.
    private MBolsillo cargarBolsillo(Integer bolsilloID, MCuenta cuenta) {
        if (bolsilloID == null)
            throw new ErrorNegocio("Selecciona un bolsillo.");
        MBolsillo bolsillo = iBolsillo.findById(bolsilloID)
                .orElseThrow(() -> new ErrorNegocio("El bolsillo no está registrado."));
        if (!Objects.equals(bolsillo.getCuentaID(), cuenta.getCuentaID()))
            throw new ErrorNegocio("El bolsillo no pertenece a esta cuenta.");
        return bolsillo;
    }
}
