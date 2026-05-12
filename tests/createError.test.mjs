import { describe, expect, test } from 'vitest';
import createError from '../errors/createError.js';

describe('createError', () => {
  test('crea un error con statusCode y message', () => {
    const error = createError(404, 'Pelicula no encontrada');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Pelicula no encontrada');
  });

  test('usa valores por defecto para errores internos', () => {
    const error = createError();

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Error interno del servidor');
  });

  test('agrega details cuando se envian', () => {
    const details = [{ field: 'title', message: 'El titulo es requerido' }];
    const error = createError(400, 'Datos invalidos', details);

    expect(error.details).toEqual(details);
  });
});
