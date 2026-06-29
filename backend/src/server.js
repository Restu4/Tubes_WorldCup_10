const app = require('./app');
const config = require('./config');

const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

module.exports = app;