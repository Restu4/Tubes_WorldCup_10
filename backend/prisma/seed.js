const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const teams = [
  { n: 'Argentina', c: 'ARG', g: 'A' }, { n: 'Mexico', c: 'MEX', g: 'A' },
  { n: 'Japan', c: 'JPN', g: 'A' }, { n: 'Nigeria', c: 'NGA', g: 'A' },
  { n: 'France', c: 'FRA', g: 'B' }, { n: 'Portugal', c: 'POR', g: 'B' },
  { n: 'Canada', c: 'CAN', g: 'B' }, { n: 'Australia', c: 'AUS', g: 'B' },
  { n: 'Brazil', c: 'BRA', g: 'C' }, { n: 'Germany', c: 'GER', g: 'C' },
  { n: 'South Korea', c: 'KOR', g: 'C' }, { n: 'Morocco', c: 'MAR', g: 'C' },
  { n: 'England', c: 'ENG', g: 'D' }, { n: 'Italy', c: 'ITA', g: 'D' },
  { n: 'USA', c: 'USA', g: 'D' }, { n: 'Uruguay', c: 'URU', g: 'D' },
  { n: 'Spain', c: 'ESP', g: 'E' }, { n: 'Netherlands', c: 'NED', g: 'E' },
  { n: 'Belgium', c: 'BEL', g: 'E' }, { n: 'Croatia', c: 'CRO', g: 'E' },
  { n: 'Colombia', c: 'COL', g: 'F' }, { n: 'Switzerland', c: 'SUI', g: 'F' },
  { n: 'Denmark', c: 'DEN', g: 'F' }, { n: 'Serbia', c: 'SRB', g: 'F' },
];

const groupScores = {
  A: [[3,1],[2,0],[1,0],[1,1],[0,2],[2,1]],
  B: [[2,0],[1,1],[3,0],[2,1],[1,1],[0,0]],
  C: [[4,0],[2,1],[3,0],[1,1],[2,2],[0,1]],
  D: [[1,0],[0,0],[2,1],[3,1],[1,0],[1,1]],
  E: [[2,1],[1,0],[1,1],[0,0],[2,1],[1,0]],
  F: [[1,0],[2,2],[0,1],[1,0],[3,1],[2,0]],
};

function sortGroup(standings) {
  return standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

async function main() {
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.admin.deleteMany();

  const pwd = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({ data: { password: pwd } });
  console.log('✓ Admin: admin123');

  const tournament = await prisma.tournament.create({ data: { status: 'NOT_STARTED' } });
  const groupMap = {};
  for (const g of ['A', 'B', 'C', 'D', 'E', 'F']) {
    groupMap[g] = await prisma.group.create({ data: { name: g, tournamentId: tournament.id } });
  }
  for (const t of teams) {
    await prisma.team.create({ data: { name: t.n, code: t.c, groupId: groupMap[t.g].id } });
  }
  console.log('✓ 24 teams created across 6 groups');

  const allGroups = await prisma.group.findMany({ include: { teams: true } });
  for (const group of allGroups) {
    const gt = group.teams;
    for (let i = 0; i < gt.length; i++) {
      for (let j = i + 1; j < gt.length; j++) {
        await prisma.match.create({
          data: { groupId: group.id, teamAId: gt[i].id, teamBId: gt[j].id, phase: 'GROUP', round: 'GROUP', status: 'SCHEDULED' },
        });
      }
    }
  }
  const dbMatches = await prisma.match.findMany({ where: { phase: 'GROUP' }, orderBy: { id: 'asc' } });
  let mi = 0;
  for (const group of allGroups) {
    const scores = groupScores[group.name];
    for (const [sa, sb] of scores) {
      const m = dbMatches[mi++];
      const wid = sa > sb ? m.teamAId : sb > sa ? m.teamBId : null;
      await prisma.match.update({
        where: { id: m.id },
        data: { scoreA: sa, scoreB: sb, winnerId: wid, status: 'FINISHED' },
      });
    }
  }
  console.log('✓ Group stage completed');

  const groups = await prisma.group.findMany({ include: { teams: true } });
  const allStandings = [];
  for (const group of groups) {
    const matches = await prisma.match.findMany({ where: { groupId: group.id, status: 'FINISHED' } });
    const stats = {};
    for (const t of group.teams) {
      stats[t.id] = { id: t.id, name: t.name, code: t.code, group: group.name, played: 0, pts: 0, gd: 0, gf: 0, ga: 0 };
    }
    for (const m of matches) {
      stats[m.teamAId].played++; stats[m.teamBId].played++;
      stats[m.teamAId].gf += m.scoreA; stats[m.teamBId].gf += m.scoreB;
      stats[m.teamAId].ga += m.scoreB; stats[m.teamBId].ga += m.scoreA;
      stats[m.teamAId].gd += m.scoreA - m.scoreB;
      stats[m.teamBId].gd += m.scoreB - m.scoreA;
      if (m.scoreA > m.scoreB) stats[m.teamAId].pts += 3;
      else if (m.scoreB > m.scoreA) stats[m.teamBId].pts += 3;
      else { stats[m.teamAId].pts += 1; stats[m.teamBId].pts += 1; }
    }
    const sorted = sortGroup(Object.values(stats));
    allStandings.push(...sorted);
  }

  const groupWinners = allStandings.filter(s => s.rank === undefined);
  allStandings.forEach(s => {});
  for (const group of groups) {
    const gStandings = allStandings.filter(s => s.group === group.name);
    gStandings.forEach((s, i) => s.rank = i + 1);
  }

  const top2 = allStandings.filter(s => s.rank <= 2);
  const thirdPlaced = allStandings.filter(s => s.rank === 3).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const bestThird = thirdPlaced.slice(0, 4);
  const qualified = [...top2, ...bestThird];

  const r16Pairs = [
    [0, 15], [7, 8], [3, 12], [4, 11],
    [1, 14], [6, 9], [2, 13], [5, 10],
  ];
  const r16Matches = r16Pairs.map(([i, j]) => ({
    teamAId: qualified[i].id, teamBId: qualified[j].id,
    phase: 'KNOCKOUT', round: 'R16', status: 'SCHEDULED',
  }));
  await prisma.match.createMany({ data: r16Matches });
  console.log('✓ Round of 16 created');

  const r16Scores = [[2,1],[3,0],[1,0],[2,2],[1,0],[0,0],[2,1],[3,2]];
  const r16Db = await prisma.match.findMany({ where: { round: 'R16' }, orderBy: { id: 'asc' } });
  const r16Winners = [];
  for (let i = 0; i < r16Db.length; i++) {
    let [sa, sb] = r16Scores[i];
    let wid;
    if (sa === sb) { sa++; wid = r16Db[i].teamAId; }
    else wid = sa > sb ? r16Db[i].teamAId : r16Db[i].teamBId;
    r16Winners.push(wid);
    await prisma.match.update({
      where: { id: r16Db[i].id },
      data: { scoreA: sa, scoreB: sb, winnerId: wid, status: 'FINISHED' },
    });
  }
  console.log('✓ Round of 16 completed');

  const qfPairs = [[r16Winners[0], r16Winners[1]], [r16Winners[2], r16Winners[3]], [r16Winners[4], r16Winners[5]], [r16Winners[6], r16Winners[7]]];
  const qfMatches = qfPairs.map(([a, b]) => ({
    teamAId: a, teamBId: b, phase: 'KNOCKOUT', round: 'QUARTER_FINAL', status: 'SCHEDULED',
  }));
  await prisma.match.createMany({ data: qfMatches });

  const qfScores = [[2,1],[3,0],[1,0],[2,2]];
  const qfDb = await prisma.match.findMany({ where: { round: 'QUARTER_FINAL' }, orderBy: { id: 'asc' } });
  const qfWinners = [];
  for (let i = 0; i < qfDb.length; i++) {
    let [sa, sb] = qfScores[i];
    let wid;
    if (sa === sb) { sb++; wid = qfDb[i].teamBId; }
    else wid = sa > sb ? qfDb[i].teamAId : qfDb[i].teamBId;
    qfWinners.push(wid);
    await prisma.match.update({
      where: { id: qfDb[i].id },
      data: { scoreA: sa, scoreB: sb, winnerId: wid, status: 'FINISHED' },
    });
  }
  console.log('✓ Quarter-finals completed');

  const semiPairs = [[qfWinners[0], qfWinners[1]], [qfWinners[2], qfWinners[3]]];
  const semiMatches = semiPairs.map(([a, b]) => ({
    teamAId: a, teamBId: b, phase: 'KNOCKOUT', round: 'SEMI_FINAL', status: 'SCHEDULED',
  }));
  await prisma.match.createMany({ data: semiMatches });

  const semiScores = [[2,1],[1,0]];
  const semiDb = await prisma.match.findMany({ where: { round: 'SEMI_FINAL' }, orderBy: { id: 'asc' } });
  const semiWinners = [];
  const semiLosers = [];
  for (let i = 0; i < semiDb.length; i++) {
    const [sa, sb] = semiScores[i];
    const wid = sa > sb ? semiDb[i].teamAId : semiDb[i].teamBId;
    const lid = sa > sb ? semiDb[i].teamBId : semiDb[i].teamAId;
    semiWinners.push(wid);
    semiLosers.push(lid);
    await prisma.match.update({
      where: { id: semiDb[i].id },
      data: { scoreA: sa, scoreB: sb, winnerId: wid, status: 'FINISHED' },
    });
  }
  console.log('✓ Semi-finals completed');

  await prisma.match.create({
    data: { teamAId: semiWinners[0], teamBId: semiWinners[1], phase: 'KNOCKOUT', round: 'FINAL', status: 'SCHEDULED' },
  });
  const finalDb = await prisma.match.findFirst({ where: { round: 'FINAL' }, orderBy: { id: 'desc' } });
  const [fsa, fsb] = [3, 1];
  const fwid = fsa > fsb ? finalDb.teamAId : finalDb.teamBId;
  await prisma.match.update({
    where: { id: finalDb.id },
    data: { scoreA: fsa, scoreB: fsb, winnerId: fwid, status: 'FINISHED' },
  });

  await prisma.match.create({
    data: { teamAId: semiLosers[0], teamBId: semiLosers[1], phase: 'KNOCKOUT', round: 'THIRD_PLACE', status: 'SCHEDULED' },
  });
  const thirdDb = await prisma.match.findFirst({ where: { round: 'THIRD_PLACE' }, orderBy: { id: 'desc' } });
  const [tsa, tsb] = [2, 0];
  const twid = tsa > tsb ? thirdDb.teamAId : thirdDb.teamBId;
  await prisma.match.update({
    where: { id: thirdDb.id },
    data: { scoreA: tsa, scoreB: tsb, winnerId: twid, status: 'FINISHED' },
  });
  console.log('✓ Third Place match completed');

  await prisma.tournament.update({ where: { id: tournament.id }, data: { status: 'FINISHED' } });
  const champ = await prisma.team.findUnique({ where: { id: fwid } });
  console.log(`✓ Champion: ${champ.name} 🏆`);
  console.log('\n✅ Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
