const matchRepository = require('../repositories/matchRepository');
const teamRepository = require('../repositories/teamRepository');

const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSE = 0;

async function getByGroupId(groupId) {
  const matches = await matchRepository.findByGroupId(groupId);
  const teams = await teamRepository.findByGroupId(groupId);
  const stats = {};

  for (const team of teams) {
    stats[team.id] = {
      team: { id: team.id, name: team.name, code: team.code },
      played: 0, win: 0, draw: 0, lose: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    };
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED') continue;

    if (!stats[match.teamAId]) continue;
    if (!stats[match.teamBId]) continue;

    stats[match.teamAId].played++;
    stats[match.teamBId].played++;
    stats[match.teamAId].goalsFor += match.scoreA;
    stats[match.teamAId].goalsAgainst += match.scoreB;
    stats[match.teamBId].goalsFor += match.scoreB;
    stats[match.teamBId].goalsAgainst += match.scoreA;

    if (match.scoreA > match.scoreB) {
      stats[match.teamAId].win++;
      stats[match.teamAId].points += POINTS_WIN;
      stats[match.teamBId].lose++;
      stats[match.teamBId].points += POINTS_LOSE;
    } else if (match.scoreA < match.scoreB) {
      stats[match.teamBId].win++;
      stats[match.teamBId].points += POINTS_WIN;
      stats[match.teamAId].lose++;
      stats[match.teamAId].points += POINTS_LOSE;
    } else {
      stats[match.teamAId].draw++;
      stats[match.teamAId].points += POINTS_DRAW;
      stats[match.teamBId].draw++;
      stats[match.teamBId].points += POINTS_DRAW;
    }
  }

  const standings = Object.values(stats);
  for (const s of standings) {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
  }
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });

  return standings.map((s, i) => ({ rank: i + 1, ...s }));
}

module.exports = { getByGroupId };
