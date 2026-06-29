const { error } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  console.error(err.stack);
  return error(res, err.message || 'Internal Server Error', 500);
}

module.exports = { errorHandler };
