const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return error(res, 'Validation failed', 400, messages);
  }
  next();
}

module.exports = { validate };
