# API Movies M2L6

Proyecto final de la clase M2L6: validacion, manejo de errores y unit testing en una API Express.

Esta API administra peliculas favoritas usando Node.js, Express y PostgreSQL. La base viene del proyecto M2L5, donde ya existia un CRUD conectado a una base de datos. En M2L6 el foco no esta en agregar mas endpoints, sino en hacer que el backend sea mas robusto, predecible y testeable.

## De que trata esta clase

En esta lecture se trabaja sobre tres ideas centrales:

- Validar los datos que llegan desde el cliente antes de usarlos.
- Centralizar los errores para no repetir respuestas `400`, `404` o `500` en todas las rutas.
- Agregar tests automaticos para probar validadores, errores y endpoints.

El flujo esperado queda asi:

```text
Request HTTP -> Express -> Validacion -> Ruta -> PostgreSQL -> Response JSON
                         -> Error controlado -> Error handler -> Response JSON
```

## Que se construyo

Este proyecto incluye:

- Separacion entre `app.js` y `server.js`.
- Validadores reutilizables para peliculas.
- Validacion de parametros de ruta.
- Error factory con `createError`.
- Middleware `notFoundHandler`.
- Middleware `errorHandler`.
- Rutas que propagan errores con `next(error)`.
- Tests con Vitest.
- Tests de endpoints con Supertest sin levantar el servidor real.
- Tests de endpoints usando un pool falso, sin depender de PostgreSQL.

## Stack

- Node.js
- Express
- PostgreSQL
- pg
- Vitest
- Supertest

## Orden recomendado para explicar la carpeta

1. `server.js`: punto de entrada real de la aplicacion.
2. `app.js`: crea la app Express y permite testearla.
3. `routes/movies.js`: contiene los endpoints del CRUD.
4. `validators/movieValidator.js`: concentra las reglas de validacion.
5. `errors/createError.js`: crea errores con status y detalles.
6. `middlewares/errorHandler.js`: arma la respuesta final de error.
7. `middlewares/notFoundHandler.js`: maneja rutas inexistentes.
8. `tests/`: prueba validadores, errores y endpoints.
9. `db/`: configuracion y setup de PostgreSQL.

## Estructura del proyecto

```text
api-movies-m2l6/
|-- app.js
|-- server.js
|-- db/
|   |-- config.js
|   |-- setup.sql
|   `-- test-connection.js
|-- errors/
|   `-- createError.js
|-- middlewares/
|   |-- errorHandler.js
|   `-- notFoundHandler.js
|-- routes/
|   `-- movies.js
|-- validators/
|   `-- movieValidator.js
|-- tests/
|   |-- createError.test.mjs
|   |-- movieValidator.test.mjs
|   `-- movies.routes.test.mjs
|-- .env.example
|-- .gitignore
|-- package.json
`-- package-lock.json
```

## Responsabilidad de cada archivo

`server.js`

Carga variables de entorno en desarrollo y levanta el servidor con `app.listen()`. No contiene rutas ni logica de negocio.

`app.js`

Crea la app Express, activa `express.json()`, monta las rutas y registra los middlewares de error. Exporta `createApp()` para poder testear con un pool falso.

`routes/movies.js`

Define el CRUD:

```text
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies
PUT    /api/movies/:id
DELETE /api/movies/:id
```

Las rutas validan antes de ejecutar SQL y usan `next(error)` para delegar errores al middleware central.

`validators/movieValidator.js`

Contiene las reglas de validacion:

- `id` debe ser un entero positivo.
- `title` es obligatorio en `POST`.
- `director` es obligatorio en `POST`.
- `year` es obligatorio en `POST`.
- `PUT` permite actualizacion parcial.
- `PUT` exige al menos un campo valido.
- `year` debe ser entero.
- `rating` debe ser numerico.
- `rating` debe estar entre 0 y 10.
- `genre` es opcional.

`errors/createError.js`

Centraliza la creacion de errores:

```js
createError(400, 'Datos invalidos', details)
```

`middlewares/errorHandler.js`

Devuelve errores con formato consistente:

```json
{
  "error": "Datos invalidos",
  "details": [
    {
      "field": "title",
      "message": "El titulo es requerido"
    }
  ]
}
```

`tests/`

Incluye tests de:

- Validadores.
- `createError`.
- Endpoints principales.
- Errores `400`.
- Errores `404`.
- Error interno `500`.

## Instalacion

Entrar a la carpeta:

```bash
cd api-movies-m2l6
```

Instalar dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto con este contenido:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movies_db
DB_USER=movies_user
DB_PASSWORD=movies_pass_2026
PORT=3000
```

El archivo `.env` no se sube al repositorio.

## Preparar PostgreSQL local

Entrar a PostgreSQL como usuario administrador:

```bash
psql -U postgres
```

Crear base, usuario y permisos:

```sql
CREATE DATABASE movies_db;
CREATE USER movies_user WITH PASSWORD 'movies_pass_2026';
\c movies_db
GRANT ALL PRIVILEGES ON DATABASE movies_db TO movies_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO movies_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO movies_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO movies_user;
\q
```

Crear tabla e insertar datos iniciales:

```bash
psql -U movies_user -d movies_db -f db/setup.sql
```

Probar conexion desde Node.js:

```bash
npm run test:db
```

## Ejecutar la API

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

## Probar endpoints manualmente

Ruta inicial:

```bash
curl http://localhost:3000/
```

Listar peliculas:

```bash
curl http://localhost:3000/api/movies
```

Obtener una pelicula:

```bash
curl http://localhost:3000/api/movies/1
```

Crear una pelicula:

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Interstellar","director":"Christopher Nolan","year":2014,"genre":"Sci-Fi","rating":8.6}'
```

Actualizar una pelicula:

```bash
curl -X PUT http://localhost:3000/api/movies/1 \
  -H "Content-Type: application/json" \
  -d '{"rating":9.0}'
```

Eliminar una pelicula:

```bash
curl -X DELETE http://localhost:3000/api/movies/1
```

## Probar validaciones

Crear pelicula sin campos obligatorios:

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{}'
```

Enviar rating fuera de rango:

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Movie","director":"Director","year":2010,"rating":15}'
```

Enviar id invalido:

```bash
curl http://localhost:3000/api/movies/abc
```

Actualizar sin campos:

```bash
curl -X PUT http://localhost:3000/api/movies/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Tests automaticos

Ejecutar todos los tests:

```bash
npm test
```

Ejecutar tests en modo watch:

```bash
npm run test:watch
```

Ejecutar tests con coverage:

```bash
npm run test:coverage
```

## Como funcionan los tests

Los tests de endpoints no usan la base real. En vez de conectar a PostgreSQL, se crea un pool falso con `query: vi.fn()`.

Eso permite probar:

- Que la ruta responde el status correcto.
- Que el body tiene el formato esperado.
- Que se llama a `pool.query()` con el SQL correcto.
- Que los errores se transforman en respuestas `400`, `404` o `500`.

Este enfoque es util para M2L6 porque muestra testing automatico sin exigir que cada alumno tenga una base de datos de test configurada.

## Resultado esperado de tests

```text
Test Files  3 passed
Tests       25 passed
```

## Subir como repo independiente

Desde la carpeta `api-movies-m2l6`:

```bash
git init
git add .
git commit -m "Proyecto final M2L6"
git branch -M main
git remote add origin https://github.com/tu-usuario/api-movies-m2l6.git
git push -u origin main
```

No subir:

- `.env`
- `node_modules/`
- `coverage/`

Estos archivos ya estan contemplados en `.gitignore`.
