const matchService = require('../services/matchService');
const { success, error } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const { phase, status, group } = req.query;
    const matches = await matchService.getAll(phase, status, group);
    return success(res, matches);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const match = await matchService.getById(parseInt(req.params.id));
    return success(res, match);
  } catch (err) {
    if (err.message === 'Match not found') return error(res, err.message, 404);
    next(err);
  }
}

async function updateResult(req, res, next) {
  try {
    const { scoreA, scoreB } = req.body;
    const match = await matchService.updateResult(parseInt(req.params.id), scoreA, scoreB);
    return success(res, match, 'Result updated');
  } catch (err) {
    if (err.message === 'Match not found') return error(res, err.message, 404);
    if (err.message.includes('negative')) return error(res, err.message, 400);
    next(err);
  }
}

async function getByGroup(req, res, next) {
  try {
    const matches = await matchService.getByGroup(parseInt(req.params.groupId));
    return success(res, matches);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, updateResult, getByGroup };
