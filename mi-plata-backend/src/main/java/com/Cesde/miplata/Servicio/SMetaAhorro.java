package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MMetaAhorro;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Repositorio.IMetaAhorro;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

// Metas de ahorro: cada meta pertenece a una cuenta de ahorros existente y tiene una fecha límite
@Service
public class SMetaAhorro {

    private final IMetaAhorro iMetaAhorro;
    private final ICuenta iCuenta;
    private final ICuentaAhorros iCuentaAhorros;

    public SMetaAhorro(IMetaAhorro iMetaAhorro, ICuenta iCuenta, ICuentaAhorros iCuentaAhorros) {
        this.iMetaAhorro = iMetaAhorro;
        this.iCuenta = iCuenta;
        this.iCuentaAhorros = iCuentaAhorros;
    }

    // Regla de fecha (igual que la de un reto que empieza hoy: no puede ser anterior a hoy)
    public static void validarFecha(LocalDate fechaObjetivo, LocalDate hoy) throws Exception {
        if (fechaObjetivo == null)
            throw new Exception("La fecha objetivo es obligatoria");
        if (fechaObjetivo.isBefore(hoy))
            throw new Exception("La fecha objetivo no puede ser anterior a hoy");
    }

    // Adicionar una meta: valida campos, que la cuenta exista y que sea de ahorros
    public MMetaAhorro adicionar(String numeroCuenta, String nombreMeta,
                                 BigDecimal montoObjetivo, LocalDate fechaObjetivo) throws Exception {
        try {
            if (nombreMeta == null || nombreMeta.isBlank())
                throw new Exception("El nombre de la meta es obligatorio");
            if (nombreMeta.length() > 60)
                throw new Exception("El nombre de la meta no puede superar 60 caracteres");
            if (montoObjetivo == null || montoObjetivo.signum() <= 0)
                throw new Exception("El monto objetivo debe ser mayor que cero");
            validarFecha(fechaObjetivo, LocalDate.now());

            Optional<MCuenta> cuenta = this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuenta.isEmpty())
                throw new Exception("La cuenta " + numeroCuenta + " no está registrada");
            if (!this.iCuentaAhorros.existsById(cuenta.get().getCuentaID()))
                throw new Exception("Las metas solo se pueden crear sobre cuentas de ahorros");

            MMetaAhorro meta = new MMetaAhorro();
            meta.setCuentaID(cuenta.get().getCuentaID());
            meta.setNombreMeta(nombreMeta.trim());
            meta.setMontoObjetivo(montoObjetivo);
            meta.setMontoAhorrado(BigDecimal.ZERO); // el cliente decide cuanto aporta despues
            meta.setFechaObjetivo(fechaObjetivo);
            meta.setFechaCreacion(LocalDateTime.now());
            return this.iMetaAhorro.save(meta);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Metas de una cuenta de ahorros
    public List<MMetaAhorro> consultaPorNumeroCuenta(String numeroCuenta) throws Exception {
        try {
            Optional<MCuenta> cuenta = this.iCuenta.findByNumeroCuenta(numeroCuenta);
            if (cuenta.isEmpty())
                throw new Exception("La cuenta " + numeroCuenta + " no está registrada");
            return this.iMetaAhorro.findByCuentaID(cuenta.get().getCuentaID());
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar una meta: integridad, una meta con dinero ahorrado no se borra (primero se retira el dinero)
    public Boolean eliminar(Integer metaID) throws Exception {
        try {
            Optional<MMetaAhorro> meta = this.iMetaAhorro.findById(metaID);
            if (meta.isEmpty())
                throw new Exception("La meta no está registrada");
            if (meta.get().getMontoAhorrado().signum() > 0)
                throw new Exception("La meta tiene dinero ahorrado: retíralo a tu cuenta antes de eliminarla");
            this.iMetaAhorro.deleteById(metaID);
            return true;
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Cuenta de ahorros -> meta: el cliente decide cuánto aporta, sin pasarse de lo que falta.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion aportar(String numeroCuenta, Integer metaID, BigDecimal montoRaw) {
        BigDecimal monto = Dinero.validar(montoRaw);
        MCuenta cuenta = cargarCuentaAhorros(numeroCuenta);
        MMetaAhorro meta = cargarMeta(metaID, cuenta);

        BigDecimal falta = meta.getMontoObjetivo().subtract(meta.getMontoAhorrado());
        if (falta.signum() <= 0)
            throw new ErrorNegocio("La meta \"" + meta.getNombreMeta() + "\" ya está completa.");
        if (monto.compareTo(falta) > 0)
            throw new ErrorNegocio("El aporte supera lo que falta para la meta ($" + Dinero.pesos(falta) + ").");
        if (monto.compareTo(cuenta.getSaldo()) > 0)
            throw new ErrorNegocio("Saldo insuficiente. Disponible en la cuenta: $"
                    + Dinero.pesos(cuenta.getSaldo().max(BigDecimal.ZERO)));

        cuenta.setSaldo(cuenta.getSaldo().subtract(monto));
        iCuenta.save(cuenta);

        meta.setMontoAhorrado(meta.getMontoAhorrado().add(monto));
        iMetaAhorro.save(meta);

        return RespuestaOperacion.ok()
                .conMonto(monto)
                .conMeta(meta.getNombreMeta())
                .conAhorrado(meta.getMontoAhorrado());
    }

    // Meta -> cuenta de ahorros
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion retirar(String numeroCuenta, Integer metaID, BigDecimal montoRaw) {
        BigDecimal monto = Dinero.validar(montoRaw);
        MCuenta cuenta = cargarCuentaAhorros(numeroCuenta);
        MMetaAhorro meta = cargarMeta(metaID, cuenta);

        if (monto.compareTo(meta.getMontoAhorrado()) > 0)
            throw new ErrorNegocio("La meta solo tiene $" + Dinero.pesos(meta.getMontoAhorrado()) + " ahorrados.");

        meta.setMontoAhorrado(meta.getMontoAhorrado().subtract(monto));
        iMetaAhorro.save(meta);

        cuenta.setSaldo(cuenta.getSaldo().add(monto));
        iCuenta.save(cuenta);

        return RespuestaOperacion.ok()
                .conMonto(monto)
                .conMeta(meta.getNombreMeta())
                .conAhorrado(meta.getMontoAhorrado());
    }

    // Solo las cuentas de ahorros manejan metas. La cuenta se bloquea durante la transacción.
    private MCuenta cargarCuentaAhorros(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isBlank())
            throw new ErrorNegocio("El numero de cuenta es obligatorio.");
        MCuenta cuenta = iCuenta.buscarPorNumeroBloqueada(numeroCuenta)
                .orElseThrow(() -> new ErrorNegocio("La cuenta \"" + numeroCuenta + "\" no está registrada."));
        if (!"ACTIVA".equals(cuenta.getEstado()))
            throw new ErrorNegocio("La cuenta " + numeroCuenta + " no está activa.");
        if (cuenta.getTipoCuentaID() != 1)
            throw new ErrorNegocio("Las metas de ahorro solo se manejan con cuentas de ahorros.");
        return cuenta;
    }

    // La meta debe existir y pertenecer a la cuenta indicada.
    private MMetaAhorro cargarMeta(Integer metaID, MCuenta cuenta) {
        if (metaID == null)
            throw new ErrorNegocio("Selecciona una meta.");
        MMetaAhorro meta = iMetaAhorro.findById(metaID)
                .orElseThrow(() -> new ErrorNegocio("La meta no está registrada."));
        if (!Objects.equals(meta.getCuentaID(), cuenta.getCuentaID()))
            throw new ErrorNegocio("La meta no pertenece a esta cuenta.");
        return meta;
    }
}
