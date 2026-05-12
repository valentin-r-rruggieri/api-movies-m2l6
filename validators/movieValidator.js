const currentYear = new Date().getFullYear();
const MIN_MOVIE_YEAR = 1888;
const MAX_MOVIE_YEAR = currentYear + 1;

const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const isBlankString = (value) => typeof value === 'string' && value.trim() === '';

const validateId = (id) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return {
      errors: [
        {
          field: 'id',
          message: 'El id debe ser un entero positivo'
        }
      ]
    };
  }

  return { value: parsedId, errors: [] };
};

const validateRequiredString = (body, field, label, maxLength) => {
  if (!hasOwn(body, field) || body[field] === null || body[field] === undefined || isBlankString(body[field])) {
    return {
      error: {
        field,
        message: `${label} es requerido`
      }
    };
  }

  if (typeof body[field] !== 'string') {
    return {
      error: {
        field,
        message: `${label} debe ser texto`
      }
    };
  }

  const value = body[field].trim();

  if (value.length > maxLength) {
    return {
      error: {
        field,
        message: `${label} no puede superar ${maxLength} caracteres`
      }
    };
  }

  return { value };
};

const validateOptionalString = (body, field, label, maxLength) => {
  if (!hasOwn(body, field) || body[field] === undefined || body[field] === null || isBlankString(body[field])) {
    return { value: null, present: hasOwn(body, field) };
  }

  if (typeof body[field] !== 'string') {
    return {
      present: true,
      error: {
        field,
        message: `${label} debe ser texto`
      }
    };
  }

  const value = body[field].trim();

  if (value.length > maxLength) {
    return {
      present: true,
      error: {
        field,
        message: `${label} no puede superar ${maxLength} caracteres`
      }
    };
  }

  return { value, present: true };
};

const validateYear = (body, required = false) => {
  if (!hasOwn(body, 'year') || body.year === undefined || body.year === null || body.year === '') {
    if (required) {
      return {
        error: {
          field: 'year',
          message: 'El anio es requerido'
        }
      };
    }

    return { present: false };
  }

  const year = Number(body.year);

  if (!Number.isInteger(year)) {
    return {
      present: true,
      error: {
        field: 'year',
        message: 'El anio debe ser un entero valido'
      }
    };
  }

  if (year < MIN_MOVIE_YEAR || year > MAX_MOVIE_YEAR) {
    return {
      present: true,
      error: {
        field: 'year',
        message: `El anio debe estar entre ${MIN_MOVIE_YEAR} y ${MAX_MOVIE_YEAR}`
      }
    };
  }

  return { value: year, present: true };
};

const validateRating = (body) => {
  if (!hasOwn(body, 'rating') || body.rating === undefined || body.rating === null || body.rating === '') {
    return { value: null, present: hasOwn(body, 'rating') };
  }

  const rating = Number(body.rating);

  if (Number.isNaN(rating)) {
    return {
      present: true,
      error: {
        field: 'rating',
        message: 'El rating debe ser un numero valido'
      }
    };
  }

  if (rating < 0 || rating > 10) {
    return {
      present: true,
      error: {
        field: 'rating',
        message: 'El rating debe estar entre 0 y 10'
      }
    };
  }

  return { value: rating, present: true };
};

const validateCreateMovie = (body = {}) => {
  const errors = [];
  const movie = {};

  const title = validateRequiredString(body, 'title', 'El titulo', 200);
  const director = validateRequiredString(body, 'director', 'El director', 100);
  const year = validateYear(body, true);
  const genre = validateOptionalString(body, 'genre', 'El genero', 50);
  const rating = validateRating(body);

  for (const result of [title, director, year, genre, rating]) {
    if (result.error) {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  movie.title = title.value;
  movie.director = director.value;
  movie.year = year.value;
  movie.genre = genre.value;
  movie.rating = rating.value;

  return { value: movie, errors: [] };
};

const validateUpdateMovie = (body = {}) => {
  const errors = [];
  const movie = {};
  const allowedFields = ['title', 'director', 'year', 'genre', 'rating'];
  const presentFields = allowedFields.filter((field) => hasOwn(body, field));

  if (presentFields.length === 0) {
    return {
      errors: [
        {
          field: 'body',
          message: 'Debe enviar al menos un campo valido para actualizar'
        }
      ]
    };
  }

  if (hasOwn(body, 'title')) {
    const title = validateRequiredString(body, 'title', 'El titulo', 200);

    if (title.error) {
      errors.push(title.error);
    } else {
      movie.title = title.value;
    }
  }

  if (hasOwn(body, 'director')) {
    const director = validateRequiredString(body, 'director', 'El director', 100);

    if (director.error) {
      errors.push(director.error);
    } else {
      movie.director = director.value;
    }
  }

  if (hasOwn(body, 'year')) {
    const year = validateYear(body);

    if (year.error) {
      errors.push(year.error);
    } else {
      movie.year = year.value;
    }
  }

  if (hasOwn(body, 'genre')) {
    const genre = validateOptionalString(body, 'genre', 'El genero', 50);

    if (genre.error) {
      errors.push(genre.error);
    } else {
      movie.genre = genre.value;
    }
  }

  if (hasOwn(body, 'rating')) {
    const rating = validateRating(body);

    if (rating.error) {
      errors.push(rating.error);
    } else {
      movie.rating = rating.value;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value: movie, errors: [] };
};

module.exports = {
  MIN_MOVIE_YEAR,
  MAX_MOVIE_YEAR,
  validateCreateMovie,
  validateId,
  validateUpdateMovie
};
