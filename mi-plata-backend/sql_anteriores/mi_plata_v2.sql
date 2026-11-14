-- mi_plata v2: datos coherentes con la aplicacion (cuentas AHO-/CTE-/TC-).
-- Importar en phpMyAdmin (borra y recrea las tablas).
CREATE DATABASE IF NOT EXISTS `mi_plata` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mi_plata`;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS movimiento, tarjeta_credito, cuenta_corriente, cuenta_ahorros, cuenta, tipo_movimiento, tipo_cuenta, usuario;
SET FOREIGN_KEY_CHECKS=1;
SET time_zone = "+00:00";

CREATE TABLE tipo_cuenta (tipoCuentaID int(11) NOT NULL AUTO_INCREMENT, nombreTipo varchar(40) NOT NULL, descripcionTipo varchar(200) DEFAULT NULL, PRIMARY KEY (tipoCuentaID)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE tipo_movimiento (tipoID int(11) NOT NULL AUTO_INCREMENT, nombreTipo varchar(60) NOT NULL, descripcionTipo varchar(200) DEFAULT NULL, PRIMARY KEY (tipoID)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- usuario: se agregan identificacion, celular, usuarioLogin y fechaRegistro (datos que ya pide la pagina)
CREATE TABLE usuario (usuarioID int(11) NOT NULL AUTO_INCREMENT, nombre varchar(120) NOT NULL, email varchar(180) NOT NULL, clave varchar(255) NOT NULL,
 intentosFallidos tinyint(4) NOT NULL DEFAULT 0, cuentaBloqueada tinyint(1) NOT NULL DEFAULT 0, rol varchar(20) NOT NULL DEFAULT 'cliente',
 cargo varchar(100) DEFAULT NULL, permisos varchar(255) DEFAULT NULL, tipoDeCliente varchar(60) DEFAULT NULL,
 identificacion varchar(20) DEFAULT NULL, celular varchar(20) DEFAULT NULL, usuarioLogin varchar(40) DEFAULT NULL, fechaRegistro datetime DEFAULT current_timestamp(),
 PRIMARY KEY (usuarioID), UNIQUE KEY email (email), UNIQUE KEY usuarioLogin (usuarioLogin)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE cuenta (cuentaID int(11) NOT NULL AUTO_INCREMENT, numeroCuenta varchar(20) NOT NULL, saldo decimal(18,2) NOT NULL DEFAULT 0.00, estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
 fechaCreacion datetime NOT NULL DEFAULT current_timestamp(), usuarioID int(11) NOT NULL, tipoCuentaID int(11) NOT NULL,
 PRIMARY KEY (cuentaID), UNIQUE KEY numeroCuenta (numeroCuenta),
 CONSTRAINT cuenta_ibfk_1 FOREIGN KEY (usuarioID) REFERENCES usuario (usuarioID) ON DELETE CASCADE,
 CONSTRAINT cuenta_ibfk_2 FOREIGN KEY (tipoCuentaID) REFERENCES tipo_cuenta (tipoCuentaID)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE cuenta_ahorros (cuentaID int(11) NOT NULL, tasaInteres decimal(5,2) NOT NULL DEFAULT 0.02, PRIMARY KEY (cuentaID),
 CONSTRAINT cuenta_ahorros_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE cuenta_corriente (cuentaID int(11) NOT NULL, porcentajeSobregiro decimal(5,2) NOT NULL DEFAULT 0.05, limiteSobregiro decimal(18,2) NOT NULL DEFAULT 1000000.00, PRIMARY KEY (cuentaID),
 CONSTRAINT cuenta_corriente_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE tarjeta_credito (cuentaID int(11) NOT NULL, cupo decimal(18,2) NOT NULL DEFAULT 0.00, deuda decimal(18,2) NOT NULL DEFAULT 0.00, numeroCuotas int(11) NOT NULL DEFAULT 0, tasaMensual decimal(5,4) NOT NULL DEFAULT 0.0250, PRIMARY KEY (cuentaID),
 CONSTRAINT tarjeta_credito_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- movimiento: idExterno es el id que genera la pagina (evita guardar dos veces el mismo movimiento)
CREATE TABLE movimiento (movimientoID int(11) NOT NULL AUTO_INCREMENT, montoMovimiento decimal(18,2) NOT NULL, fechaMovimiento datetime NOT NULL DEFAULT current_timestamp(),
 descripcionMovimiento varchar(300) DEFAULT NULL, saldoPosterior decimal(18,2) NOT NULL, cuentaID int(11) NOT NULL, tipoID int(11) NOT NULL, idExterno bigint(20) NOT NULL DEFAULT 0,
 PRIMARY KEY (movimientoID), KEY cuentaID (cuentaID), KEY tipoID (tipoID),
 CONSTRAINT movimiento_ibfk_1 FOREIGN KEY (cuentaID) REFERENCES cuenta (cuentaID) ON DELETE CASCADE,
 CONSTRAINT movimiento_ibfk_2 FOREIGN KEY (tipoID) REFERENCES tipo_movimiento (tipoID)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tipo_cuenta VALUES (1,'Cuenta Ahorros','Cuenta de ahorros con tasa de interes'),(2,'Cuenta Corriente','Cuenta corriente con posibilidad de sobregiro'),(3,'Tarjeta Credito','Tarjeta de credito con cupo asignado');
INSERT INTO tipo_movimiento VALUES (1,'CONSIGNACION','Deposito de dinero en la cuenta'),(2,'RETIRO','Retiro de dinero de la cuenta'),(3,'TRANSFERENCIA_OUT','Transferencia enviada a otra cuenta'),(4,'TRANSFERENCIA_IN','Transferencia recibida desde otra cuenta'),(5,'COMPRA_TC','Compra realizada con tarjeta de credito'),(6,'PAGO_TC','Pago de deuda de tarjeta de credito'),(7,'CUOTA_MANEJO','Cobro de cuota de manejo');
INSERT INTO usuario (usuarioID,nombre,email,clave,rol,tipoDeCliente,identificacion,celular,usuarioLogin,fechaRegistro) VALUES
(1,'Administrador Mi Plata','admin@miplata.com','admin123','admin',NULL,'4567891234','3001112233','admin','2026-09-01 08:00:00'),
(2,'Samuel Hincapie','samuel@miplata.com','1234','cliente','NATURAL','1001234567','3001234567','samuel','2026-09-10 10:00:00'),
(3,'Maria Garcia','maria@miplata.com','abcd','cliente','NATURAL','1009876543','3109876543','maria','2026-09-12 11:30:00'),
(4,'Juan Castano','juan@miplata.com','1234','cliente','NATURAL','1002223344','3205556677','juan','2026-09-15 09:15:00');
INSERT INTO cuenta (cuentaID,numeroCuenta,saldo,estado,fechaCreacion,usuarioID,tipoCuentaID) VALUES
(1,'AHO-020',2120000,'ACTIVA','2026-09-20 10:00:00',2,1),
(2,'CTE-021',600000,'ACTIVA','2026-09-20 10:00:00',2,2),
(3,'TC-022',2600000,'ACTIVA','2026-09-20 10:00:00',2,3),
(4,'AHO-030',2050000,'ACTIVA','2026-09-20 10:00:00',3,1),
(5,'TC-032',2550000,'ACTIVA','2026-09-20 10:00:00',3,3),
(6,'AHO-040',980000,'ACTIVA','2026-09-20 10:00:00',4,1),
(7,'CTE-041',0,'ACTIVA','2026-09-20 10:00:00',4,2);
INSERT INTO cuenta_ahorros (cuentaID,tasaInteres) VALUES (1,0.02),(4,0.02),(6,0.02);
INSERT INTO cuenta_corriente (cuentaID,porcentajeSobregiro,limiteSobregiro) VALUES (2,0.05,1000000.00),(7,0.05,1000000.00);
INSERT INTO tarjeta_credito (cuentaID,cupo,deuda,numeroCuotas,tasaMensual) VALUES (3,3000000,400000,0,0.0250),(5,3000000,450000,0,0.0250);
INSERT INTO movimiento (montoMovimiento,fechaMovimiento,descripcionMovimiento,saldoPosterior,cuentaID,tipoID,idExterno) VALUES
(2000000,'2026-10-01 09:00:00',NULL,2000000,1,1,1001),
(1500000,'2026-10-01 10:07:00',NULL,1500000,4,1,1002),
(800000,'2026-10-02 11:14:00',NULL,800000,6,1,1003),
(1000000,'2026-10-03 12:21:00',NULL,1000000,2,1,1004),
(200000,'2026-10-05 13:28:00',NULL,1800000,1,2,1005),
(300000,'2026-10-06 14:35:00',NULL,1500000,1,3,1006),
(300000,'2026-10-06 14:35:00',NULL,1800000,4,1,1007),
(600000,'2026-10-08 15:42:00',NULL,2400000,3,5,1008),
(150000,'2026-10-09 16:49:00',NULL,1650000,4,3,1009),
(150000,'2026-10-09 16:49:00',NULL,950000,6,1,1010),
(500000,'2026-10-12 09:56:00',NULL,2000000,1,1,1011),
(200000,'2026-10-14 10:03:00',NULL,2600000,3,6,1012),
(100000,'2026-10-15 11:10:00',NULL,850000,6,2,1013),
(250000,'2026-10-17 12:17:00',NULL,750000,2,3,1014),
(250000,'2026-10-17 12:17:00',NULL,1100000,6,1,1015),
(450000,'2026-10-20 13:24:00',NULL,2550000,5,5,1016),
(400000,'2026-10-22 14:31:00',NULL,2050000,4,1,1017),
(150000,'2026-10-24 15:38:00',NULL,600000,2,2,1018),
(120000,'2026-10-26 16:45:00',NULL,980000,6,3,1019),
(120000,'2026-10-26 16:45:00',NULL,2120000,1,1,1020);
