const matchRepository = require('../repositories/matchRepository');

async function getAll(phase, status, group) {
  return matchRepository.findAll(phase, status, group);
}

async function getById(id) {
  const match = await matchRepository.findById(id);
  if (!match) throw new Error('Match not found');
  return match;
}

async function updateResult(id, scoreA, scoreB) {
  if (scoreA < 0 || scoreB < 0) throw new Error('Score cannot be negative');

  const match = await matchRepository.findById(id);
  if (!match) throw new Error('Match not found');

  let winnerId = null;
  if (scoreA > scoreB) {
    winnerId = match.teamAId;
  } else if (scoreB > scoreA) {
    winnerId = match.teamBId;
  }

  return matchRepository.update(id, {
    scoreA,
    scoreB,
    winnerId,
    status: 'FINISHED',
  });
}

async function getByGroup(groupId) {
  return matchRepository.findByGroupId(groupId);
}

module.exports = { getAll, getById, updateResult, getByGroup };
