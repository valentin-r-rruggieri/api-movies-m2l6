import { describe, expect, test } from 'vitest';
import validatorModule from '../validators/movieValidator.js';

const {
  MAX_MOVIE_YEAR,
  MIN_MOVIE_YEAR,
  validateCreateMovie,
  validateId,
  validateUpdateMovie
} = validatorModule;

describe('movie validators', () => {
  test('valida un id entero positivo', () => {
    expect(validateId('12')).toEqual({ value: 12, errors: [] });
  });

  test('rechaza un id invalido', () => {
    const result = validateId('abc');

    expect(result.errors).toEqual([
      {
        field: 'id',
        message: 'El id debe ser un entero positivo'
      }
    ]);
  });

  test('valida una pelicula nueva y normaliza campos opcionales', () => {
    const result = validateCreateMovie({
      title: '  Inception ',
      director: ' Christopher Nolan ',
      year: '2010',
      genre: '',
      rating: '8.8'
    });

    expect(result.errors).toEqual([]);
    expect(result.value).toEqual({
      title: 'Inception',
      director: 'Christopher Nolan',
      year: 2010,
      genre: null,
      rating: 8.8
    });
  });

  test('rechaza campos requeridos faltantes en create', () => {
    const result = validateCreateMovie({});

    expect(result.errors).toEqual([
      { field: 'title', message: 'El titulo es requerido' },
      { field: 'director', message: 'El director es requerido' },
      { field: 'year', message: 'El anio es requerido' }
    ]);
  });

  test('rechaza tipos invalidos', () => {
    const result = validateCreateMovie({
      title: 100,
      director: false,
      year: 'dos mil diez',
      genre: 123,
      rating: 'alto'
    });

    expect(result.errors).toEqual([
      { field: 'title', message: 'El titulo debe ser texto' },
      { field: 'director', message: 'El director debe ser texto' },
      { field: 'year', message: 'El anio debe ser un entero valido' },
      { field: 'genre', message: 'El genero debe ser texto' },
      { field: 'rating', message: 'El rating debe ser un numero valido' }
    ]);
  });

  test('rechaza rangos invalidos', () => {
    const result = validateCreateMovie({
      title: 'Movie',
      director: 'Director',
      year: MIN_MOVIE_YEAR - 1,
      rating: 11
    });

    expect(result.errors).toEqual([
      { field: 'year', message: `El anio debe estar entre ${MIN_MOVIE_YEAR} y ${MAX_MOVIE_YEAR}` },
      { field: 'rating', message: 'El rating debe estar entre 0 y 10' }
    ]);
  });

  test('valida un update parcial', () => {
    const result = validateUpdateMovie({ rating: '9.5' });

    expect(result.errors).toEqual([]);
    expect(result.value).toEqual({ rating: 9.5 });
  });

  test('rechaza update sin campos validos', () => {
    const result = validateUpdateMovie({});

    expect(result.errors).toEqual([
      {
        field: 'body',
        message: 'Debe enviar al menos un campo valido para actualizar'
      }
    ]);
  });
});
