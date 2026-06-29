const prisma = require('../utils/prisma');

async function findAll() {
  return prisma.group.findMany({ include: { teams: true } });
}

async function findById(id) {
  return prisma.group.findUnique({
    where: { id },
    include: { teams: true, matches: { include: { teamA: true, teamB: true } } },
  });
}

async function findByName(name) {
  return prisma.group.findUnique({ where: { name }, include: { teams: true } });
}

async function create(data) {
  return prisma.group.create({ data });
}

async function createMany(data) {
  return prisma.group.createMany({ data });
}

async function removeAll() {
  return prisma.group.deleteMany();
}

async function count() {
  return prisma.group.count();
}

module.exports = { findAll, findById, findByName, create, createMany, removeAll, count };
