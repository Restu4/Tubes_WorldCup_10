const prisma = require('../utils/prisma');

async function findFirst() {
  return prisma.tournament.findFirst({ include: { groups: true } });
}

async function create() {
  return prisma.tournament.create({ data: { status: 'NOT_STARTED' } });
}

async function updateStatus(id, status) {
  return prisma.tournament.update({ where: { id }, data: { status } });
}

async function remove(id) {
  return prisma.tournament.delete({ where: { id } });
}

async function findById(id) {
  return prisma.tournament.findUnique({ where: { id }, include: { groups: true } });
}

module.exports = { findFirst, create, updateStatus, remove, findById };
