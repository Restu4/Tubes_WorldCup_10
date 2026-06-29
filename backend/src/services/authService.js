const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const adminRepository = require('../repositories/adminRepository');

async function login(password) {
  const admin = await adminRepository.findFirst();
  if (!admin) throw new Error('No admin account found');

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error('Wrong Password');

  const token = jwt.sign({ id: admin.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return { token };
}

module.exports = { login };
