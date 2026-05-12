# API Movies M2L6

API REST de peliculas construida con Node.js, Express y PostgreSQL.

Esta carpeta representa el proyecto terminado de M2L6: parte de la API con base de datos de M2L5 y agrega validacion de inputs, manejo centralizado de errores y tests automatizados con Vitest y Supertest.

## Objetivos de la clase

- Validar datos antes de ejecutar queries.
- Reutilizar funciones de validacion en `POST`, `PUT` y parametros de ruta.
- Propagar errores con `next(error)`.
- Responder errores desde un unico middleware centralizado.
- Probar validadores, errores y endpoints sin depender de PostgreSQL.

## Estructura

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

## Cambios importantes respecto a M2L5

`app.js` crea y exporta la app Express. Esto permite testear endpoints con Supertest sin levantar un servidor real.

`server.js` solo carga variables de entorno en desarrollo y ejecuta `app.listen()`.

`validators/movieValidator.js` concentra las reglas de validacion:

- `id` debe ser entero positivo.
- `title`, `director` y `year` son obligatorios en `POST`.
- `PUT` acepta actualizaciones parciales, pero exige al menos un campo valido.
- `year` debe ser entero y estar en un rango valido.
- `rating` debe ser numerico entre 0 y 10.
- `genre` es opcional.

`errors/createError.js` crea errores con `statusCode`, `message` y `details`.

`middlewares/errorHandler.js` define una salida consistente:

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

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movies_db
DB_USER=movies_user
DB_PASSWORD=movies_pass_2026
PORT=3000
```

El archivo `.env` no se sube al repositorio.

## Base de datos local

Crear base y usuario:

```sql
CREATE DATABASE movies_db;
CREATE USER movies_user WITH PASSWORD 'movies_pass_2026';
\c movies_db
GRANT ALL PRIVILEGES ON DATABASE movies_db TO movies_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO movies_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO movies_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO movies_user;
```

Ejecutar el setup:

```bash
psql -U movies_user -d movies_db -f db/setup.sql
```

Probar conexion:

```bash
npm run test:db
```

## Ejecutar la API

```bash
npm run dev
```

La API queda disponible en:

```text
http://localhost:3000
```

## Endpoints

```text
GET    /
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies
PUT    /api/movies/:id
DELETE /api/movies/:id
```

## Ejemplos con curl

Crear una pelicula valida:

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Interstellar","director":"Christopher Nolan","year":2014,"genre":"Sci-Fi","rating":8.6}'
```

Error por datos invalidos:

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"","director":"Christopher Nolan"}'
```

Actualizar parcialmente:

```bash
curl -X PUT http://localhost:3000/api/movies/1 \
  -H "Content-Type: application/json" \
  -d '{"rating":9.0}'
```

Eliminar:

```bash
curl -X DELETE http://localhost:3000/api/movies/1
```

## Tests

Los tests de endpoints usan un pool falso inyectado en `createApp({ pool })`. Por eso no necesitan una base PostgreSQL real.

Ejecutar todos los tests:

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

## Para subir a GitHub

Subir esta carpeta como repositorio independiente:

```bash
git init
git add .
git commit -m "Proyecto final M2L6"
git branch -M main
git remote add origin https://github.com/tu-usuario/api-movies-m2l6.git
git push -u origin main
```

No subir manualmente:

- `.env`
- `node_modules/`
- `coverage/`
