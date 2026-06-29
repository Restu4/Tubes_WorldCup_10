const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401);
  }
}

module.exports = { authenticate };
