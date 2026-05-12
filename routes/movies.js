const express = require('express');
const defaultPool = require('../db/config');
const createError = require('../errors/createError');
const {
  validateCreateMovie,
  validateId,
  validateUpdateMovie
} = require('../validators/movieValidator');

const createMoviesRouter = (pool = defaultPool) => {
  const router = express.Router();

  router.param('id', (req, res, next, id) => {
    const validation = validateId(id);

    if (validation.errors.length > 0) {
      return next(createError(400, 'Parametro id invalido', validation.errors));
    }

    req.movieId = validation.value;
    next();
  });

  router.get('/', async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM movies ORDER BY title;');
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.movieId]);

      if (result.rows.length === 0) {
        return next(createError(404, 'Pelicula no encontrada'));
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const validation = validateCreateMovie(req.body);

      if (validation.errors.length > 0) {
        return next(createError(400, 'Datos invalidos', validation.errors));
      }

      const movie = validation.value;
      const result = await pool.query(
        `INSERT INTO movies (title, director, year, genre, rating)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          movie.title,
          movie.director,
          movie.year,
          movie.genre,
          movie.rating
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const validation = validateUpdateMovie(req.body);

      if (validation.errors.length > 0) {
        return next(createError(400, 'Datos invalidos', validation.errors));
      }

      const currentResult = await pool.query('SELECT * FROM movies WHERE id = $1', [req.movieId]);

      if (currentResult.rows.length === 0) {
        return next(createError(404, 'Pelicula no encontrada'));
      }

      const currentMovie = currentResult.rows[0];
      const movie = validation.value;
      const result = await pool.query(
        `UPDATE movies
         SET title = $1,
             director = $2,
             year = $3,
             genre = $4,
             rating = $5
         WHERE id = $6
         RETURNING *`,
        [
          Object.prototype.hasOwnProperty.call(movie, 'title') ? movie.title : currentMovie.title,
          Object.prototype.hasOwnProperty.call(movie, 'director') ? movie.director : currentMovie.director,
          Object.prototype.hasOwnProperty.call(movie, 'year') ? movie.year : currentMovie.year,
          Object.prototype.hasOwnProperty.call(movie, 'genre') ? movie.genre : currentMovie.genre,
          Object.prototype.hasOwnProperty.call(movie, 'rating') ? movie.rating : currentMovie.rating,
          req.movieId
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await pool.query('DELETE FROM movies WHERE id = $1', [req.movieId]);

      if (result.rowCount === 0) {
        return next(createError(404, 'Pelicula no encontrada'));
      }

      res.json({ message: 'Pelicula eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = createMoviesRouter;
