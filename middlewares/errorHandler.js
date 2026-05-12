const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    error: statusCode === 500 ? 'Error interno del servidor' : err.message
  };

  if (err.details) {
    response.details = err.details;
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
