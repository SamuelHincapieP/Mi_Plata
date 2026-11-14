# Mi Plata — Banca digital

Mi Plata es una aplicación bancaria académica para administrar clientes, cuentas y operaciones financieras desde una interfaz web. El sistema permite trabajar con cuentas de ahorros, cuentas corrientes, tarjetas de crédito, bolsillos, metas de ahorro, transferencias y movimientos.

El proyecto fue construido siguiendo una arquitectura por capas, similar a la lógica del proyecto de concesionario: cada capa tiene una responsabilidad clara y las reglas de negocio se mantienen en el backend.

> **Propósito:** proyecto educativo para practicar desarrollo full-stack, APIs REST, persistencia, pruebas y separación de responsabilidades. No está pensado para manejar dinero real ni para producción sin aplicar medidas adicionales de seguridad.

## Funcionalidades principales

- Inicio de sesión y control básico de intentos fallidos.
- Administración de clientes desde el perfil administrador.
- Creación de productos financieros: ahorro, corriente y tarjeta de crédito.
- Consulta de cuentas, saldos, movimientos y productos asociados.
- Consignaciones y retiros.
- Transferencias entre cuentas, con movimiento de salida y movimiento de entrada.
- Compras con tarjeta de crédito a una o varias cuotas.
- Cálculo de cuota mensual, tasa e intereses de la compra de tarjeta.
- Pago de tarjeta desde una cuenta de origen.
- Cuota de manejo de tarjeta.
- Creación de bolsillos y traslado de dinero entre cuenta y bolsillo.
- Creación de metas de ahorro, aportes y retiros.
- Categorías de gastos y consulta de compras.
- Reportes para administrador y usuario mediante un pequeño servicio Python.
- Exportación de movimientos a CSV desde el frontend.
- Pruebas automatizadas con Vitest y React Testing Library.

## Tecnologías utilizadas

### Frontend

- **JavaScript moderno (ES Modules):** lenguaje principal de la interfaz.
- **React 19:** construcción de componentes y pantallas.
- **React Router:** navegación entre login, dashboard, operaciones, administración y reportes.
- **Vite:** servidor de desarrollo y herramienta de compilación.
- **CSS:** estilos y diseño de la interfaz.
- **Vitest:** ejecución de pruebas unitarias y de componentes.
- **React Testing Library:** renderiza componentes y simula acciones reales del usuario.
- **jest-dom:** matchers como `toBeInTheDocument()` y `toBeDisabled()`.
- **jsdom:** navegador simulado utilizado durante las pruebas.
- **Oxlint:** revisión estática del código JavaScript.

### Backend

- **Java 21:** lenguaje del backend.
- **Spring Boot 4.1.0:** plataforma para arrancar y configurar la aplicación.
- **Spring Web MVC:** controladores REST y rutas HTTP.
- **Spring Data JPA:** repositorios y persistencia orientada a objetos.
- **Hibernate:** implementación de JPA que traduce objetos Java a consultas SQL.
- **MySQL/MariaDB:** base de datos utilizada por la aplicación.
- **MapStruct:** generación de código para convertir entidades/proyecciones a DTOs.
- **Springdoc OpenAPI:** documentación y pruebas de endpoints mediante Swagger.
- **Maven:** administración de dependencias y compilación.

### Reportes

- **Python:** servicio independiente para generar reportes.
- **Flask** (según `reportes/requirements.txt`): servidor HTTP del módulo de reportes.
- **Pandas:** preparación de datos para los reportes.

## Arquitectura general

El proyecto utiliza una arquitectura **cliente-servidor** y una arquitectura interna **por capas**.

```text
┌────────────────────────────┐
│ Frontend React + Vite      │
│ componentes, formularios  │
│ rutas y servicios HTTP     │
└──────────────┬─────────────┘
               │ JSON / HTTP
               ▼
┌────────────────────────────┐
│ Controladores Spring       │  C...
│ reciben las peticiones     │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ Servicios de negocio       │  S...
│ validan y ejecutan reglas  │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ Repositorios Spring Data   │  I...
│ consultan y guardan        │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ Entidades JPA              │  M...
│ representan tablas         │
└──────────────┬─────────────┘
               ▼
          MySQL / MariaDB
```

El frontend puede validar datos para dar una respuesta rápida al usuario, pero la validación definitiva siempre está en el backend. De esta forma nadie puede saltarse las reglas enviando una petición directamente a la API.

## Arquitectura del backend

### Controladores (`Controlador`)

Publican las rutas REST y convierten la petición HTTP en DTOs. No deben calcular saldos ni escribir consultas SQL.

- `COperaciones`: login, consignar, retirar, transferir, comprar, pagar tarjeta, bolsillos, metas y administración de clientes.
- `CBanco`: clientes y productos para el administrador.
- `CBolsillo`: crear, listar y eliminar bolsillos.
- `CCategoria`: categorías de gasto.
- `CCompraTC`: compras de tarjeta.
- `CMetaAhorro`: metas de ahorro.
- `CReporte`: reportes.
- `CTransferencia`: transferencias por usuario.
- `CUsuario`: movimientos por usuario.

### Servicios (`Servicio`)

Contienen la lógica del banco. Aquí se validan montos, saldos, estados, límites, cuotas y relaciones entre operaciones.

- `SOperaciones`: operaciones monetarias principales y transacciones.
- `SCliente` y `SUsuario`: clientes, usuarios, login, bloqueo y contraseñas.
- `SBanco`: armado del resumen administrativo.
- `SCuenta`, `SCuentaAhorros`, `SCuentaCorriente` y `STarjetaCredito`: productos financieros.
- `SMovimiento`: historial de movimientos.
- `STransferencia` y `SCompraTC`: consultas de transferencias y compras.
- `SBolsillo` y `SMetaAhorro`: productos de ahorro internos.
- `SCategoria`, `STipoCuenta` y `STipoMovimiento`: catálogos.
- `SReporte`: comunicación con el servidor Python.
- `Dinero`: validaciones y formato de valores monetarios.
- `ErrorNegocio`: error propio para reglas de negocio.

### Entidades (`Modelo`)

Las clases `M...` representan tablas de la base de datos mediante JPA: `MUsuario`, `MCuenta`, `MCuentaAhorros`, `MCuentaCorriente`, `MTarjetaCredito`, `MMovimiento`, `MTransferencia`, `MCompraTC`, `MBolsillo`, `MMetaAhorro`, `MTipoCuenta`, `MTipoMovimiento` y `MCategoriaGasto`.

Las relaciones principales son:

```text
Usuario 1 ─── N Cuenta
Cuenta  1 ─── N Movimiento
Cuenta  1 ─── 0..1 CuentaAhorros
Cuenta  1 ─── 0..1 CuentaCorriente
Cuenta  1 ─── 0..1 TarjetaCredito
Cuenta  1 ─── N Bolsillo / MetaAhorro / CompraTC
```

### Repositorios (`Repositorio`)

Son interfaces que extienden `JpaRepository`. Spring Data crea automáticamente su implementación. Allí están las consultas para buscar por número de cuenta, usuario, tipo, estado, fechas y relaciones.

Las proyecciones (`ICompraTCProjection`, `ITransferenciaProjection` e `IMovimientosUsuarioProjection`) devuelven solamente los campos necesarios para un reporte o DTO.

### DTO y Mapper

Los DTO (`Dto`) son objetos de entrada y salida de la API. Evitan exponer directamente entidades con relaciones internas o campos que el frontend no necesita. Los mappers (`Mapper`) convierten proyecciones y entidades a DTOs; MapStruct genera su implementación.

## Reglas financieras importantes

- Una cuenta de ahorros no puede retirar más que su saldo.
- Una cuenta corriente puede utilizar su `limiteSobregiro` dentro del límite permitido.
- Una tarjeta de crédito no recibe consignaciones como una cuenta bancaria.
- Una compra a cuotas calcula cuota, tasa, intereses y deuda inicial dentro de la lógica de la compra.
- El interés de la tarjeta no se guarda como un movimiento separado `INTERES_TC`.
- Una transferencia modifica origen y destino dentro de una sola transacción.
- Bolsillos y metas mueven dinero existente; no crean dinero nuevo.
- Si una operación falla a mitad de camino, `@Transactional` revierte los cambios.

## Estructura de carpetas

```text
mi-plata-frontend/
├─ public/
├─ src/
│  ├─ modules/             # módulos por funcionalidad
│  ├─ test/                # setup y fixtures JSON
│  └─ ...
├─ reportes/               # servidor Python de reportes
├─ package.json
├─ vite.config.js
└─ vitest.config.js

mi-plata-backend/
├─ src/main/java/com/Cesde/miplata/
│  ├─ Controlador/
│  ├─ Dto/
│  ├─ Mapper/
│  ├─ Modelo/
│  ├─ Repositorio/
│  └─ Servicio/
├─ src/main/resources/application.properties
├─ mi_plata.sql
├─ mi_plata_v4.sql
├─ migracion_eliminar_campos_usuario.sql
└─ pom.xml
```

## Requisitos

- Node.js y npm.
- Java 21.
- Maven o Maven Wrapper (`mvnw.cmd`).
- XAMPP, MySQL o MariaDB.
- Python 3 para los reportes.

## Instalación y ejecución

### 1. Base de datos

1. Inicia MySQL desde XAMPP.
2. Abre phpMyAdmin.
3. Crea o selecciona la base `mi_plata`.
4. Importa `mi_plata.sql` o `mi_plata_v4.sql`.
5. Si la base ya existía y necesita la migración, ejecuta una sola vez `migracion_eliminar_campos_usuario.sql`.

### 2. Backend

Desde la carpeta que contiene `pom.xml`:

```powershell
.\mvnw.cmd spring-boot:run
```

El backend queda disponible normalmente en `http://localhost:8080`.

Swagger queda disponible en:

```text
http://localhost:8080/doc/swagger-ui.html
```

### 3. Frontend

Desde la carpeta que contiene `package.json`:

```powershell
npm.cmd install
npm.cmd run dev
```

El frontend queda disponible normalmente en `http://localhost:5173`.

En PowerShell se usa `npm.cmd` porque algunas instalaciones bloquean el script `npm.ps1` por la política de ejecución de Windows.

### 4. Reportes

Desde la carpeta `reportes`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python servidor.py
```

El servidor de reportes escucha normalmente en `http://localhost:5000`.

## Pruebas del frontend

Los archivos terminados en `.test.js` y `.test.jsx` están dentro de `src`, junto al código que prueban. Se utiliza Vitest con React Testing Library.

```powershell
# Ejecutar todas las pruebas
npm.cmd test

# Ejecutarlas en modo observación mientras se programa
npm.cmd run test:watch

# Generar cobertura
npm.cmd run test:coverage

# Compilar el frontend
npm.cmd run build

# Revisar estilo y errores estáticos
npm.cmd run lint
```

Las pruebas siguen el patrón **Arrange, Act, Assert**:

1. **Arrange:** preparar datos, mocks y componente.
2. **Act:** hacer clic, escribir o llamar una función.
3. **Assert:** comprobar el resultado con `expect`.

Estado verificado durante el desarrollo: **20 archivos de prueba y 140 pruebas aprobadas**.

## Ejemplo de flujo de una consignación

```text
React construye el JSON
  ↓
POST /api/operaciones/consignar
  ↓
COperaciones recibe MontoDTO
  ↓
SOperaciones valida monto y cuenta
  ↓
ICuenta busca la cuenta en MySQL
  ↓
Se actualiza MCuenta y se crea MMovimiento
  ↓
La transacción confirma los cambios
  ↓
RespuestaOperacion vuelve a React
```

## Seguridad y alcance

Este es un proyecto académico. Antes de usarlo en producción habría que añadir contraseñas con hash, autenticación mediante tokens, autorización por usuario, CORS limitado, variables de entorno para secretos, validación más estricta, HTTPS, auditoría y protección contra ataques.

## Autor y propósito académico

Mi Plata fue desarrollado como aplicación de aprendizaje para demostrar frontend React, backend Spring Boot, persistencia relacional, arquitectura por capas, reglas de negocio, pruebas automatizadas e integración con un servicio Python.
