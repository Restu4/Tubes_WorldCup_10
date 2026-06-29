const tournamentRepository = require('../repositories/tournamentRepository');
const teamRepository = require('../repositories/teamRepository');
const groupRepository = require('../repositories/groupRepository');
const matchRepository = require('../repositories/matchRepository');
const { TOURNAMENT_STATUS } = require('../constants');

async function getTournament() {
  let tournament = await tournamentRepository.findFirst();
  if (!tournament) {
    tournament = await tournamentRepository.create();
  }
  return tournament;
}

async function getStatus() {
  const tournament = await getTournament();
  return { status: tournament.status };
}

async function setupTournament() {
  let tournament = await tournamentRepository.findFirst();
  if (!tournament) {
    tournament = await tournamentRepository.create();
  }

  const existingMatches = await matchRepository.findAll('GROUP');
  if (existingMatches.length > 0) {
    return tournamentRepository.findFirst();
  }

  const teams = await teamRepository.findAll();
  const uniqueGroups = [...new Set(teams.filter(t => t.group).map(t => t.group.name))].sort();

  if (uniqueGroups.length < 4) {
    throw new Error(`Need at least 4 groups. Found ${uniqueGroups.length} group(s) with teams.`);
  }

  for (const groupName of uniqueGroups) {
    const group = await groupRepository.findByName(groupName);
    if (!group) continue;

    const groupTeams = await teamRepository.findByGroupId(group.id);
    if (groupTeams.length < 2) {
      throw new Error(`Group ${groupName} needs at least 2 teams.`);
    }

    const matches = [];
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        matches.push({
          groupId: group.id,
          teamAId: groupTeams[i].id,
          teamBId: groupTeams[j].id,
          phase: 'GROUP',
          round: 'GROUP',
          status: 'SCHEDULED',
          scoreA: null,
          scoreB: null,
          winnerId: null,
        });
      }
    }
    await matchRepository.createMany(matches);
  }

  tournament = await tournamentRepository.updateStatus(tournament.id, TOURNAMENT_STATUS.GROUP_STAGE);
  return tournamentRepository.findFirst();
}

async function advanceTournament() {
  const tournament = await tournamentRepository.findFirst();

  if (!tournament || tournament.status !== TOURNAMENT_STATUS.GROUP_STAGE) {
    throw new Error('Tournament must be in GROUP_STAGE to advance');
  }

  const scheduledCount = await matchRepository.countByPhaseAndStatus('GROUP', 'SCHEDULED');
  if (scheduledCount > 0) {
    throw new Error(`Cannot advance. ${scheduledCount} group match(es) still scheduled.`);
  }

  await tournamentRepository.updateStatus(tournament.id, TOURNAMENT_STATUS.KNOCKOUT);

  const groups = await groupRepository.findAll();
  const qualifiedTeams = [];
  const standingService = require('./standingService');

  for (const group of groups) {
    const standings = await standingService.getByGroupId(group.id);
    const top2 = standings.slice(0, 2);
    for (const s of top2) {
      qualifiedTeams.push(s.team);
    }
  }

  const matches = [];
  const total = qualifiedTeams.length;
  let position = 1;
  const roundName = total > 8 ? 'R16' : total > 4 ? 'QUARTER_FINAL' : total > 2 ? 'SEMI_FINAL' : 'FINAL';

  for (let i = 0; i < total; i += 2) {
    matches.push({
      teamAId: qualifiedTeams[i].id,
      teamBId: qualifiedTeams[i + 1].id,
      phase: 'KNOCKOUT',
      round: roundName,
      status: 'SCHEDULED',
      scoreA: null,
      scoreB: null,
      winnerId: null,
    });
  }

  if (matches.length > 0) {
    await matchRepository.createMany(matches);
  }

  return tournamentRepository.findFirst();
}

async function resetTournament() {
  await matchRepository.removeAll();
  await groupRepository.removeAll();
  await teamRepository.clearGroupAssignments();
  const tournament = await tournamentRepository.findFirst();
  if (tournament) {
    await tournamentRepository.updateStatus(tournament.id, TOURNAMENT_STATUS.NOT_STARTED);
  }
  return tournamentRepository.findFirst();
}

module.exports = { getTournament, getStatus, setupTournament, advanceTournament, resetTournament };
