import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import appModule from '../app.js';

const { createApp } = appModule;

const movies = [
  {
    id: 1,
    title: 'Inception',
    director: 'Christopher Nolan',
    year: 2010,
    genre: 'Sci-Fi',
    rating: '8.8'
  }
];

const createPool = () => ({
  query: vi.fn()
});

describe('movies routes', () => {
  let pool;
  let app;

  beforeEach(() => {
    pool = createPool();
    app = createApp({ pool });
  });

  test('GET / devuelve informacion base', async () => {
    const response = await request(app).get('/').expect(200);

    expect(response.body).toEqual({
      message: 'Movies API',
      endpoints: {
        movies: '/api/movies'
      }
    });
  });

  test('GET /api/movies devuelve peliculas', async () => {
    pool.query.mockResolvedValueOnce({ rows: movies });

    const response = await request(app).get('/api/movies').expect(200);

    expect(response.body).toEqual(movies);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM movies ORDER BY title;');
  });

  test('GET /api/movies/:id devuelve una pelicula', async () => {
    pool.query.mockResolvedValueOnce({ rows: [movies[0]] });

    const response = await request(app).get('/api/movies/1').expect(200);

    expect(response.body).toEqual(movies[0]);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [1]);
  });

  test('GET /api/movies/:id devuelve 400 con id invalido', async () => {
    const response = await request(app).get('/api/movies/abc').expect(400);

    expect(response.body).toEqual({
      error: 'Parametro id invalido',
      details: [
        {
          field: 'id',
          message: 'El id debe ser un entero positivo'
        }
      ]
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('GET /api/movies/:id devuelve 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/api/movies/99').expect(404);

    expect(response.body).toEqual({ error: 'Pelicula no encontrada' });
  });

  test('POST /api/movies crea una pelicula', async () => {
    const createdMovie = { ...movies[0], id: 2 };
    pool.query.mockResolvedValueOnce({ rows: [createdMovie] });

    const response = await request(app)
      .post('/api/movies')
      .send({
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        genre: 'Sci-Fi',
        rating: 8.8
      })
      .expect(201);

    expect(response.body).toEqual(createdMovie);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO movies (title, director, year, genre, rating)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
      ['Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 8.8]
    );
  });

  test('POST /api/movies devuelve 400 con datos invalidos', async () => {
    const response = await request(app)
      .post('/api/movies')
      .send({ title: '', director: 'Director' })
      .expect(400);

    expect(response.body.error).toBe('Datos invalidos');
    expect(response.body.details).toEqual([
      { field: 'title', message: 'El titulo es requerido' },
      { field: 'year', message: 'El anio es requerido' }
    ]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT /api/movies/:id actualiza una pelicula', async () => {
    const updatedMovie = { ...movies[0], rating: '9.0' };

    pool.query
      .mockResolvedValueOnce({ rows: [movies[0]] })
      .mockResolvedValueOnce({ rows: [updatedMovie] });

    const response = await request(app)
      .put('/api/movies/1')
      .send({ rating: 9 })
      .expect(200);

    expect(response.body).toEqual(updatedMovie);
    expect(pool.query).toHaveBeenLastCalledWith(
      `UPDATE movies
         SET title = $1,
             director = $2,
             year = $3,
             genre = $4,
             rating = $5
         WHERE id = $6
         RETURNING *`,
      ['Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 9, 1]
    );
  });

  test('PUT /api/movies/:id devuelve 400 con body vacio', async () => {
    const response = await request(app)
      .put('/api/movies/1')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      error: 'Datos invalidos',
      details: [
        {
          field: 'body',
          message: 'Debe enviar al menos un campo valido para actualizar'
        }
      ]
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('PUT /api/movies/:id devuelve 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .put('/api/movies/99')
      .send({ rating: 9 })
      .expect(404);

    expect(response.body).toEqual({ error: 'Pelicula no encontrada' });
  });

  test('DELETE /api/movies/:id elimina una pelicula', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const response = await request(app).delete('/api/movies/1').expect(200);

    expect(response.body).toEqual({ message: 'Pelicula eliminada exitosamente' });
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM movies WHERE id = $1', [1]);
  });

  test('DELETE /api/movies/:id devuelve 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const response = await request(app).delete('/api/movies/99').expect(404);

    expect(response.body).toEqual({ error: 'Pelicula no encontrada' });
  });

  test('devuelve 404 para rutas inexistentes', async () => {
    const response = await request(app).get('/api/unknown').expect(404);

    expect(response.body).toEqual({ error: 'Ruta no encontrada' });
  });

  test('devuelve 500 ante errores no controlados', async () => {
    pool.query.mockRejectedValueOnce(new Error('database down'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/api/movies').expect(500);

    expect(response.body).toEqual({ error: 'Error interno del servidor' });
    errorSpy.mockRestore();
  });
});
