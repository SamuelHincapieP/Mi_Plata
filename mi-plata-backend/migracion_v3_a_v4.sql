-- ============================================================================
-- Migración v3 -> v4 (para una base mi_plata que YA tiene datos)
-- Mover dinero a bolsillos y metas ya no es una transacción: se borran sus
-- movimientos viejos y sus tipos del catálogo. Los saldos de las cuentas, de los
-- bolsillos y de las metas NO se tocan (el dinero sigue donde estaba).
-- Cómo usarlo: phpMyAdmin > base mi_plata > pestaña SQL > pegar y ejecutar.
-- ============================================================================
USE mi_plata;

DELETE FROM movimiento
 WHERE tipoID IN (SELECT tipoID FROM tipo_movimiento
                   WHERE nombreTipo IN ('BOLSILLO_DEPOSITO','BOLSILLO_RETIRO','META_APORTE','META_RETIRO'));

DELETE FROM tipo_movimiento
 WHERE nombreTipo IN ('BOLSILLO_DEPOSITO','BOLSILLO_RETIRO','META_APORTE','META_RETIRO');

-- El interés se calcula dentro del plan de compra; no es un movimiento separado.
DELETE FROM tipo_movimiento WHERE nombreTipo = 'INTERES_TC';
ALTER TABLE tarjeta_credito ALTER tasaMensual SET DEFAULT 0.0000;

-- Verificación: debe devolver solo los 7 tipos normales
SELECT tipoID, nombreTipo FROM tipo_movimiento ORDER BY tipoID;
