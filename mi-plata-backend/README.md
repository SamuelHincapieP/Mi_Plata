# Mi Plata · Backend

Backend del banco académico **Mi Plata**, proyecto integrador de Backend II (CESDE).
Expone una API REST en Spring Boot que guarda todas las operaciones en **MariaDB** y
la consume la aplicación web en React.

## 1. Descripción

Mi Plata simula un banco con dos tipos de usuario:

- **Cliente**: consulta sus cuentas, consigna, retira, transfiere (con mensaje), compra
  a cuotas con su tarjeta (diciendo qué compró y en qué categoría), paga la tarjeta,
  aparta dinero en **bolsillos** (como en Nequi), crea **metas de ahorro** y decide cuánto
  aporta a cada una, y revisa su historial y el resumen de sus transferencias.
- **Administrador**: crea clientes eligiendo sus cuentas (ahorros, corriente y/o tarjeta; 1, 2 o las 3),
  los edita, bloquea y elimina, y consulta reportes.

Está dirigido a estudiantes y docentes que quieran ver un ejemplo completo de una
aplicación con arquitectura de cuatro capas, reglas de negocio en el servidor y
transacciones de base de datos.

## 2. Tecnologías

| Componente | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Framework | Spring Boot 4.1.0 (Web MVC, Data JPA) |
| Gestor de dependencias | Maven (incluye `mvnw`) |
| Base de datos | MariaDB 10.11 (XAMPP), compatible con MySQL |
| Mapeo de datos | JPA / Hibernate, MapStruct 1.6.3 |
| Documentación de la API | springdoc-openapi 2.8.13 (Swagger UI) |
| Pruebas | JUnit 5 y Mockito (`spring-boot-starter-data-jpa-test`) |
| Frontend (consumidor) | React 19 + Vite |
| Reportes | Python con Pandas y Matplotlib (servicio en el puerto 5000) |

## 3. Arquitectura

La aplicación usa una arquitectura de cuatro capas. Cada petición sigue este recorrido:

```
Controlador  →  Servicio  →  Repositorio / EntityManager  →  Base de datos
(recibe HTTP)   (reglas)     (acceso a datos)
```

| Capa | Paquete | Prefijo | Qué hace | Ejemplos |
|---|---|---|---|---|
| **Entity (Modelo)** | `Modelo` | `M` | Representa las tablas con sus atributos (`@Entity`, `@Column`, `@Schema`) | `MUsuario`, `MCuenta`, `MTransferencia`, `MCompraTC`, `MMetaAhorro` |
| **Repository** | `Repositorio` | `I` | Acceso a datos: CRUD heredado, *query methods*, consultas nativas y *projections* | `ICuenta`, `ITransferencia`, `ICompraTC` |
| **Service** | `Servicio` | `S` | Reglas de negocio e integridad referencial. Todo método público tiene `try` | `SOperaciones`, `SMetaAhorro`, `STransferencia` |
| **Controller** | `Controlador` | `C` | Endpoints REST, códigos HTTP y documentación Swagger | `COperaciones`, `CUsuario`, `CMetaAhorro` |
| **DTO** | `Dto` | — | Objetos que transportan datos hacia la API (clases o `record`) | `TransferenciaDTO`, `CompraTCDTO` |
| **Mapper** | `Mapper` | `I...Mapper` | Convierte una *Projection* en un DTO con MapStruct | `ITransferenciaMapper`, `ICompraTCMapper` |

### Inyección de dependencias
Todas las clases reciben sus dependencias **por constructor** (Spring las inyecta).

### Transacciones
Las operaciones de dinero en `SOperaciones` están marcadas con
`@Transactional(rollbackFor = Exception.class)`. Si una parte falla, la base de datos
revierte todo. Por ejemplo, si una transferencia no puede abonar al destino, el débito
del origen también se deshace. Las cuentas se leen con `SELECT ... FOR UPDATE` para que
dos operaciones no modifiquen el mismo saldo al mismo tiempo.

### Integridad referencial en la capa de servicio
- No se elimina un cliente que tiene movimientos o dinero pendiente (`SOperaciones.eliminarCliente`).
  Un cliente sin movimientos, con cuentas en cero y sin dinero en bolsillos o metas, se puede eliminar
  y sus cuentas vacias se borran en cascada.
- Una cuenta solo se crea si su tipo existe en `tipo_cuenta`.
- Un movimiento solo se registra si su tipo existe en `tipo_movimiento`.
- Un cliente (no administrador) necesita al menos un producto; solo se aceptan `ahorros`, `corriente` y `tc`.
- Una compra solo se registra si su categoría existe en `categoria_gasto`.
- Una transferencia solo se hace a una cuenta existente y no a una tarjeta de crédito.
- Un bolsillo solo se crea sobre una cuenta existente que no sea tarjeta, y su nombre no se repite en la cuenta.
- Una meta solo se crea sobre una cuenta de ahorros existente y con fecha no anterior a hoy.
- **Un bolsillo o una meta con dinero no se elimina**: primero se retira el dinero a la cuenta.

### Bolsillos y metas: cómo se mueve el dinero
El dinero de un bolsillo o de una meta **sale del saldo de la cuenta** y se guarda aparte; así
`saldo de la cuenta + bolsillos + metas` siempre suma lo mismo. **Esto no es una transacción**: igual que en
un banco real, es solo repartir el dinero propio (no se le envía a otra persona), así que **no crea ninguna fila en
`movimiento`** y no aparece en el historial ni en los reportes. Solo cambian los saldos de la cuenta y del bolsillo
o la meta, dentro de una transacción de base de datos (`SOperaciones.depositarBolsillo`, `retirarBolsillo`,
`aportarMeta`, `retirarMeta`). El catálogo `tipo_movimiento` ya no tiene tipos de bolsillo ni de meta.
En las metas **el cliente decide cuánto aporta**: el progreso cuenta solo lo aportado (`meta_ahorro.montoAhorrado`),
no el saldo total de la cuenta.

### Decisión de arquitectura: ¿hexagonal?
El proyecto usa la **arquitectura de cuatro capas** (Entity, Repository, Service, Controller) que pide la
guía de entrega. La arquitectura hexagonal (puertos y adaptadores) es una forma de organizar el **código**,
no una propiedad de la base de datos, y reemplazaría esas capas por otras (dominio, puertos, adaptadores).
Por eso no se aplicó: habría reemplazado la estructura que se evalúa. La separación de responsabilidades sí
existe: los controladores no tienen reglas de negocio, los servicios no conocen HTTP y la base de datos solo
se toca desde servicios y repositorios.

## 4. Diagrama relacional

```mermaid
erDiagram
    usuario ||--o{ cuenta : "tiene"
    tipo_cuenta ||--o{ cuenta : "clasifica"
    cuenta ||--o| cuenta_ahorros : "es"
    cuenta ||--o| cuenta_corriente : "es"
    cuenta ||--o| tarjeta_credito : "es"
    cuenta ||--o{ movimiento : "registra"
    tipo_movimiento ||--o{ movimiento : "clasifica"
    cuenta ||--o{ transferencia : "envía (origen)"
    cuenta ||--o{ transferencia : "recibe (destino)"
    cuenta ||--o{ compra_tc : "realiza"
    categoria_gasto ||--o{ compra_tc : "clasifica"
    cuenta ||--o{ meta_ahorro : "tiene metas"
    cuenta ||--o{ bolsillo : "tiene bolsillos"

    usuario {
        int usuarioID PK
        varchar nombre
        varchar email UK
        varchar clave
        varchar identificacion
        varchar usuarioLogin UK
        varchar rol
    }
    cuenta {
        int cuentaID PK
        varchar numeroCuenta UK
        decimal saldo
        varchar estado
        int usuarioID FK
        int tipoCuentaID FK
    }
    tipo_cuenta {
        int tipoCuentaID PK
        varchar nombreTipo
    }
    cuenta_ahorros {
        int cuentaID PK_FK
        decimal tasaInteres
    }
    cuenta_corriente {
        int cuentaID PK_FK
        decimal porcentajeSobregiro
    }
    tarjeta_credito {
        int cuentaID PK_FK
        decimal cupo
        decimal deuda
    }
    movimiento {
        int movimientoID PK
        decimal montoMovimiento
        datetime fechaMovimiento
        varchar descripcionMovimiento
        int cuentaID FK
        int tipoID FK
    }
    tipo_movimiento {
        int tipoID PK
        varchar nombreTipo
    }
    transferencia {
        int transferenciaID PK
        int cuentaOrigenID FK
        int cuentaDestinoID FK
        decimal monto
        varchar mensaje
        datetime fechaTransferencia
    }
    compra_tc {
        int compraID PK
        int cuentaID FK
        int categoriaID FK
        varchar comercio
        decimal monto
        int cuotas
        decimal cuotaMensual
        datetime fechaCompra
    }
    categoria_gasto {
        int categoriaID PK
        varchar nombreCategoria UK
    }
    meta_ahorro {
        int metaID PK
        int cuentaID FK
        varchar nombreMeta
        decimal montoObjetivo
        decimal montoAhorrado
        date fechaObjetivo
    }
    bolsillo {
        int bolsilloID PK
        int cuentaID FK
        varchar nombreBolsillo
        decimal saldo
        datetime fechaCreacion
    }
```

Las tablas `cuenta_ahorros`, `cuenta_corriente` y `tarjeta_credito` comparten la llave
`cuentaID` con `cuenta` (relación 1 a 1). Todas las relaciones tienen integridad
referencial en la base de datos.

## 5. Requisitos previos

- **JDK 21** (variable `JAVA_HOME` apuntando al JDK).
- **Maven**: no hace falta instalarlo; el proyecto trae `mvnw` (Windows: `mvnw.cmd`).
- **MariaDB o MySQL**: XAMPP con MariaDB 10.11, o cualquier servidor compatible.
- **Node.js 20 o superior** (solo para el frontend).
- **Python 3** con `pandas` y `matplotlib` (solo para los reportes).

## 6. Base de datos

1. Encender MySQL/MariaDB en XAMPP.
2. En phpMyAdmin: **Importar** el archivo **`mi_plata_v3.sql`**. Es el único script que se necesita.

El script borra y vuelve a crear la base `mi_plata` con sus **13 tablas** y carga solo catálogos y
clientes: los 4 usuarios de prueba tienen sus cuentas **en cero y sin ningún movimiento**
(la tarjeta tiene su cupo completo). Importarlo de nuevo reinicia todos los datos.
Los scripts anteriores quedaron en `sql_anteriores/` solo como historial.

Cambios de la versión 3: se eliminó la columna `movimiento.idExterno` (la identidad de un movimiento
es `movimientoID`), y se agregaron `transferencia`, `categoria_gasto`, `compra_tc`, `bolsillo` y `meta_ahorro`.

`spring.jpa.hibernate.ddl-auto=none`: Hibernate **no crea ni modifica tablas**; el esquema
lo define el script SQL. Si se agrega una tabla o columna, hay que cambiar a la vez: el script SQL,
la entidad (`Modelo`), el servicio y, si la pantalla la usa, el servicio del frontend.

## 7. Configuración interna

Archivo `src/main/resources/application.properties`:

| Propiedad | Valor por defecto | Para qué sirve |
|---|---|---|
| `server.port` | `8080` (valor por defecto de Spring) | Puerto de la API |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/mi_plata` | Conexión a la base |
| `spring.datasource.username` | `root` | Usuario de la base |
| `spring.datasource.password` | *(vacía)* | Clave de la base |
| `spring.jpa.hibernate.ddl-auto` | `none` | No crea tablas automáticamente |
| `python.reportes.url` | `http://localhost:5000/reporte` | Servicio Python de reportes |
| `springdoc.swagger-ui.path` | `/doc/swagger-ui.html` | Ruta de la documentación |

Usuarios de prueba (tabla `usuario`):

| Usuario | Clave | Rol |
|---|---|---|
| `admin` | `admin123` | administrador |
| `samuel` | `1234` | cliente |
| `maria` | `abcd` | cliente |
| `juan` | `1234` | cliente |

> Las contraseñas se guardan en texto plano. Así lo pidió el profesor para este proyecto.
> En un sistema real se usaría BCrypt con Spring Security.

## 8. Instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd mi-plata-backend
   ```
2. **Importar la base de datos** (`mi_plata_v3.sql`) según la sección 6.
3. **Revisar la configuración** de `application.properties` si tu usuario o clave de MariaDB son distintos.
4. **Iniciar el backend**
   ```bash
   ./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
   ```
5. **Iniciar el servicio de reportes** (opcional, para la pantalla de reportes)
   ```bash
   cd ../mi-plata-frontend/reportes
   python servidor.py              # puerto 5000
   ```
6. **Iniciar el frontend**
   ```bash
   cd ../mi-plata-frontend
   npm install
   npm run dev                     # http://localhost:5173
   ```

## 9. Documentación Swagger

Con la aplicación en ejecución, abrir en el navegador:

**http://localhost:8080/doc/swagger-ui/index.html**

Desde ahí se puede ver cada endpoint, leer su descripción y probarlo con **Try it out**.

## 10. Endpoints

Todos los endpoints de operaciones devuelven la lista de clientes actualizada en el campo
`clientes`. Los errores de regla responden **400** con `{ "ok": false, "error": "..." }`.
Los errores inesperados responden **500**.

| Verbo | Ruta | Descripción | Controlador |
|---|---|---|---|
| GET | `/api/banco/clientes` | Lista todos los clientes con sus cuentas y movimientos | `CBanco` |
| POST | `/api/auth/login` | Verifica usuario y clave; tres intentos fallidos bloquean la cuenta | `COperaciones` |
| POST | `/api/operaciones/consignar` | Suma dinero a una cuenta | `COperaciones` |
| POST | `/api/operaciones/retirar` | Retira de ahorros, corriente o tarjeta | `COperaciones` |
| POST | `/api/operaciones/transferir` | Transfiere a otra cuenta con mensaje opcional | `COperaciones` |
| POST | `/api/operaciones/comprar` | Compra a cuotas con descripción y categoría | `COperaciones` |
| POST | `/api/operaciones/pagar` | Paga la deuda de la tarjeta desde una cuenta de ahorros o corriente del mismo cliente | `COperaciones` |
| POST | `/api/clientes` | Crea un cliente o administrador con sus productos | `COperaciones` |
| PUT | `/api/clientes/{id}` | Modifica los datos de un cliente | `COperaciones` |
| PATCH | `/api/clientes/{id}/estado` | Bloquea o desbloquea un cliente | `COperaciones` |
| POST | `/api/clientes/{id}/cambiar-contrasena` | Cambia la clave verificando la actual | `COperaciones` |
| POST | `/api/clientes/{id}/reset-saldos` | Pone saldos y deudas en cero | `COperaciones` |
| DELETE | `/api/clientes/{id}` | Elimina un cliente sin movimientos ni saldos pendientes | `COperaciones` |
| GET | `/api/usuarios/{usuarioID}/movimientos` | Movimientos de todas las cuentas de un usuario (Projection + Mapper) | `CUsuario` |
| GET | `/api/transferencias/usuario/{usuarioID}` | Transferencias enviadas y recibidas, con nombres y mensaje | `CTransferencia` |
| GET | `/api/compras/{numeroCuenta}` | Compras hechas con una tarjeta | `CCompraTC` |
| GET | `/api/categorias` | Catálogo de categorías de gasto | `CCategoria` |
| POST | `/api/metas` | Crea una meta de ahorro sobre una cuenta de ahorros | `CMetaAhorro` |
| GET | `/api/metas/cuenta/{numeroCuenta}` | Metas de una cuenta | `CMetaAhorro` |
| DELETE | `/api/metas/{metaID}` | Elimina una meta (solo si no tiene dinero ahorrado) | `CMetaAhorro` |
| POST | `/api/operaciones/meta/aportar` | El cliente decide cuánto aporta: sale del saldo de ahorros | `COperaciones` |
| POST | `/api/operaciones/meta/retirar` | Devuelve dinero de la meta a la cuenta | `COperaciones` |
| POST | `/api/bolsillos` | Crea un bolsillo en una cuenta (no tarjeta) | `CBolsillo` |
| GET | `/api/bolsillos/cuenta/{numeroCuenta}` | Bolsillos de una cuenta con su saldo | `CBolsillo` |
| DELETE | `/api/bolsillos/{bolsilloID}` | Elimina un bolsillo (solo si está vacío) | `CBolsillo` |
| POST | `/api/operaciones/bolsillo/depositar` | Cuenta → bolsillo | `COperaciones` |
| POST | `/api/operaciones/bolsillo/retirar` | Bolsillo → cuenta | `COperaciones` |
| GET | `/api/reportes/admin` | Reporte general para el administrador | `CReporte` |
| GET | `/api/reportes/usuario?usuario=` | Reporte de un cliente | `CReporte` |

### Ejemplo: consignar

Petición:
```http
POST /api/operaciones/consignar
Content-Type: application/json

{ "numeroCuenta": "AHO-020", "monto": 50000 }
```

Respuesta `200`:
```json
{ "ok": true, "monto": 50000.0, "clientes": [ ... ] }
```

Respuesta `400` (saldo insuficiente, por ejemplo):
```json
{ "ok": false, "error": "Saldo insuficiente. La cuenta de ahorros no permite sobregiro." }
```

### Ejemplo: pagar tarjeta

El pago sale de una cuenta de ahorros o corriente del mismo cliente:

```http
POST /api/operaciones/pagar
Content-Type: application/json

{ "numeroCuenta": "TC-022", "cuentaOrigen": "AHO-020", "monto": 150000 }
```

Respuesta `200`:

```json
{ "ok": true, "monto": 150000.0, "deuda": 0.0, "origen": "AHO-020", "clientes": [ ... ] }
```

## 11. Pruebas unitarias

Las pruebas están en `src/test/java`. Para ejecutarlas:

```bash
./mvnw test                     # Windows: mvnw.cmd test
```

`SMetaAhorroTest` y `SBolsilloTest` prueban las reglas de `SMetaAhorro` y `SBolsillo` sin base de datos. Los
repositorios se simulan con **Mockito** y se comprueba que:

- una fecha objetivo anterior a hoy se rechaza, y la de hoy y las futuras se aceptan;
- un monto cero o negativo se rechaza;
- una cuenta inexistente se rechaza y no se guarda nada;
- una meta solo se crea sobre cuentas de ahorros y un bolsillo no se crea sobre una tarjeta;
- los nombres vacíos o de más de 40 caracteres se rechazan;
- una meta o un bolsillo **con dinero** no se elimina.

## 12. Validaciones

Las validaciones se hacen en **dos lugares**: el frontend (para dar una respuesta inmediata) y
el backend (para que nadie pueda saltárselas). Los límites de longitud coinciden con las
columnas de la base:

| Dato | Límite | Columna |
|---|---|---|
| Usuario | 3 a 20 caracteres, minúsculas, sin espacios | `usuario.usuarioLogin` |
| Documento | 6 a 10 dígitos | `usuario.identificacion` |
| Celular | exactamente 10 dígitos | `usuario.celular` |
| Mensaje de transferencia | hasta 200 caracteres | `transferencia.mensaje` |
| Descripción de compra | hasta 120 caracteres, obligatoria | `compra_tc.comercio` |
| Nombre de meta | hasta 60 caracteres, obligatorio | `meta_ahorro.nombreMeta` |
| Nombre de bolsillo | hasta 40 caracteres, obligatorio, único por cuenta | `bolsillo.nombreBolsillo` |
| Productos de un cliente | al menos 1 de: ahorros, corriente, tc | (regla de `crearCliente`) |
| Fecha objetivo de meta | obligatoria, no anterior a hoy | `meta_ahorro.fechaObjetivo` |

## 13. Licencia y derechos de autor

Proyecto académico desarrollado para el proyecto integrador de Backend II del CESDE.
Uso educativo. Los nombres de empresas o productos que aparecen son ficticios.
Las librerías de terceros (Spring, MapStruct, springdoc, Matplotlib, etc.) conservan
sus propias licencias.

## 14. Autores

Equipo de Backend II, CESDE. Profesor: Freddy Moscoso Ceballos.
