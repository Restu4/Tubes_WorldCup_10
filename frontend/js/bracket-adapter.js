const BracketAdapter = {
  transform(apiData) {
    const stages = [];
    const groups = [];
    const rounds = [];
    const matches = [];
    const matchGames = [];
    const participants = [];

    if (!apiData) return { stages, groups, rounds, matches, matchGames, participants };

    const roundOrder = ['roundOf16', 'quarterFinal', 'semiFinal', 'final'];
    const roundLabels = {
      roundOf16: 'Round of 16',
      quarterFinal: 'Quarter-final',
      semiFinal: 'Semi-final',
      final: 'Final',
    };

    const availableRounds = roundOrder.filter(key => apiData[key]?.length > 0);
    if (availableRounds.length === 0) return { stages, groups, rounds, matches, matchGames, participants };

    const seen = new Map();
    let nextPid = 1;

    const getParticipantId = (team) => {
      if (!team || !team.id) return null;
      if (seen.has(team.id)) return seen.get(team.id);
      const pid = nextPid++;
      seen.set(team.id, pid);
      participants.push({ id: pid, tournament_id: 0, name: team.name });
      return pid;
    };

    for (const key of availableRounds) {
      for (const m of apiData[key]) {
        if (m.teamA) getParticipantId(m.teamA);
        if (m.teamB) getParticipantId(m.teamB);
      }
    }

    const stageId = 0;
    const bracketSize = 1 << (availableRounds.length);
    stages.push({
      id: stageId,
      tournament_id: 0,
      name: 'Main Bracket',
      type: 'single_elimination',
      number: 1,
      settings: {
        size: bracketSize,
        seedOrdering: ['natural'],
        grandFinal: 'none',
        matchesChildCount: 0,
      },
    });

    const groupId = 0;
    groups.push({ id: groupId, stage_id: stageId, number: 1 });

    let matchNumber = 1;

    for (let ri = 0; ri < availableRounds.length; ri++) {
      const key = availableRounds[ri];
      const roundLabel = roundLabels[key] || key;
      const roundMatches = apiData[key] || [];

      const roundId = ri;

      rounds.push({
        id: roundId,
        number: ri + 1,
        stage_id: stageId,
        group_id: groupId,
      });

      for (let mi = 0; mi < roundMatches.length; mi++) {
        const m = roundMatches[mi];

        const participant1 = m.teamA ? getParticipantId(m.teamA) : null;
        const participant2 = m.teamB ? getParticipantId(m.teamB) : null;

        let status = 1;
        if (m.status === 'FINISHED') {
          status = 4;
        } else if (m.status === 'SCHEDULED') {
          status = 1;
        }

        const team1Won = m.winner && m.teamA && m.winner.id === m.teamA.id;
        const team2Won = m.winner && m.teamB && m.winner.id === m.teamB.id;

        matches.push({
          id: m.id,
          number: matchNumber++,
          stage_id: stageId,
          group_id: groupId,
          round_id: roundId,
          child_count: 0,
          status: status,
          opponent1: {
            id: participant1,
            position: mi * 2 + 1,
            score: m.scoreA != null ? m.scoreA : undefined,
            result: m.status === 'FINISHED' ? (team1Won ? 'win' : 'loss') : undefined,
          },
          opponent2: {
            id: participant2,
            position: mi * 2 + 2,
            score: m.scoreB != null ? m.scoreB : undefined,
            result: m.status === 'FINISHED' ? (team2Won ? 'win' : 'loss') : undefined,
          },
        });
      }
    }

    let thirdPlaceMatch = null;
    if (apiData.thirdPlace && apiData.thirdPlace.length > 0) {
      const tp = apiData.thirdPlace[0];
      const tp1 = tp.teamA ? getParticipantId(tp.teamA) : null;
      const tp2 = tp.teamB ? getParticipantId(tp.teamB) : null;
      const tp1Won = tp.winner && tp.teamA && tp.winner.id === tp.teamA.id;
      const tp2Won = tp.winner && tp.teamB && tp.winner.id === tp.teamB.id;
      thirdPlaceMatch = {
        teamA: tp.teamA,
        teamB: tp.teamB,
        scoreA: tp.scoreA,
        scoreB: tp.scoreB,
        winner: tp.winner,
        status: tp.status,
        participant1: tp1,
        participant2: tp2,
        p1Won: tp1Won,
        p2Won: tp2Won,
      };
    }

    return { stages, groups, rounds, matches, matchGames, participants, thirdPlaceMatch };
  },
};
