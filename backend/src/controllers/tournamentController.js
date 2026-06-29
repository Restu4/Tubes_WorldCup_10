const tournamentService = require('../services/tournamentService');
const { success, error } = require('../utils/response');

async function getStatus(req, res, next) {
  try {
    const status = await tournamentService.getStatus();
    return success(res, status);
  } catch (err) {
    next(err);
  }
}

async function setup(req, res, next) {
  try {
    const tournament = await tournamentService.setupTournament();
    return success(res, tournament, 'Tournament setup complete');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function advance(req, res, next) {
  try {
    const tournament = await tournamentService.advanceTournament();
    return success(res, tournament, 'Tournament advanced to knockout stage');
  } catch (err) {
    if (err.message.includes('Cannot advance') || err.message.includes('must be in')) {
      return error(res, err.message, 400);
    }
    next(err);
  }
}

async function reset(req, res, next) {
  try {
    const tournament = await tournamentService.resetTournament();
    return success(res, tournament, 'Tournament has been reset');
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus, setup, advance, reset };
