-- Ejecutar una sola vez sobre una base mi_plata que ya existe.
USE mi_plata;

ALTER TABLE usuario
  DROP COLUMN cargo,
  DROP COLUMN permisos,
  DROP COLUMN tipoDeCliente;
