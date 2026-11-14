package com.Cesde.miplata.Controlador;

import com.Cesde.miplata.Dto.BolsilloMovimientoDTO;
import com.Cesde.miplata.Dto.CambioContrasenaDTO;
import com.Cesde.miplata.Dto.ClienteDTO;
import com.Cesde.miplata.Dto.CompraSolicitudDTO;
import com.Cesde.miplata.Dto.EstadoClienteDTO;
import com.Cesde.miplata.Dto.LoginDTO;
import com.Cesde.miplata.Dto.MetaMovimientoDTO;
import com.Cesde.miplata.Dto.MontoDTO;
import com.Cesde.miplata.Dto.PagoSolicitudDTO;
import com.Cesde.miplata.Dto.RespuestaOperacion;
import com.Cesde.miplata.Dto.TransferenciaSolicitudDTO;
import com.Cesde.miplata.Servicio.ErrorNegocio;
import com.Cesde.miplata.Servicio.SBanco;
import com.Cesde.miplata.Servicio.SBolsillo;
import com.Cesde.miplata.Servicio.SCliente;
import com.Cesde.miplata.Servicio.SMetaAhorro;
import com.Cesde.miplata.Servicio.SOperaciones;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Endpoints de login, operaciones bancarias y administración de clientes.
// Cada respuesta exitosa incluye la lista de clientes ya actualizada desde MariaDB.
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Operaciones bancarias y clientes",
     description = "Login, operaciones de dinero (consignar, retirar, transferir, comprar, pagar) y administración de clientes")
public class COperaciones {

    private final SOperaciones sOperaciones;
    private final SCliente sCliente;
    private final SBolsillo sBolsillo;
    private final SMetaAhorro sMetaAhorro;
    private final SBanco sBanco;

    public COperaciones(SOperaciones sOperaciones, SCliente sCliente, SBolsillo sBolsillo,
                        SMetaAhorro sMetaAhorro, SBanco sBanco) {
        this.sOperaciones = sOperaciones;
        this.sCliente = sCliente;
        this.sBolsillo = sBolsillo;
        this.sMetaAhorro = sMetaAhorro;
        this.sBanco = sBanco;
    }

    // ═════════════════ LOGIN ═════════════════

    @PostMapping("/auth/login")
    @Operation(summary = "Iniciar sesión",
               description = "Verifica usuario y contraseña. Después de 3 intentos fallidos la cuenta se bloquea.")
    public ResponseEntity<?> login(@RequestBody LoginDTO datos) {
        try {
            // Una contraseña incorrecta no es un error del servidor: responde ok:false con el mensaje.
            return ResponseEntity.ok(conClientes(sCliente.login(datos.usuario(), datos.contrasena())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    // ═════════════════ OPERACIONES DE DINERO ═════════════════

    @PostMapping("/operaciones/consignar")
    @Operation(summary = "Consignar dinero", description = "Suma un monto al saldo de una cuenta de ahorros o corriente")
    public ResponseEntity<?> consignar(@RequestBody MontoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sOperaciones.consignar(datos.numeroCuenta(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/retirar")
    @Operation(summary = "Retirar dinero", description = "Retira de ahorros (con interés), de corriente (con sobregiro) o avanza efectivo con la tarjeta")
    public ResponseEntity<?> retirar(@RequestBody MontoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sOperaciones.retirar(datos.numeroCuenta(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/transferir")
    @Operation(summary = "Transferir con mensaje",
               description = "Envía dinero a otra cuenta del sistema y guarda el mensaje opcional (máximo 200 caracteres)")
    public ResponseEntity<?> transferir(@RequestBody TransferenciaSolicitudDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sOperaciones.transferir(
                    datos.origen(), datos.destino(), datos.monto(), datos.mensaje())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/comprar")
    @Operation(summary = "Comprar con tarjeta a cuotas",
               description = "Registra una compra con descripción y categoría; calcula cuota mensual y cuota de manejo")
    public ResponseEntity<?> comprar(@RequestBody CompraSolicitudDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sOperaciones.comprar(
                    datos.numeroCuenta(), datos.monto(), datos.cuotas(),
                    datos.comercio(), datos.categoriaID())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/pagar")
    @Operation(summary = "Pagar tarjeta",
               description = "Debita el pago de una cuenta de ahorros o corriente del mismo cliente y reduce la deuda de la tarjeta. Cuerpo: numeroCuenta (TC), cuentaOrigen, monto")
    public ResponseEntity<?> pagar(@RequestBody PagoSolicitudDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sOperaciones.pagarTarjeta(
                    datos.numeroCuenta(), datos.cuentaOrigen(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    // ═════════════════ BOLSILLOS Y METAS ═════════════════

    @PostMapping("/operaciones/bolsillo/depositar")
    @Operation(summary = "Guardar dinero en un bolsillo", description = "Mueve dinero del saldo de la cuenta al bolsillo. Cuerpo: numeroCuenta, bolsilloID, monto. No es una transacción: no genera movimiento")
    public ResponseEntity<?> depositarBolsillo(@RequestBody BolsilloMovimientoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sBolsillo.depositar(
                    datos.numeroCuenta(), datos.bolsilloID(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/bolsillo/retirar")
    @Operation(summary = "Sacar dinero de un bolsillo", description = "Devuelve dinero del bolsillo al saldo de la cuenta. Cuerpo: numeroCuenta, bolsilloID, monto. No es una transacción: no genera movimiento")
    public ResponseEntity<?> retirarBolsillo(@RequestBody BolsilloMovimientoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sBolsillo.retirar(
                    datos.numeroCuenta(), datos.bolsilloID(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/meta/aportar")
    @Operation(summary = "Aportar a una meta de ahorro", description = "El cliente decide cuánto aporta: el dinero sale del saldo de la cuenta de ahorros. Cuerpo: numeroCuenta, metaID, monto. No es una transacción: no genera movimiento")
    public ResponseEntity<?> aportarMeta(@RequestBody MetaMovimientoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sMetaAhorro.aportar(
                    datos.numeroCuenta(), datos.metaID(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/operaciones/meta/retirar")
    @Operation(summary = "Retirar dinero de una meta", description = "Devuelve dinero de la meta al saldo de la cuenta de ahorros. Cuerpo: numeroCuenta, metaID, monto. No es una transacción: no genera movimiento")
    public ResponseEntity<?> retirarMeta(@RequestBody MetaMovimientoDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sMetaAhorro.retirar(
                    datos.numeroCuenta(), datos.metaID(), datos.monto())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    // ═════════════════ ADMINISTRACIÓN DE CLIENTES ═════════════════

    @PostMapping("/clientes")
    @Operation(summary = "Crear cliente o administrador",
               description = "Adiciona un usuario con sus productos (ahorros, corriente, tc). Valida formato y unicidad")
    public ResponseEntity<?> crear(@RequestBody ClienteDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sCliente.crearCliente(datos)));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PutMapping("/clientes/{id}")
    @Operation(summary = "Modificar cliente", description = "Modifica los datos del cliente (excepto su llave primaria)")
    public ResponseEntity<?> editar(@PathVariable int id, @RequestBody ClienteDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sCliente.editarCliente(id, datos)));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PatchMapping("/clientes/{id}/estado")
    @Operation(summary = "Bloquear o desbloquear cliente", description = "Cambia solo el estado de bloqueo del cliente")
    public ResponseEntity<?> estado(@PathVariable int id, @RequestBody EstadoClienteDTO datos) {
        try {
            boolean bloquear = Boolean.TRUE.equals(datos.bloqueado());
            return ResponseEntity.ok(conClientes(sCliente.cambiarEstado(id, bloquear)));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/clientes/{id}/cambiar-contrasena")
    @Operation(summary = "Cambiar contraseña", description = "El servidor verifica la contraseña actual antes de cambiarla")
    public ResponseEntity<?> cambiarContrasena(@PathVariable int id, @RequestBody CambioContrasenaDTO datos) {
        try {
            return ResponseEntity.ok(conClientes(sCliente.cambiarContrasena(id, datos.antigua(), datos.nueva())));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @PostMapping("/clientes/{id}/reset-saldos")
    @Operation(summary = "Reiniciar saldos", description = "Pone en cero los saldos y las deudas del cliente")
    public ResponseEntity<?> resetSaldos(@PathVariable int id) {
        try {
            return ResponseEntity.ok(conClientes(sCliente.resetearSaldos(id)));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    @DeleteMapping("/clientes/{id}")
    @Operation(summary = "Eliminar cliente",
               description = "Elimina un cliente solo si no tiene movimientos ni saldos pendientes en cuentas, bolsillos o metas")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            return ResponseEntity.ok(conClientes(sCliente.eliminarCliente(id)));
        } catch (ErrorNegocio error) {
            return ResponseEntity.badRequest().body(RespuestaOperacion.error(error.getMessage()));
        } catch (Exception error) {
            return ResponseEntity.internalServerError().body(RespuestaOperacion.error("Ocurrió un error interno. Intenta de nuevo más tarde."));
        }
    }

    // Agrega la lista de clientes actualizada a la respuesta
    private RespuestaOperacion conClientes(RespuestaOperacion respuesta) throws Exception {
        respuesta.setClientes(sBanco.leerClientes());
        return respuesta;
    }
}
