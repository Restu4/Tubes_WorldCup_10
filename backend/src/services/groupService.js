const groupRepository = require('../repositories/groupRepository');

async function getAll() {
  const groups = await groupRepository.findAll();
  return groups.map(g => ({
    group: g.name,
    teams: g.teams.map(t => ({ id: t.id, name: t.name, code: t.code })),
  }));
}

async function getById(id) {
  const group = await groupRepository.findById(id);
  if (!group) throw new Error('Group not found');
  return group;
}

module.exports = { getAll, getById };
