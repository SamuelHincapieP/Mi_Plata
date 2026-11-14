# Mi Plata — React

Banco académico hecho con **React + Vite + React Router DOM** y un backend
**Spring Boot + JPA** que guarda todo en **MariaDB** (`mi_plata`). La página
consume la API en `http://localhost:8080/api`. La sesión se guarda en
`sessionStorage` y los reportes los genera un servidor Python en `localhost:5000`.

## Cómo ejecutar (en orden)

1. XAMPP: encender MySQL/MariaDB e importar `mi_plata_v2.sql` en phpMyAdmin.
2. Backend: en la carpeta `mi-plata-backend`, `./mvnw spring-boot:run` (puerto 8080).
3. Reportes: en `reportes/`, `python servidor.py` (puerto 5000).
4. Frontend: `npm install` y luego `npm run dev`.

## Funciones del cliente y del administrador

- **Transferencias con mensaje** y un resumen de lo enviado y recibido dentro del historial.
- **Compras con tarjeta**: se escribe qué se compró y se elige una categoría; el historial de la tarjeta las lista.
- **Bolsillos** (como en Nequi): dinero apartado dentro de una cuenta, separado del saldo disponible. Mover plata a un bolsillo o a una meta **no es una transacción** (no crea movimientos ni aparece en el historial).
- **Metas de ahorro**: monto, fecha límite y aportes que decide el cliente.
- **Admin**: al crear un cliente elige sus cuentas (ahorros, corriente y/o tarjeta; 1, 2 o las 3).

Todo se guarda en MariaDB a través del backend; la página no guarda datos por su cuenta.

## Pruebas

Las pruebas siguen el método de **React Testing Library + Jest** (el de la clase de testing en React). Como el
proyecto usa Vite, el *test runner* es **Vitest**, que tiene la misma API que Jest (`describe`, `test`, `expect`,
`beforeEach`, y `vi.fn()` en lugar de `jest.fn()`). Las pruebas viven **junto al componente** (`Boton.jsx` y
`Boton.test.jsx`):

```bash
npm install            # instala Vitest, React Testing Library, Jest DOM y jsdom
npm test               # ejecuta todas las pruebas una vez
npm run test:watch     # las vuelve a ejecutar al guardar un archivo
npm run test:coverage  # muestra qué porcentaje del código está cubierto (carpeta coverage/)
```

Cómo se escriben (igual que en el video):

- `render(<Componente />)` dibuja el componente y `screen` lo inspecciona como lo vería una persona.
- Se busca por **texto, rol o etiqueta** (`getByText`, `getByRole`, `getByLabelText`); no por clase ni por `data-testid`.
  `getBy` lanza error si no encuentra; `queryBy` devuelve `null` (sirve para comprobar que algo NO está);
  `findBy` es asíncrono (espera datos que llegan del backend).
- Los matchers de **Jest DOM** (`toBeInTheDocument`, `toHaveTextContent`, `toHaveClass`, `toBeDisabled`) están
  activados en `src/test/setup.js`.
- `fireEvent.click` / `fireEvent.change` simulan al usuario, y `vi.fn()` crea un **mock** (un espía) para comprobar
  que un manejador se llamó las veces esperadas (`toHaveBeenCalledTimes(1)`).
- `describe` agrupa y `beforeEach` renderiza o prepara los mocks antes de cada test.
- Siempre se comprobó que cada test **falle en rojo** al romper el código antes de dejarlo en verde.

Qué se prueba:

- Componentes: `Boton` (click llama al manejador una vez), `Alerta`, `Vacio`, `Campo` (etiqueta asociada), `Modal`
  (se abre, muestra el contenido, se cierra con el botón y con Escape), `FilaMovimiento`, y las pantallas
  `Bolsillos` y `Metas` completas (lista, guardar, sacar, aportar, errores y el aviso de que **no es una transacción**).
- `core/utils`: filtros de escritura (`validacion`), formato de dinero (`moneda`) y tipos de movimiento
  (`tiposMovimiento`, que verifica que cada tipo de `tipo_movimiento` tenga ícono y nombre, y que bolsillos y
  metas **no** sean un tipo de movimiento).
- `employees/services`: `api.llamar`, `banco.js` (cada operación llama a su endpoint con el cuerpo correcto) y `storage.js`.
- `employees/lib`: reglas de las cuentas (interés del 2 %, sobregiro del 5 %, cuotas y tasas).
- `auth/services` y `payment/utils` (login, intentos fallidos, exportación a CSV).

Los datos de prueba están en `src/test/fixtures/`: son **respuestas del backend** (login, consignar, transferir,
comprar, bolsillos, metas, listas…). Así se comprueba que lo que envía Spring es lo que React espera.

Si `npm install` falla con un error de `edgesOut`, usa `npm install --legacy-peer-deps` (el archivo `.npmrc`
del proyecto ya lo activa).

## Comandos

```bash
npm install
npm run dev      # desarrollo
npm run build    # compilación de producción
npm run preview  # sirve dist/
```

## Credenciales de prueba

| Usuario  | Contraseña | Rol     |
| -------- | ---------- | ------- |
| samuel   | 1234       | cliente |
| maria    | abcd       | cliente |
| admin    | admin123   | admin   |

## Requisitos de la entrega

| Requisito                       | Dónde está                                                     |
| ------------------------------- | -------------------------------------------------------------- |
| Páginas y componentes en React  | `src/modules/*/components/`                               |
| Login                           | `src/modules/auth/components/Login.jsx`                                          |
| Registro                        | `src/modules/auth/components/Registro.jsx`                                       |
| Dashboard                       | `src/modules/employees/components/Dashboard.jsx`                                      |
| Rutas privadas                  | `src/modules/auth/components/ProtectedRoute.jsx` y `src/App.jsx`                |
| Roles (cliente / admin)         | `src/modules/auth/components/AdminRoute.jsx`, `src/modules/employees/components/Admin.jsx`             |

## Rutas

`/` `/login` `/registro` `/dashboard` `/perfil`
`/movimientos` `/movimientos/consignar` `/movimientos/retirar`
`/movimientos/transferir` `/movimientos/historial`
`/movimientos/comprar` `/movimientos/pagar` `/admin`

- Públicas: `/`, `/login`, `/registro`.
- Privadas (requieren sesión, `ProtectedRoute`): todas las demás. Sin sesión
  se redirige a `/login` y, al iniciar, se vuelve a la página que se quería abrir.
- `/admin`: además exige rol admin (`AdminRoute`).

## Estructura (screaming architecture)

`src/modules/` tiene los cuatro módulos de la arquitectura: `core`, `payment`,
`auth` y `employees`. Cada uno lleva las mismas subcarpetas: `components/`,
`hooks/`, `lib/`, `services/`, `states/` y `utils/` (`core` lleva
`design-system/` y no tiene `services/` ni `states/`). Las vacías tienen `.gitkeep`.

```
public/data/     JSON de respaldo (ya no se usa: los datos vienen de la base de datos)
src/
├── assets/
│   └── styles/        tokens.css, base.css
├── modules/
│   ├── core/          Lo compartido
│   │   ├── components/    AppLayout, SideNav, TopBar, Migas, Ticker, FilaMovimiento, Landing
│   │   ├── design-system/ Boton, Campo, Modal, Alerta, Badge, Icono, Logo…
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── utils/         moneda, fechas, validacion
│   ├── payment/       Operaciones: consignar, retirar, transferir, comprar, pagar, historial
│   │   ├── components/    Consignar, Retirar, Transferir, Comprar, Pagar, Historial, CuentaSelector…
│   │   ├── hooks/ · lib/ · services/ · states/
│   │   └── utils/         exportarCsv
│   ├── auth/          Sesión y roles
│   │   ├── components/    Login, Registro, MarcaPanel, ProtectedRoute, AdminRoute
│   │   ├── hooks/         useAuth
│   │   ├── lib/
│   │   ├── services/      auth (verifica en el backend; sesión en sessionStorage)
│   │   ├── states/        AuthContext, AuthProvider
│   │   └── utils/
│   └── employees/     Datos de clientes y cuentas
│       ├── components/    Dashboard, Perfil, Admin, SaldoGigante, FinancialPulse, Productos
│       ├── hooks/         useBank
│       ├── lib/           Cliente, Cuenta, CuentaAhorros, CuentaCorriente, TarjetaCredito, Movimiento
│       ├── services/      banco (reglas de negocio), storage (localStorage)
│       ├── states/        BankContext, BankProvider
│       └── utils/
├── App.jsx
└── main.jsx
```
