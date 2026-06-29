const matchRepository = require('../repositories/matchRepository');

async function getBracket() {
  const matches = await matchRepository.findByPhase('KNOCKOUT');
  const groupByRound = { roundOf16: [], quarterFinal: [], semiFinal: [], final: [], thirdPlace: [] };

  for (const match of matches) {
    const data = {
      id: match.id,
      teamA: match.teamA ? { id: match.teamA.id, name: match.teamA.name, code: match.teamA.code } : null,
      teamB: match.teamB ? { id: match.teamB.id, name: match.teamB.name, code: match.teamB.code } : null,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winner: match.winner ? { id: match.winner.id, name: match.winner.name } : null,
      status: match.status,
    };

    if (match.round === 'R16') {
      groupByRound.roundOf16.push(data);
    } else if (match.round === 'QUARTER_FINAL') {
      groupByRound.quarterFinal.push(data);
    } else if (match.round === 'SEMI_FINAL') {
      groupByRound.semiFinal.push(data);
    } else if (match.round === 'FINAL') {
      groupByRound.final.push(data);
    } else if (match.round === 'THIRD_PLACE') {
      groupByRound.thirdPlace.push(data);
    }
  }

  [ 'roundOf16', 'quarterFinal', 'semiFinal', 'final', 'thirdPlace' ].forEach(k => {
    if (groupByRound[k].length === 0) delete groupByRound[k];
  });

  return groupByRound;
}

module.exports = { getBracket };
