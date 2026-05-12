const { loadEnvFile } = require('node:process');

if (process.env.NODE_ENV !== 'production') {
  loadEnvFile('.env');
}

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Movies API escuchando en http://localhost:${PORT}`);
});
