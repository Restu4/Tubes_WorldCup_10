const prisma = require('../utils/prisma');

async function findAll(group, sort) {
  const where = {};
  if (group) {
    where.group = { name: group };
  }
  const orderBy = [];
  if (sort === 'name') {
    orderBy.push({ name: 'asc' });
  }
  return prisma.team.findMany({ where, include: { group: true }, orderBy });
}

async function findById(id) {
  return prisma.team.findUnique({ where: { id }, include: { group: true } });
}

async function findByName(name) {
  return prisma.team.findUnique({ where: { name } });
}

async function findByCode(code) {
  return prisma.team.findUnique({ where: { code } });
}

async function create(data) {
  return prisma.team.create({ data, include: { group: true } });
}

async function update(id, data) {
  return prisma.team.update({ where: { id }, data, include: { group: true } });
}

async function remove(id) {
  return prisma.team.delete({ where: { id } });
}

async function count() {
  return prisma.team.count();
}

async function clearGroupAssignments() {
  return prisma.team.updateMany({ data: { groupId: 0 } });
}

async function findByGroupId(groupId) {
  return prisma.team.findMany({ where: { groupId } });
}

module.exports = { findAll, findById, findByName, findByCode, create, update, remove, count, clearGroupAssignments, findByGroupId };
