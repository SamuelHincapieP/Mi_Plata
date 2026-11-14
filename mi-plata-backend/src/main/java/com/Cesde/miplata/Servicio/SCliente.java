package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.ClienteDTO;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Modelo.MBolsillo;
import com.Cesde.miplata.Modelo.MCuenta;
import com.Cesde.miplata.Modelo.MCuentaAhorros;
import com.Cesde.miplata.Modelo.MCuentaCorriente;
import com.Cesde.miplata.Modelo.MMetaAhorro;
import com.Cesde.miplata.Modelo.MTarjetaCredito;
import com.Cesde.miplata.Modelo.MUsuario;
import com.Cesde.miplata.Repositorio.IBolsillo;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.ICuentaAhorros;
import com.Cesde.miplata.Repositorio.ICuentaCorriente;
import com.Cesde.miplata.Repositorio.IMetaAhorro;
import com.Cesde.miplata.Repositorio.ITarjetaCredito;
import com.Cesde.miplata.Repositorio.ITipoCuenta;
import com.Cesde.miplata.Repositorio.IUsuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// Login y administracion de clientes: crear, editar, bloquear, cambiar contrasena,
// reiniciar saldos y eliminar. Trabaja con entidades y repositorios.
@Service
public class SCliente {

    private static final BigDecimal CUPO_NUEVO = new BigDecimal("3000000");

    private final IUsuario iUsuario;
    private final ICuenta iCuenta;
    private final ICuentaAhorros iCuentaAhorros;
    private final ICuentaCorriente iCuentaCorriente;
    private final ITarjetaCredito iTarjetaCredito;
    private final ITipoCuenta iTipoCuenta;
    private final IBolsillo iBolsillo;
    private final IMetaAhorro iMetaAhorro;

    public SCliente(IUsuario iUsuario, ICuenta iCuenta, ICuentaAhorros iCuentaAhorros,
                    ICuentaCorriente iCuentaCorriente, ITarjetaCredito iTarjetaCredito,
                    ITipoCuenta iTipoCuenta, IBolsillo iBolsillo, IMetaAhorro iMetaAhorro) {
        this.iUsuario = iUsuario;
        this.iCuenta = iCuenta;
        this.iCuentaAhorros = iCuentaAhorros;
        this.iCuentaCorriente = iCuentaCorriente;
        this.iTarjetaCredito = iTarjetaCredito;
        this.iTipoCuenta = iTipoCuenta;
        this.iBolsillo = iBolsillo;
        this.iMetaAhorro = iMetaAhorro;
    }

    // ═════════════════ LOGIN ═════════════════
    // No lanza excepcion por una contrasena incorrecta: asi el contador de intentos
    // fallidos se guarda en la misma transaccion.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion login(String usuario, String contrasena) {
        try {
            String nombreUsuario = texto(usuario).toLowerCase();
            String clave = texto(contrasena);
            if (nombreUsuario.isEmpty() || clave.isEmpty())
                return RespuestaOperacion.error("Ingresa usuario y contrasena.");

            Optional<MUsuario> encontrado = iUsuario.buscarPorUsuarioLoginBloqueado(nombreUsuario);
            if (encontrado.isEmpty())
                return RespuestaOperacion.error("Usuario no encontrado.");

            MUsuario mUsuario = encontrado.get();
            int intentos = mUsuario.getIntentosFallidos() == null ? 0 : mUsuario.getIntentosFallidos();
            if (Boolean.TRUE.equals(mUsuario.getCuentaBloqueada()))
                return RespuestaOperacion.error("Cuenta bloqueada por demasiados intentos fallidos.")
                        .conBloqueado(true).conIntentos(intentos);

            if (clave.equals(mUsuario.getClave())) {
                mUsuario.setIntentosFallidos((byte) 0);
                iUsuario.save(mUsuario);
                return RespuestaOperacion.ok().conUsuario(nombreUsuario);
            }

            intentos++;
            boolean bloqueado = intentos >= 3; // misma regla que Cliente.incrementarIntentos()
            mUsuario.setIntentosFallidos((byte) intentos);
            mUsuario.setCuentaBloqueada(bloqueado);
            iUsuario.save(mUsuario);
            return RespuestaOperacion.error("Contrasena incorrecta.")
                    .conIntentos(intentos).conBloqueado(bloqueado);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // ═════════════════ ADMINISTRACION DE CLIENTES ═════════════════

    // Alta: cliente (con los productos elegidos) o administrador (sin productos).
    // Numeracion igual que el frontend: AHO-id*10, CTE-id*10+1, TC-id*10+2.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion crearCliente(ClienteDTO datos) {
        try {
            String cedula = texto(datos.cedula());
            String nombre = texto(datos.nombre());
            String celular = texto(datos.celular());
            String usuario = texto(datos.usuario()).toLowerCase();
            String contrasena = texto(datos.contrasena());
            boolean admin = "admin".equals(texto(datos.rol()));

            validarDatos(cedula, nombre, celular, usuario, contrasena, 0);

            // Un cliente necesita al menos un producto; un admin no tiene productos
            List<String> productos = new ArrayList<>();
            if (!admin) {
                if (datos.productos() == null || datos.productos().isEmpty())
                    throw new ErrorNegocio("Selecciona al menos un producto: cuenta de ahorros, corriente o tarjeta de crédito.");
                for (String producto : datos.productos()) {
                    String nombreProducto = texto(producto);
                    if (!List.of("ahorros", "corriente", "tc").contains(nombreProducto))
                        throw new ErrorNegocio("Producto no válido: " + nombreProducto + ".");
                    if (!productos.contains(nombreProducto)) productos.add(nombreProducto);
                }
            }

            MUsuario mUsuario = new MUsuario();
            mUsuario.setNombre(nombre);
            mUsuario.setEmail(usuario + "@miplata.com");
            mUsuario.setClave(contrasena);
            mUsuario.setIntentosFallidos((byte) 0);
            mUsuario.setCuentaBloqueada(false);
            mUsuario.setRol(admin ? "admin" : "cliente");
            mUsuario.setIdentificacion(cedula);
            mUsuario.setCelular(celular);
            mUsuario.setUsuarioLogin(usuario);
            mUsuario.setFechaRegistro(LocalDateTime.now());
            iUsuario.save(mUsuario);

            int id = mUsuario.getUsuarioID();
            if (!admin) {
                long base = id * 10L;
                if (productos.contains("ahorros")) crearCuenta(id, "AHO-" + pad(base), 1);
                if (productos.contains("corriente")) crearCuenta(id, "CTE-" + pad(base + 1), 2);
                if (productos.contains("tc")) crearCuenta(id, "TC-" + pad(base + 2), 3);
            }
            return RespuestaOperacion.ok().conId(id);
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion editarCliente(int id, ClienteDTO datos) {
        try {
            MUsuario mUsuario = existeCliente(id);
            String usuario = texto(datos.usuario()).toLowerCase();
            String cedula = texto(datos.cedula());
            String nombre = texto(datos.nombre());
            String celular = texto(datos.celular());
            String contrasena = texto(datos.contrasena());
            validarDatos(cedula, nombre, celular, usuario, contrasena, id);

            mUsuario.setNombre(nombre);
            mUsuario.setEmail(usuario + "@miplata.com");
            mUsuario.setClave(contrasena);
            mUsuario.setIdentificacion(cedula);
            mUsuario.setCelular(celular);
            mUsuario.setUsuarioLogin(usuario);
            iUsuario.save(mUsuario);
            return RespuestaOperacion.ok();
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // Bloquear, o desbloquear (al desbloquear se reinician los intentos fallidos).
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion cambiarEstado(int id, boolean bloquear) {
        try {
            MUsuario mUsuario = existeCliente(id);
            mUsuario.setCuentaBloqueada(bloquear);
            mUsuario.setIntentosFallidos((byte) (bloquear ? 3 : 0));
            iUsuario.save(mUsuario);
            return RespuestaOperacion.ok();
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // El servidor verifica la contrasena actual antes de cambiarla.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion cambiarContrasena(int id, String antigua, String nueva) {
        try {
            MUsuario mUsuario = existeCliente(id);
            if (!texto(antigua).equals(mUsuario.getClave()))
                throw new ErrorNegocio("La contrasena actual no es correcta.");
            if (texto(nueva).length() < 4)
                throw new ErrorNegocio("La nueva contrasena debe tener al menos 4 caracteres.");
            mUsuario.setClave(texto(nueva));
            iUsuario.save(mUsuario);
            return RespuestaOperacion.ok();
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // Pone en cero los saldos y las deudas (la tarjeta recupera todo su cupo).
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion resetearSaldos(int id) {
        try {
            MUsuario mUsuario = existeCliente(id);
            for (MCuenta cuenta : mUsuario.getCuentas()) {
                if (cuenta.getTipoCuentaID() == 3) {
                    MTarjetaCredito tarjeta = iTarjetaCredito.findById(cuenta.getCuentaID()).orElse(null);
                    if (tarjeta != null) {
                        tarjeta.setDeuda(BigDecimal.ZERO);
                        iTarjetaCredito.save(tarjeta);
                    }
                    cuenta.setSaldo(tarjeta == null ? BigDecimal.ZERO : tarjeta.getCupo());
                } else {
                    cuenta.setSaldo(BigDecimal.ZERO);
                }
                iCuenta.save(cuenta);

                if (cuenta.getBolsillos() != null) {
                    for (MBolsillo bolsillo : cuenta.getBolsillos()) {
                        bolsillo.setSaldo(BigDecimal.ZERO);
                        iBolsillo.save(bolsillo);
                    }
                }
                if (cuenta.getMetas() != null) {
                    for (MMetaAhorro meta : cuenta.getMetas()) {
                        meta.setMontoAhorrado(BigDecimal.ZERO);
                        iMetaAhorro.save(meta);
                    }
                }
            }
            return RespuestaOperacion.ok();
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // Borra el cliente solo si no dejo historial ni dinero en ninguna estructura.
    @Transactional(rollbackFor = Exception.class)
    public RespuestaOperacion eliminarCliente(int id) {
        try {
            MUsuario mUsuario = existeCliente(id);

            long movimientos = 0;
            for (MCuenta cuenta : mUsuario.getCuentas()) {
                if (cuenta.getMovimientos() != null)
                    movimientos += cuenta.getMovimientos().size();
            }
            if (movimientos > 0)
                throw new ErrorNegocio("No se puede eliminar: el cliente tiene " + movimientos + " movimientos relacionados.");

            for (MCuenta cuenta : mUsuario.getCuentas()) {
                if (cuenta.getTipoCuentaID() == 3) {
                    MTarjetaCredito tarjeta = iTarjetaCredito.findById(cuenta.getCuentaID()).orElse(null);
                    if (tarjeta != null && tarjeta.getDeuda().signum() != 0)
                        throw new ErrorNegocio("No se puede eliminar: el cliente tiene saldos pendientes en sus cuentas.");
                } else if (cuenta.getSaldo().signum() != 0) {
                    throw new ErrorNegocio("No se puede eliminar: el cliente tiene saldos pendientes en sus cuentas.");
                }

                if (cuenta.getBolsillos() != null) {
                    for (MBolsillo bolsillo : cuenta.getBolsillos()) {
                        if (bolsillo.getSaldo().signum() != 0)
                            throw new ErrorNegocio("No se puede eliminar: el cliente tiene dinero guardado en bolsillos.");
                    }
                }
                if (cuenta.getMetas() != null) {
                    for (MMetaAhorro meta : cuenta.getMetas()) {
                        if (meta.getMontoAhorrado().signum() != 0)
                            throw new ErrorNegocio("No se puede eliminar: el cliente tiene dinero ahorrado en metas.");
                    }
                }
            }

            // La base tiene ON DELETE CASCADE: al borrar el usuario se borran sus cuentas y lo que cuelga
            // de ellas. Se sueltan las relaciones en memoria para que Hibernate no intente volver a
            // guardar el usuario que se está eliminando.
            for (MCuenta cuenta : mUsuario.getCuentas()) {
                cuenta.setUsuario(null);
            }

            iUsuario.deleteById(id);
            return RespuestaOperacion.ok();
        } catch (ErrorNegocio error) {
            throw error;
        } catch (Exception error) {
            throw new ErrorNegocio("No se pudo completar la operación: " + error.getMessage());
        }
    }

    // ═════════════════ Apoyo ═════════════════

    private MUsuario existeCliente(int id) {
        return iUsuario.findById(id)
                .orElseThrow(() -> new ErrorNegocio("Cliente no encontrado."));
    }

    // Crea la fila de cuenta y la fila de su subtipo (ahorros, corriente o tarjeta).
    private void crearCuenta(int usuarioID, String numero, int tipo) {
        if (!iTipoCuenta.existsById(tipo))
            throw new ErrorNegocio("El tipo de cuenta " + tipo + " no existe.");

        MCuenta cuenta = new MCuenta();
        cuenta.setNumeroCuenta(numero);
        cuenta.setSaldo(tipo == 3 ? CUPO_NUEVO : BigDecimal.ZERO);
        cuenta.setEstado("ACTIVA");
        cuenta.setFechaCreacion(LocalDateTime.now());
        cuenta.setUsuarioID(usuarioID);
        cuenta.setTipoCuentaID(tipo);
        iCuenta.save(cuenta);

        Integer cuentaID = cuenta.getCuentaID();

        if (tipo == 1) {
            MCuentaAhorros ahorros = new MCuentaAhorros();
            ahorros.setCuentaID(cuentaID);
            ahorros.setTasaInteres(new BigDecimal("0.02"));
            iCuentaAhorros.save(ahorros);
        } else if (tipo == 2) {
            MCuentaCorriente corriente = new MCuentaCorriente();
            corriente.setCuentaID(cuentaID);
            corriente.setPorcentajeSobregiro(new BigDecimal("0.05"));
            corriente.setLimiteSobregiro(new BigDecimal("1000000"));
            iCuentaCorriente.save(corriente);
        } else {
            MTarjetaCredito tarjeta = new MTarjetaCredito();
            tarjeta.setCuentaID(cuentaID);
            tarjeta.setCupo(CUPO_NUEVO);
            tarjeta.setDeuda(BigDecimal.ZERO);
            tarjeta.setNumeroCuotas(0);
            tarjeta.setTasaMensual(new BigDecimal("0.0250"));
            iTarjetaCredito.save(tarjeta);
        }
    }

    // Mismas reglas que validarDatosCliente() del frontend, ahora tambien en el servidor.
    private void validarDatos(String cedula, String nombre, String celular,
                              String usuario, String contrasena, int idIgnorado) {
        if (cedula.isBlank() || nombre.isBlank() || celular.isBlank()
                || usuario.isBlank() || contrasena.isBlank())
            throw new ErrorNegocio("Todos los campos son obligatorios.");
        if (!cedula.matches("^[0-9]{6,10}$"))
            throw new ErrorNegocio("El documento debe tener entre 6 y 10 numeros.");
        if (!celular.matches("^[0-9]{10}$"))
            throw new ErrorNegocio("El celular debe tener exactamente 10 digitos.");
        if (!usuario.matches("^[a-z0-9._-]{3,20}$"))
            throw new ErrorNegocio("El usuario debe tener de 3 a 20 caracteres, sin espacios.");
        if (contrasena.length() < 4)
            throw new ErrorNegocio("La contrasena debe tener al menos 4 caracteres.");

        Optional<MUsuario> mismoLogin = iUsuario.findByUsuarioLogin(usuario);
        if (mismoLogin.isPresent() && mismoLogin.get().getUsuarioID() != idIgnorado)
            throw new ErrorNegocio("El usuario \"" + usuario + "\" ya existe.");

        if (iUsuario.existsByIdentificacionAndUsuarioIDNot(cedula, idIgnorado))
            throw new ErrorNegocio("Ya existe un cliente con ese documento.");
    }

    private static String pad(long numero) {
        return String.format("%03d", numero);
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
