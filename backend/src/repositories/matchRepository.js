const prisma = require('../utils/prisma');

async function findAll(phase, status, group) {
  const where = {};
  if (phase) where.phase = phase;
  if (status) where.status = status;
  if (group) where.group = { name: group };
  return prisma.match.findMany({
    where,
    include: { teamA: true, teamB: true, group: true, winner: true },
  });
}

async function findById(id) {
  return prisma.match.findUnique({
    where: { id },
    include: { teamA: true, teamB: true, group: true, winner: true },
  });
}

async function findByGroupId(groupId) {
  return prisma.match.findMany({
    where: { groupId },
    include: { teamA: true, teamB: true },
  });
}

async function findByPhase(phase) {
  return prisma.match.findMany({
    where: { phase },
    include: { teamA: true, teamB: true, winner: true },
  });
}

async function createMany(data) {
  return prisma.match.createMany({ data });
}

async function update(id, data) {
  return prisma.match.update({ where: { id }, data, include: { teamA: true, teamB: true, group: true, winner: true } });
}

async function removeAll() {
  return prisma.match.deleteMany();
}

async function countByPhaseAndStatus(phase, status) {
  return prisma.match.count({ where: { phase, status } });
}

module.exports = { findAll, findById, findByGroupId, findByPhase, createMany, update, removeAll, countByPhaseAndStatus };
