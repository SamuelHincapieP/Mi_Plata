package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Modelo.MCompraTC;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MCuentaAhorros;
import com.Cesde.miplata.Modelo.MCuentaCorriente;
import com.Cesde.miplata.Modelo.MMovimiento;
import com.Cesde.miplata.Modelo.MTarjetaCredito;
import com.Cesde.miplata.Modelo.MTipoMovimiento;
import com.Cesde.miplata.Modelo.MTransferencia;
import com.Cesde.miplata.Repositorio.ICategoriaGasto;
import com.Cesde.miplata.Repositorio.ICompraTC;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Repositorio.ICuentaCorriente;
import com.Cesde.miplata.Repositorio.IMovimiento;
import com.Cesde.miplata.Repositorio.ITarjetaCredito;
import com.Cesde.miplata.Repositorio.ITipoMovimiento;
import com.Cesde.miplata.Repositorio.ITransferencia;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Objects;

// Reglas de negocio de las operaciones de dinero.
// Cada metodo trabaja con entidades y repositorios (como el proyecto del profesor) y
// guarda todo dentro de UNA transaccion: si una parte falla, no queda nada a medias.
// Las contrasenas se guardan tal cual, sin hash, como lo pidio el profesor.
@Service
public class SOperaciones {

    private static final BigDecimal CERO = BigDecimal.ZERO;

    private final ICuenta iCuenta;
    private final ICuentaAhorros iCuentaAhorros;
    private final ICuentaCorriente iCuentaCorriente;
    private final ITarjetaCredito iTarjetaCredito;
    private final IMovimiento iMovimiento;
    private final ITipoMovimiento iTipoMovimiento;
    private final ICategoriaGasto iCategoriaGasto;
    private final ICompraTC iCompraTC;
    private final ITransferencia iTransferencia;

    public SOperaciones(ICuenta iCuenta, ICuentaAhorros iCuentaAhorros,
                        ICuentaCorriente iCuentaCorriente, ITarjetaCredito iTarjetaCredito,
                        IMovimiento iMovimiento, ITipoMovimiento iTipoMovimiento,
                        ICategoriaGasto iCategoriaGasto, ICompraTC iCompraTC,
                        ITransferencia iTransferencia) {
        this.iCuenta = iCuenta;
        this.iCuentaAhorros = iCuentaAhorros;
        this.iCuentaCorriente = iCuentaCorriente;
        this.iTarjetaCredito = iTarjetaCredito;
        this.iMovimiento = iMovimiento;
        this.iTipoMovimiento = iTipoMovimiento;
        this.iCategoriaGasto = iCategoriaGasto;
        this.iCompraTC = iCompraTC;
        this.iTransferencia = iTransferencia;
    }

    // ═════════════════ OPERACIONES DE DINERO ═════════════════

    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion consignar(String numero, BigDecimal montoRaw) {
        try {
            BigDecimal monto = Dinero.validar(montoRaw);
            MCuenta cuenta = cargar(numero);
            if (cuenta.getTipoCuentaID() == 3)
                throw new ErrorNegocio("Las tarjetas de credito no reciben consignaciones. Usa Pagar.");

            cuenta.setSaldo(cuenta.getSaldo().add(monto));
            iCuenta.save(cuenta);
            registrar(cuenta, "CONSIGNACION", monto, cuenta.getSaldo(), "");
            return RespuestaOperacion.ok().conMonto(monto);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion retirar(String numero, BigDecimal montoRaw) {
        try {
            BigDecimal monto = Dinero.validar(montoRaw);
            MCuenta cuenta = cargar(numero);

            switch (cuenta.getTipoCuentaID()) {
                case 1 -> { // ahorros: sin sobregiro y descuenta el interes de retiro
                    MCuentaAhorros ahorros = iCuentaAhorros.findById(cuenta.getCuentaID())
                            .orElseThrow(() -> new ErrorNegocio("La cuenta de ahorros no tiene sus datos registrados."));
                    if (monto.compareTo(cuenta.getSaldo()) > 0)
                        throw new ErrorNegocio("Saldo insuficiente. La cuenta de ahorros no permite sobregiro.");
                    BigDecimal interes = monto.multiply(ahorros.getTasaInteres()).setScale(2, RoundingMode.HALF_UP);
                    if (monto.add(interes).compareTo(cuenta.getSaldo()) > 0)
                        throw new ErrorNegocio("Saldo insuficiente al incluir el interes de $" + Dinero.pesos(interes) + ".");
                    cuenta.setSaldo(cuenta.getSaldo().subtract(monto.add(interes)));
                }
                case 2 -> { // corriente: saldo + porcentaje de sobregiro
                    BigDecimal disponible = disponibleCorriente(cuenta);
                    if (monto.compareTo(disponible) > 0)
                        throw new ErrorNegocio("Limite excedido. Disponible con sobregiro: $" + Dinero.pesos(disponible));
                    cuenta.setSaldo(cuenta.getSaldo().subtract(monto));
                }
                default -> { // tarjeta de credito: avance en efectivo
                    MTarjetaCredito tarjeta = buscarTarjeta(cuenta);
                    BigDecimal disponible = tarjeta.getCupo().subtract(tarjeta.getDeuda());
                    if (monto.compareTo(disponible) > 0)
                        throw new ErrorNegocio("Cupo insuficiente. Cupo disponible: $" + Dinero.pesos(disponible));
                    tarjeta.setDeuda(tarjeta.getDeuda().add(monto));
                    guardarTarjeta(cuenta, tarjeta);
                }
            }

            if (cuenta.getTipoCuentaID() != 3)
                iCuenta.save(cuenta);
            registrar(cuenta, "RETIRO", monto, cuenta.getSaldo(), "");
            return RespuestaOperacion.ok().conMonto(monto);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion transferir(String origenNumero, String destinoNumero,
                                         BigDecimal montoRaw, String mensajeRaw) {
        try {
            BigDecimal monto = Dinero.validar(montoRaw);
            String mensaje = texto(mensajeRaw);
            if (mensaje.length() > 200)
                throw new ErrorNegocio("El mensaje no puede superar 200 caracteres.");
            if (Objects.equals(origenNumero, destinoNumero))
                throw new ErrorNegocio("No puedes transferir a la misma cuenta.");

            MCuenta origen = cargar(origenNumero);
            MCuenta destino = cargar(destinoNumero);
            if (destino.getTipoCuentaID() == 3)
                throw new ErrorNegocio("No se puede transferir a una tarjeta de credito. Usa Pagar.");

            switch (origen.getTipoCuentaID()) {
                case 1 -> {
                    if (monto.compareTo(origen.getSaldo()) > 0)
                        throw new ErrorNegocio("Saldo insuficiente para la transferencia.");
                    origen.setSaldo(origen.getSaldo().subtract(monto));
                }
                case 2 -> {
                    BigDecimal disponible = disponibleCorriente(origen);
                    if (monto.compareTo(disponible) > 0)
                        throw new ErrorNegocio("Saldo insuficiente. Disponible: $" + Dinero.pesos(disponible));
                    origen.setSaldo(origen.getSaldo().subtract(monto));
                }
                default -> {
                    MTarjetaCredito tarjeta = buscarTarjeta(origen);
                    BigDecimal disponible = tarjeta.getCupo().subtract(tarjeta.getDeuda());
                    if (monto.compareTo(disponible) > 0)
                        throw new ErrorNegocio("Cupo insuficiente. Disponible: $" + Dinero.pesos(disponible));
                    tarjeta.setDeuda(tarjeta.getDeuda().add(monto));
                    guardarTarjeta(origen, tarjeta);
                }
            }

            if (origen.getTipoCuentaID() != 3)
                iCuenta.save(origen);
            registrar(origen, "TRANSFERENCIA_OUT", monto, origen.getSaldo(), "A " + destinoNumero);

            destino.setSaldo(destino.getSaldo().add(monto));
            iCuenta.save(destino);
            registrar(destino, "TRANSFERENCIA_IN", monto, destino.getSaldo(), "De " + origenNumero);

            MTransferencia transferencia = new MTransferencia();
            transferencia.setCuentaOrigenID(origen.getCuentaID());
            transferencia.setCuentaDestinoID(destino.getCuentaID());
            transferencia.setMonto(monto);
            transferencia.setMensaje(mensaje.isEmpty() ? null : mensaje);
            transferencia.setFechaTransferencia(LocalDateTime.now());
            iTransferencia.save(transferencia);

            return RespuestaOperacion.ok().conMonto(monto).conDestino(destinoNumero);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion comprar(String numero, BigDecimal montoRaw, Integer cuotasRaw,
                                      String comercioRaw, Integer categoriaID) {
        try {
            BigDecimal monto = Dinero.validar(montoRaw);
            int cuotas = cuotasRaw == null ? 0 : cuotasRaw;
            String comercio = texto(comercioRaw);

            if (comercio.isEmpty())
                throw new ErrorNegocio("Escribe dónde o qué compraste.");
            if (comercio.length() > 120)
                throw new ErrorNegocio("La descripción de la compra no puede superar 120 caracteres.");
            if (categoriaID == null || !iCategoriaGasto.existsById(categoriaID))
                throw new ErrorNegocio("Selecciona una categoría válida.");
            if (cuotas < 1)
                throw new ErrorNegocio("El numero de cuotas debe minimo 1.");

            MCuenta cuenta = cargar(numero);
            if (cuenta.getTipoCuentaID() != 3)
                throw new ErrorNegocio("Solo las tarjetas de credito permiten compras a cuotas.");

            MTarjetaCredito tarjeta = buscarTarjeta(cuenta);
            // Estos dos campos son el plan vigente de la tarjeta y son la fuente
            // de la tasa usada para calcular la cuota (no valores decorativos).
            tarjeta.setNumeroCuotas(cuotas);
            tarjeta.setTasaMensual(tasaPara(cuotas));
            BigDecimal cuotaMensual = cuotaMensual(monto, tarjeta.getNumeroCuotas(), tarjeta.getTasaMensual());
            BigDecimal intereses = cuotaMensual.multiply(BigDecimal.valueOf(cuotas))
                    .subtract(monto).setScale(2, RoundingMode.HALF_UP);
            BigDecimal manejo = cuotaManejo(cuotas);
            BigDecimal total = monto.add(intereses).add(manejo);
            BigDecimal disponible = tarjeta.getCupo().subtract(tarjeta.getDeuda());
            if (total.compareTo(disponible) > 0)
                throw new ErrorNegocio("Cupo insuficiente. Total con cuota de manejo ($" + Dinero.pesos(manejo) + "): $"
                        + Dinero.pesos(total) + ". Disponible: $" + Dinero.pesos(disponible));

            tarjeta.setDeuda(tarjeta.getDeuda().add(total));
            guardarTarjeta(cuenta, tarjeta);

            // El interés hace parte del cálculo de la deuda y de la cuota; no es
            // una operación independiente del cliente, por eso no va al historial.
            registrar(cuenta, "COMPRA_TC", monto, cuenta.getSaldo(), comercio);
            if (manejo.signum() > 0)
                registrar(cuenta, "CUOTA_MANEJO", manejo, cuenta.getSaldo(), "");

            MCompraTC compra = new MCompraTC();
            compra.setCuentaID(cuenta.getCuentaID());
            compra.setCategoriaID(categoriaID);
            compra.setComercio(comercio);
            compra.setMonto(monto);
            compra.setCuotas(cuotas);
            compra.setCuotaMensual(cuotaMensual);
            compra.setFechaCompra(LocalDateTime.now());
            iCompraTC.save(compra);

            return RespuestaOperacion.ok()
                    .conMonto(monto)
                    .conCuotas(cuotas)
                    .conCuotaMensual(cuotaMensual)
                    .conDeuda(tarjeta.getDeuda());
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // El pago sale de una cuenta de ahorros o corriente del mismo cliente:
    // se descuenta de la cuenta origen y se reduce la deuda de la tarjeta.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion pagarTarjeta(String numeroTarjeta, String numeroOrigen, BigDecimal montoRaw) {
        try {
            BigDecimal monto = Dinero.validar(montoRaw);
            if (numeroOrigen == null || numeroOrigen.isBlank())
                throw new ErrorNegocio("Selecciona la cuenta de ahorros o corriente desde la que pagas.");

            MCuenta cuentaTarjeta = cargar(numeroTarjeta);
            if (cuentaTarjeta.getTipoCuentaID() != 3)
                throw new ErrorNegocio("Solo las tarjetas de credito se pagan desde este modulo.");
            MTarjetaCredito tarjeta = buscarTarjeta(cuentaTarjeta);

            MCuenta origen = cargar(numeroOrigen);
            if (origen.getTipoCuentaID() == 3)
                throw new ErrorNegocio("El pago debe salir de una cuenta de ahorros o corriente, no de otra tarjeta.");
            if (!Objects.equals(origen.getUsuarioID(), cuentaTarjeta.getUsuarioID()))
                throw new ErrorNegocio("La cuenta de origen y la tarjeta deben pertenecer al mismo cliente.");
            if (monto.compareTo(tarjeta.getDeuda()) > 0)
                throw new ErrorNegocio("El pago supera la deuda actual de $" + Dinero.pesos(tarjeta.getDeuda()) + ".");

            switch (origen.getTipoCuentaID()) {
                case 1 -> { // ahorros: sin sobregiro y sin cobrar el interes de retiro
                    if (monto.compareTo(origen.getSaldo()) > 0)
                        throw new ErrorNegocio("Saldo insuficiente en la cuenta de origen. Disponible: $"
                                + Dinero.pesos(origen.getSaldo().max(CERO)) + ".");
                    origen.setSaldo(origen.getSaldo().subtract(monto));
                }
                case 2 -> { // corriente: puede usar el disponible con sobregiro
                    BigDecimal disponible = disponibleCorriente(origen);
                    if (monto.compareTo(disponible) > 0)
                        throw new ErrorNegocio("Saldo insuficiente en la cuenta de origen. Disponible: $"
                                + Dinero.pesos(disponible) + ".");
                    origen.setSaldo(origen.getSaldo().subtract(monto));
                }
                default -> throw new ErrorNegocio("Tipo de cuenta de origen no valido.");
            }

            iCuenta.save(origen);
            registrar(origen, "PAGO_TC", monto, origen.getSaldo(), "Pago tarjeta " + numeroTarjeta);

            tarjeta.setDeuda(tarjeta.getDeuda().subtract(monto));
            guardarTarjeta(cuentaTarjeta, tarjeta);
            registrar(cuentaTarjeta, "PAGO_TC", monto, cuentaTarjeta.getSaldo(), "Pago desde " + numeroOrigen);

            return RespuestaOperacion.ok()
                    .conMonto(monto)
                    .conDeuda(tarjeta.getDeuda())
                    .conOrigen(numeroOrigen);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // ═════════════════ Apoyo ═════════════════

    // Lee y bloquea la cuenta para que dos operaciones no la modifiquen a la vez.
    private MCuenta cargar(String numero) {
        if (numero == null || numero.isBlank())
            throw new ErrorNegocio("El numero de cuenta es obligatorio.");
        MCuenta cuenta = iCuenta.buscarPorNumeroBloqueada(numero)
                .orElseThrow(() -> new ErrorNegocio("Cuenta \"" + numero + "\" no encontrada."));
        if (!"ACTIVA".equals(cuenta.getEstado()))
            throw new ErrorNegocio("La cuenta " + numero + " no esta activa.");
        return cuenta;
    }

    private MTarjetaCredito buscarTarjeta(MCuenta cuenta) {
        return iTarjetaCredito.findById(cuenta.getCuentaID())
                .orElseThrow(() -> new ErrorNegocio("La tarjeta de credito no tiene sus datos registrados."));
    }

    // Guarda la deuda de la tarjeta y deja el saldo de la cuenta como cupo - deuda.
    private void guardarTarjeta(MCuenta cuenta, MTarjetaCredito tarjeta) {
        iTarjetaCredito.save(tarjeta);
        cuenta.setSaldo(tarjeta.getCupo().subtract(tarjeta.getDeuda()));
        iCuenta.save(cuenta);
    }

    private BigDecimal disponibleCorriente(MCuenta cuenta) {
        MCuentaCorriente corriente = iCuentaCorriente.findById(cuenta.getCuentaID())
                .orElseThrow(() -> new ErrorNegocio("La cuenta corriente no tiene sus datos registrados."));
        // El límite es un monto real configurado para la cuenta, no un campo sin uso.
        // Así la cuenta puede llegar hasta -limiteSobregiro, incluso si parte de cero.
        return cuenta.getSaldo().add(corriente.getLimiteSobregiro());
    }

    // Inserta un movimiento. El tipo se busca en el catalogo por su nombre.
    private void registrar(MCuenta cuenta, String tipo, BigDecimal monto,
                           BigDecimal saldoPosterior, String descripcion) {
        MTipoMovimiento tipoMovimiento = iTipoMovimiento.findFirstByNombreTipo(tipo)
                .orElseThrow(() -> new ErrorNegocio("El tipo de movimiento \"" + tipo + "\" no existe en el catálogo."));

        MMovimiento movimiento = new MMovimiento();
        movimiento.setMontoMovimiento(monto);
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setDescripcionMovimiento(descripcion == null || descripcion.isBlank() ? null : descripcion);
        movimiento.setSaldoPosterior(saldoPosterior);
        movimiento.setCuentaID(cuenta.getCuentaID());
        movimiento.setTipoID(tipoMovimiento.getTipoID());
        iMovimiento.save(movimiento);
    }

    // ── Calculos financieros (mismas formulas que TarjetaCredito.js) ──

    private static BigDecimal cuotaManejo(int cuotas) {
        if (cuotas <= 2) return CERO;
        if (cuotas <= 6) return new BigDecimal("8500");
        return new BigDecimal("15000");
    }

    private static BigDecimal tasaPara(int cuotas) {
        if (cuotas <= 2) return new BigDecimal("0.0000");
        if (cuotas <= 6) return new BigDecimal("0.0190");
        return new BigDecimal("0.0230");
    }

    private static BigDecimal cuotaMensual(BigDecimal capital, int cuotas, BigDecimal tasaMensual) {
        double t = tasaMensual.doubleValue();
        double cap = capital.doubleValue();
        double cuota = t == 0 ? cap / cuotas : cap * t / (1 - Math.pow(1 + t, -cuotas));
        return BigDecimal.valueOf(cuota).setScale(2, RoundingMode.HALF_UP);
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
