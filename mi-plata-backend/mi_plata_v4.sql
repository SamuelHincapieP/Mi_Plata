-- ============================================================================
-- Mi Plata · Base de datos v4 (script COMPLETO)
-- Reemplaza a mi_plata_v3.sql (que queda en sql_anteriores).
-- Cambio v4: mover dinero entre la cuenta y los bolsillos/metas YA NO es una
-- transacción, así que desaparecen los tipos BOLSILLO_* y META_* del catálogo
-- tipo_movimiento (esas operaciones no dejan ninguna fila en movimiento).
--
-- Qué hace:
--   1) Borra y vuelve a crear la base mi_plata (se pierden los datos anteriores).
--   2) Crea las 13 tablas, sin la columna idExterno en movimiento.
--   3) Carga SOLO catálogos y clientes con sus cuentas en cero:
--      no hay ningún movimiento, transferencia, compra, bolsillo ni meta.
--
-- Cómo usarlo: phpMyAdmin > Importar > elegir este archivo (no hace falta
-- seleccionar la base antes: el script la crea).
-- ============================================================================

CREATE DATABASE IF NOT EXISTS mi_plata CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mi_plata;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bolsillo;
DROP TABLE IF EXISTS meta_ahorro;
DROP TABLE IF EXISTS compra_tc;
DROP TABLE IF EXISTS transferencia;
DROP TABLE IF EXISTS movimiento;
DROP TABLE IF EXISTS tarjeta_credito;
DROP TABLE IF EXISTS cuenta_corriente;
DROP TABLE IF EXISTS cuenta_ahorros;
DROP TABLE IF EXISTS cuenta;
DROP TABLE IF EXISTS categoria_gasto;
DROP TABLE IF EXISTS tipo_movimiento;
DROP TABLE IF EXISTS tipo_cuenta;
DROP TABLE IF EXISTS usuario;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------
CREATE TABLE tipo_cuenta (
  tipoCuentaID INT(11) NOT NULL AUTO_INCREMENT,
  nombreTipo VARCHAR(40) NOT NULL,
  descripcionTipo VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (tipoCuentaID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_movimiento (
  tipoID INT(11) NOT NULL AUTO_INCREMENT,
  nombreTipo VARCHAR(60) NOT NULL,
  descripcionTipo VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (tipoID),
  UNIQUE KEY nombreTipo (nombreTipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE categoria_gasto (
  categoriaID INT(11) NOT NULL AUTO_INCREMENT,
  nombreCategoria VARCHAR(40) NOT NULL,
  PRIMARY KEY (categoriaID),
  UNIQUE KEY nombreCategoria (nombreCategoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- Usuarios y cuentas
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
  usuarioID INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  intentosFallidos TINYINT(4) NOT NULL DEFAULT 0,
  cuentaBloqueada TINYINT(1) NOT NULL DEFAULT 0,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
  identificacion VARCHAR(20) DEFAULT NULL,
  celular VARCHAR(20) DEFAULT NULL,
  usuarioLogin VARCHAR(40) DEFAULT NULL,
  fechaRegistro DATETIME DEFAULT current_timestamp(),
  PRIMARY KEY (usuarioID),
  UNIQUE KEY email (email),
  UNIQUE KEY usuarioLogin (usuarioLogin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cuenta (
  cuentaID INT(11) NOT NULL AUTO_INCREMENT,
  numeroCuenta VARCHAR(20) NOT NULL,
  saldo DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  fechaCreacion DATETIME NOT NULL DEFAULT current_timestamp(),
  usuarioID INT(11) NOT NULL,
  tipoCuentaID INT(11) NOT NULL,
  PRIMARY KEY (cuentaID),
  UNIQUE KEY numeroCuenta (numeroCuenta),
  KEY cuenta_usuario (usuarioID),
  KEY cuenta_tipo (tipoCuentaID),
  CONSTRAINT cuenta_ibfk_1 FOREIGN KEY (usuarioID) REFERENCES usuario (usuarioID) ON DELETE CASCADE,
  CONSTRAINT cuenta_ibfk_2 FOREIGN KEY (tipoCuentaID) REFERENCES tipo_cuenta (tipoCuentaID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cuenta_ahorros (
  cuentaID INT(11) NOT NULL,
  tasaInteres DECIMAL(5,2) NOT NULL DEFAULT 0.02,
  PRIMARY KEY (cuentaID),
  CONSTRAINT cuenta_ahorros_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cuenta_corriente (
  cuentaID INT(11) NOT NULL,
  porcentajeSobregiro DECIMAL(5,2) NOT NULL DEFAULT 0.05,
  limiteSobregiro DECIMAL(18,2) NOT NULL DEFAULT 1000000.00,
  PRIMARY KEY (cuentaID),
  CONSTRAINT cuenta_corriente_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tarjeta_credito (
  cuentaID INT(11) NOT NULL,
  cupo DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  deuda DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  numeroCuotas INT(11) NOT NULL DEFAULT 0,
  tasaMensual DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (cuentaID),
  CONSTRAINT tarjeta_credito_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- Movimientos y operaciones
-- (movimiento ya NO tiene idExterno: la identidad es movimientoID)
-- ---------------------------------------------------------------------------
CREATE TABLE movimiento (
  movimientoID INT(11) NOT NULL AUTO_INCREMENT,
  montoMovimiento DECIMAL(18,2) NOT NULL,
  fechaMovimiento DATETIME NOT NULL DEFAULT current_timestamp(),
  descripcionMovimiento VARCHAR(300) DEFAULT NULL,
  saldoPosterior DECIMAL(18,2) NOT NULL,
  cuentaID INT(11) NOT NULL,
  tipoID INT(11) NOT NULL,
  PRIMARY KEY (movimientoID),
  KEY movimiento_cuenta (cuentaID),
  KEY movimiento_tipo (tipoID),
  CONSTRAINT movimiento_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE,
  CONSTRAINT movimiento_ibfk_2 FOREIGN KEY (tipoID) REFERENCES tipo_movimiento (tipoID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE transferencia (
  transferenciaID INT(11) NOT NULL AUTO_INCREMENT,
  cuentaOrigenID INT(11) NOT NULL,
  cuentaDestinoID INT(11) NOT NULL,
  monto DECIMAL(18,2) NOT NULL,
  mensaje VARCHAR(200) DEFAULT NULL,
  fechaTransferencia DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (transferenciaID),
  KEY transferencia_origen (cuentaOrigenID),
  KEY transferencia_destino (cuentaDestinoID),
  CONSTRAINT transferencia_origen_fk FOREIGN KEY (cuentaOrigenID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE,
  CONSTRAINT transferencia_destino_fk FOREIGN KEY (cuentaDestinoID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE compra_tc (
  compraID INT(11) NOT NULL AUTO_INCREMENT,
  cuentaID INT(11) NOT NULL,
  categoriaID INT(11) NOT NULL,
  comercio VARCHAR(120) NOT NULL,
  monto DECIMAL(18,2) NOT NULL,
  cuotas INT(11) NOT NULL DEFAULT 1,
  cuotaMensual DECIMAL(18,2) NOT NULL,
  fechaCompra DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (compraID),
  KEY compra_cuenta (cuentaID),
  KEY compra_categoria (categoriaID),
  CONSTRAINT compra_cuenta_fk FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE,
  CONSTRAINT compra_categoria_fk FOREIGN KEY (categoriaID) REFERENCES categoria_gasto (categoriaID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- Bolsillos (como en Nequi): apartados de dinero dentro de una cuenta.
-- El dinero del bolsillo sale del saldo de la cuenta y se guarda aparte.
-- ---------------------------------------------------------------------------
CREATE TABLE bolsillo (
  bolsilloID INT(11) NOT NULL AUTO_INCREMENT,
  cuentaID INT(11) NOT NULL,
  nombreBolsillo VARCHAR(40) NOT NULL,
  saldo DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  fechaCreacion DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (bolsilloID),
  UNIQUE KEY bolsillo_nombre_cuenta (cuentaID, nombreBolsillo),
  CONSTRAINT bolsillo_cuenta_fk FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- Metas de ahorro: monto objetivo + fecha límite. montoAhorrado es lo que el
-- cliente decide aportar (sale del saldo de la cuenta de ahorros).
-- ---------------------------------------------------------------------------
CREATE TABLE meta_ahorro (
  metaID INT(11) NOT NULL AUTO_INCREMENT,
  cuentaID INT(11) NOT NULL,
  nombreMeta VARCHAR(60) NOT NULL,
  montoObjetivo DECIMAL(18,2) NOT NULL,
  montoAhorrado DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  fechaObjetivo DATE NOT NULL,
  fechaCreacion DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (metaID),
  KEY meta_cuenta (cuentaID),
  CONSTRAINT meta_cuenta_fk FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===========================================================================
-- DATOS INICIALES (catálogos + clientes sin movimientos)
-- ===========================================================================
INSERT INTO tipo_cuenta (tipoCuentaID, nombreTipo, descripcionTipo) VALUES
(1, 'Cuenta Ahorros', 'Cuenta de ahorros con tasa de interes'),
(2, 'Cuenta Corriente', 'Cuenta corriente con posibilidad de sobregiro'),
(3, 'Tarjeta Credito', 'Tarjeta de credito con cupo asignado');

INSERT INTO tipo_movimiento (tipoID, nombreTipo, descripcionTipo) VALUES
(1, 'CONSIGNACION', 'Deposito de dinero en la cuenta'),
(2, 'RETIRO', 'Retiro de dinero de la cuenta'),
(3, 'TRANSFERENCIA_OUT', 'Transferencia enviada a otra cuenta'),
(4, 'TRANSFERENCIA_IN', 'Transferencia recibida desde otra cuenta'),
(5, 'COMPRA_TC', 'Compra realizada con tarjeta de credito'),
(6, 'PAGO_TC', 'Pago de deuda de tarjeta de credito'),
(7, 'CUOTA_MANEJO', 'Cobro de cuota de manejo');

INSERT INTO categoria_gasto (nombreCategoria) VALUES
('Mercado'), ('Transporte'), ('Restaurantes'), ('Salud'),
('Ocio'), ('Ropa'), ('Servicios'), ('Otros');

INSERT INTO usuario (usuarioID, nombre, email, clave, intentosFallidos, cuentaBloqueada, rol, identificacion, celular, usuarioLogin, fechaRegistro) VALUES
(1, 'Administrador Mi Plata', 'admin@miplata.com', 'admin123', 0, 0, 'admin', '4567891234', '3001112233', 'admin', '2026-09-01 08:00:00'),
(2, 'Samuel Hincapie', 'samuel@miplata.com', '1234', 0, 0, 'cliente', '1001234567', '3001234567', 'samuel', '2026-09-10 10:00:00'),
(3, 'Maria Garcia', 'maria@miplata.com', 'abcd', 0, 0, 'cliente', '1009876543', '3109876543', 'maria', '2026-09-12 11:30:00'),
(4, 'Juan Castano', 'juan@miplata.com', '1234', 0, 0, 'cliente', '1002223344', '3205556677', 'juan', '2026-09-15 09:15:00');

-- Cuentas en cero (en la tarjeta, el saldo guardado es el cupo disponible: cupo - deuda)
INSERT INTO cuenta (cuentaID, numeroCuenta, saldo, estado, fechaCreacion, usuarioID, tipoCuentaID) VALUES
(1, 'AHO-020', 0.00, 'ACTIVA', '2026-09-20 10:00:00', 2, 1),
(2, 'CTE-021', 0.00, 'ACTIVA', '2026-09-20 10:00:00', 2, 2),
(3, 'TC-022', 3000000.00, 'ACTIVA', '2026-09-20 10:00:00', 2, 3),
(4, 'AHO-030', 0.00, 'ACTIVA', '2026-09-20 10:00:00', 3, 1),
(5, 'TC-032', 3000000.00, 'ACTIVA', '2026-09-20 10:00:00', 3, 3),
(6, 'AHO-040', 0.00, 'ACTIVA', '2026-09-20 10:00:00', 4, 1),
(7, 'CTE-041', 0.00, 'ACTIVA', '2026-09-20 10:00:00', 4, 2);

INSERT INTO cuenta_ahorros (cuentaID, tasaInteres) VALUES (1, 0.02), (4, 0.02), (6, 0.02);

INSERT INTO cuenta_corriente (cuentaID, porcentajeSobregiro, limiteSobregiro) VALUES
(2, 0.05, 1000000.00), (7, 0.05, 1000000.00);

INSERT INTO tarjeta_credito (cuentaID, cupo, deuda, numeroCuotas, tasaMensual) VALUES
(3, 3000000.00, 0.00, 0, 0.0000), (5, 3000000.00, 0.00, 0, 0.0000);
