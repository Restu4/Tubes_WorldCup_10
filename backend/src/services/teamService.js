const teamRepository = require('../repositories/teamRepository');
const groupRepository = require('../repositories/groupRepository');

async function getAll(group, sort) {
  return teamRepository.findAll(group, sort);
}

async function getById(id) {
  const team = await teamRepository.findById(id);
  if (!team) throw new Error('Team not found');
  return team;
}

async function create(data) {
  const existingName = await teamRepository.findByName(data.name);
  if (existingName) throw new Error('Team name already exists');

  const existingCode = await teamRepository.findByCode(data.code);
  if (existingCode) throw new Error('Team code already exists');

  let groupId = null;
  if (data.group) {
    let group = await groupRepository.findByName(data.group);
    if (!group) {
      group = await groupRepository.create({ name: data.group.toUpperCase() });
    }
    groupId = group.id;
  }

  return teamRepository.create({
    name: data.name,
    code: data.code.toUpperCase(),
    flag: data.flag || null,
    groupId,
  });
}

async function update(id, data) {
  const team = await teamRepository.findById(id);
  if (!team) throw new Error('Team not found');

  if (data.name && data.name !== team.name) {
    const existingName = await teamRepository.findByName(data.name);
    if (existingName) throw new Error('Team name already exists');
  }

  if (data.code && data.code !== team.code) {
    const existingCode = await teamRepository.findByCode(data.code);
    if (existingCode) throw new Error('Team code already exists');
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.code) updateData.code = data.code.toUpperCase();
  if (data.flag !== undefined) updateData.flag = data.flag;
  if (data.group) {
    let group = await groupRepository.findByName(data.group);
    if (!group) throw new Error(`Group '${data.group}' not found`);
    updateData.groupId = group.id;
  }

  return teamRepository.update(id, updateData);
}

async function remove(id) {
  const team = await teamRepository.findById(id);
  if (!team) throw new Error('Team not found');
  if (team.groupId) throw new Error('Cannot delete team that is assigned to a group');
  return teamRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove };
