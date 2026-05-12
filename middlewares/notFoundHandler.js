const createError = require('../errors/createError');

const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Ruta no encontrada'));
};

module.exports = notFoundHandler;
