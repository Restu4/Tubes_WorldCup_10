const standingService = require('../services/standingService');
const groupRepository = require('../repositories/groupRepository');
const { success, error } = require('../utils/response');

async function getByGroup(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await groupRepository.findById(groupId);
    if (!group) return error(res, 'Group not found', 404);
    const standings = await standingService.getByGroupId(groupId);
    return success(res, { group: group.name, standings });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const groups = await groupRepository.findAll();
    const result = {};
    for (const g of groups) {
      const standings = await standingService.getByGroupId(g.id);
      result[g.name] = standings;
    }
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getByGroup, getAll };
