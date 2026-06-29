const groupService = require('../services/groupService');
const standingService = require('../services/standingService');
const { success, error } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const groups = await groupService.getAll();
    return success(res, groups);
  } catch (err) {
    next(err);
  }
}

async function getStandings(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const group = await groupService.getById(groupId);
    const standings = await standingService.getByGroupId(groupId);
    return success(res, { group: group.name, standings });
  } catch (err) {
    if (err.message === 'Group not found') return error(res, err.message, 404);
    next(err);
  }
}

module.exports = { getAll, getStandings };
