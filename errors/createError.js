const createError = (statusCode = 500, message = 'Error interno del servidor', details) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  if (details !== undefined) {
    error.details = details;
  }

  return error;
};

module.exports = createError;
