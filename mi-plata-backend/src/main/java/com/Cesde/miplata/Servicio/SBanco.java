package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.ClienteBancoDTO;
import com.Cesde.miplata.Dto.CuentaBancoDTO;
import com.Cesde.miplata.Dto.MovimientoBancoDTO;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MCuentaAhorros;
import com.Cesde.miplata.Modelo.MCuentaCorriente;
import com.Cesde.miplata.Modelo.MMovimiento;
import com.Cesde.miplata.Modelo.MTarjetaCredito;
import com.Cesde.miplata.Modelo.MUsuario;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Repositorio.ICuentaCorriente;
import com.Cesde.miplata.Repositorio.ITarjetaCredito;
import com.Cesde.miplata.Repositorio.IUsuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

// Lee el estado completo del banco desde la base de datos y lo entrega en el mismo
// formato que ya consume React (_id, _usuario, _cuentas, _movimientos...).
// Ahora usa las relaciones de las entidades en vez de SQL nativo.
@Service
public class SBanco {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final IUsuario iUsuario;
    private final ICuentaAhorros iCuentaAhorros;
    private final ICuentaCorriente iCuentaCorriente;
    private final ITarjetaCredito iTarjetaCredito;

    public SBanco(IUsuario iUsuario, ICuentaAhorros iCuentaAhorros,
                  ICuentaCorriente iCuentaCorriente, ITarjetaCredito iTarjetaCredito) {
        this.iUsuario = iUsuario;
        this.iCuentaAhorros = iCuentaAhorros;
        this.iCuentaCorriente = iCuentaCorriente;
        this.iTarjetaCredito = iTarjetaCredito;
    }

    // Clientes con sus cuentas y movimientos. La transaccion permite leer las
    // colecciones @OneToMany (cuentas, movimientos) mientras se arma la respuesta.
    @Transactional(readOnly = true)
    public List<ClienteBancoDTO> leerClientes() throws Exception {
        try {
            List<ClienteBancoDTO> clientes = new ArrayList<>();
            for (MUsuario usuario : iUsuario.findAllByUsuarioLoginIsNotNullOrderByUsuarioIDAsc()) {
                clientes.add(aCliente(usuario));
            }
            return clientes;
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    private ClienteBancoDTO aCliente(MUsuario usuario) {
        List<CuentaBancoDTO> cuentas = new ArrayList<>();
        if (usuario.getCuentas() != null) {
            for (MCuenta cuenta : usuario.getCuentas()) {
                cuentas.add(aCuenta(cuenta));
            }
        }
        return new ClienteBancoDTO(
                usuario.getUsuarioID(),
                texto(usuario.getIdentificacion()),
                usuario.getNombre(),
                texto(usuario.getCelular()),
                usuario.getUsuarioLogin(),
                usuario.getClave(), // el panel administrador muestra la clave para la entrega académica
                fecha(usuario.getFechaRegistro()),
                usuario.getRol(),
                usuario.getIntentosFallidos() == null ? 0 : usuario.getIntentosFallidos().intValue(),
                Boolean.TRUE.equals(usuario.getCuentaBloqueada()),
                cuentas);
    }

    private CuentaBancoDTO aCuenta(MCuenta cuenta) {
        int tipo = cuenta.getTipoCuentaID();
        String nombreTipo = switch (tipo) {
            case 1 -> "CuentaAhorros";
            case 2 -> "CuentaCorriente";
            default -> "TarjetaCredito";
        };

        BigDecimal tasa = iCuentaAhorros.findById(cuenta.getCuentaID())
                .map(MCuentaAhorros::getTasaInteres)
                .orElse(BigDecimal.ZERO);
        BigDecimal porcentajeSobregiro = iCuentaCorriente.findById(cuenta.getCuentaID())
                .map(MCuentaCorriente::getPorcentajeSobregiro)
                .orElse(BigDecimal.ZERO);
        BigDecimal limiteSobregiro = iCuentaCorriente.findById(cuenta.getCuentaID())
                .map(MCuentaCorriente::getLimiteSobregiro)
                .orElse(BigDecimal.ZERO);

        BigDecimal cupo = null;
        BigDecimal deuda = null;
        BigDecimal saldo = null;
        if (tipo == 3) {
            MTarjetaCredito tarjeta = iTarjetaCredito.findById(cuenta.getCuentaID()).orElse(null);
            cupo = tarjeta == null ? BigDecimal.ZERO : tarjeta.getCupo();
            deuda = tarjeta == null ? BigDecimal.ZERO : tarjeta.getDeuda();
        } else {
            saldo = cuenta.getSaldo();
        }

        List<MovimientoBancoDTO> movimientos = new ArrayList<>();
        if (cuenta.getMovimientos() != null) {
            for (MMovimiento movimiento : cuenta.getMovimientos()) {
                movimientos.add(new MovimientoBancoDTO(
                        movimiento.getMovimientoID().longValue(),
                        fecha(movimiento.getFechaMovimiento()),
                        movimiento.getTipoMovimiento() == null ? "" : movimiento.getTipoMovimiento().getNombreTipo(),
                        movimiento.getMontoMovimiento(),
                        movimiento.getSaldoPosterior(),
                        texto(movimiento.getDescripcionMovimiento())));
            }
        }

        return new CuentaBancoDTO(
                nombreTipo,
                cuenta.getNumeroCuenta(),
                fecha(cuenta.getFechaCreacion()),
                cuenta.getEstado(),
                tasa,
                porcentajeSobregiro,
                limiteSobregiro,
                cupo,
                deuda,
                saldo,
                movimientos);
    }

    private static String fecha(LocalDateTime valor) {
        return valor == null ? null : valor.format(FECHA);
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor;
    }
}
