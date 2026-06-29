const bracketService = require('../services/bracketService');
const { success } = require('../utils/response');

async function getBracket(req, res, next) {
  try {
    const bracket = await bracketService.getBracket();
    return success(res, bracket);
  } catch (err) {
    next(err);
  }
}

module.exports = { getBracket };
