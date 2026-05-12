const express = require('express');
const createMoviesRouter = require('./routes/movies');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const createApp = ({ pool } = {}) => {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      message: 'Movies API',
      endpoints: {
        movies: '/api/movies'
      }
    });
  });

  app.use('/api/movies', createMoviesRouter(pool));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
