const authService = require('../services/authService');
const { success, error } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { password } = req.body;
    const result = await authService.login(password);
    return res.status(200).json({ success: true, token: result.token });
  } catch (err) {
    if (err.message === 'Wrong Password') {
      return error(res, err.message, 401);
    }
    next(err);
  }
}

module.exports = { login };
