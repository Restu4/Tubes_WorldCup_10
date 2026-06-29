const teamService = require('../services/teamService');
const { success, error } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const { group, sort } = req.query;
    const teams = await teamService.getAll(group, sort);
    return success(res, teams);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const team = await teamService.getById(parseInt(req.params.id));
    return success(res, team);
  } catch (err) {
    if (err.message === 'Team not found') return error(res, err.message, 404);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const team = await teamService.create(req.body);
    return success(res, team, 'Team created', 201);
  } catch (err) {
    if (err.message.includes('already exists')) return error(res, err.message, 409);
    if (err.message.includes('not found')) return error(res, err.message, 404);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const team = await teamService.update(parseInt(req.params.id), req.body);
    return success(res, team, 'Team updated');
  } catch (err) {
    if (err.message === 'Team not found') return error(res, err.message, 404);
    if (err.message.includes('already exists')) return error(res, err.message, 409);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await teamService.remove(parseInt(req.params.id));
    return success(res, null, 'Team deleted');
  } catch (err) {
    if (err.message === 'Team not found') return error(res, err.message, 404);
    if (err.message.includes('Cannot delete')) return error(res, err.message, 400);
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
