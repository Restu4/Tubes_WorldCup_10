const BracketRenderer = {
  _pMap: null,
  _codesMap: null,

  setParticipants(map) {
    this._pMap = map;
  },

  render(tree, container, thirdPlaceMatch) {
    const CARD_W = BracketUtils.CARD_W;
    const CARD_H = BracketUtils.CARD_H;
    const COL_W = BracketUtils.COL_W;

    const frag = document.createDocumentFragment();

    const header = BracketUtils.el('div', 'bracket-header',
      `<div class="bh-title">World Cup 2026 Knockout Stage</div>` +
      `<div class="bh-sub">Single Elimination</div>`
    );
    frag.appendChild(header);

    const canvas = BracketUtils.el('div', 'bracket-canvas');
    canvas.id = 'bracketCanvas';
    canvas.style.width = tree.layout.totalWidth + 'px';
    canvas.style.height = tree.layout.totalHeight + 'px';

    const linesLayer = BracketUtils.el('div', 'bm-lines-tree');
    linesLayer.id = 'bmLinesTree';
    canvas.appendChild(linesLayer);

    const colLabels = {};
    for (const round of tree.rounds) {
      for (const node of round.nodes) {
        if (!colLabels[node.column]) {
          colLabels[node.column] = round.label;
        }
      }
    }
    const columns = Object.keys(colLabels).map(Number).sort((a, b) => a - b);
    for (const col of columns) {
      const title = BracketUtils.el('div', 'bm-col-title', colLabels[col]);
      title.style.left = ((col - 1) * COL_W + COL_W / 2) + 'px';
      title.style.top = '4px';
      canvas.appendChild(title);
    }

    for (let i = 0; i < tree.nodes.length; i++) {
      const node = tree.nodes[i];
      const card = this._buildCard(node);
      const cx = node.x - CARD_W / 2;
      const cy = node.y - CARD_H / 2;
      card.style.left = cx + 'px';
      card.style.top = cy + 'px';
      card.style.animationDelay = (i * 0.04) + 's';
      node.cardEl = card;
      canvas.appendChild(card);
    }

    frag.appendChild(canvas);

    this._appendExtras(frag, tree, thirdPlaceMatch);

    container.innerHTML = '';
    container.appendChild(frag);

    requestAnimationFrame(() => {
      BracketConnector.render(tree.connectors, container);
    });
  },

  _buildCard(node) {
    const match = node.match;
    const card = BracketUtils.el('div', 'bm-card ' + (match.status >= 4 ? 'finished' : ''));

    const p1 = match.opponent1;
    const p2 = match.opponent2;

    const getName = (opp) => {
      if (!opp || !opp.id) return 'TBD';
      return (this._pMap && this._pMap[opp.id] ? this._pMap[opp.id].name : 'Team');
    };

    const name1 = getName(p1);
    const name2 = getName(p2);
    const code1 = BracketUtils.codeFromName(name1);
    const code2 = BracketUtils.codeFromName(name2);
    const score1 = p1 && p1.score != null ? p1.score : null;
    const score2 = p2 && p2.score != null ? p2.score : null;
    const t1w = p1 && p1.result === 'win';
    const t2w = p2 && p2.result === 'win';
    const sched = match.status <= 1;

    card.innerHTML =
      `<div class="bm-row ${t1w ? 'win' : ''}">` +
        `<span class="bm-code">${code1}</span>` +
        `<span class="bm-name">${name1}</span>` +
        `<span class="bm-score ${t1w ? 'win' : ''}">${sched ? '' : (score1 != null ? score1 : '-')}</span>` +
      `</div>` +
      `<div class="bm-row ${t2w ? 'win' : ''}">` +
        `<span class="bm-code">${code2}</span>` +
        `<span class="bm-name">${name2}</span>` +
        `<span class="bm-score ${t2w ? 'win' : ''}">${sched ? '' : (score2 != null ? score2 : '-')}</span>` +
      `</div>` +
      `<div class="bm-meta">${match.status >= 4 ? 'FT' : sched ? 'SCHEDULED' : 'LIVE'}</div>`;

    return card;
  },

  _appendExtras(frag, tree, thirdPlaceMatch) {
    const root = tree.root;
    if (!root || root.match.status < 4) return;

    const match = root.match;
    const p1 = match.opponent1;
    const p2 = match.opponent2;
    const winner = p1 && p1.result === 'win' ? p1 : p2 && p2.result === 'win' ? p2 : null;

    const aftermath = BracketUtils.el('div', 'bm-aftermath');
    aftermath.style.cssText = 'width:' + tree.layout.totalWidth + 'px;margin:16px auto 32px;display:flex;justify-content:center;align-items:center;gap:20px;';

    if (winner) {
      const winnerName = winner.id && this._pMap ? (this._pMap[winner.id] || { name: 'Team' }).name : 'Team';
      const winnerCode = BracketUtils.codeFromName(winnerName);
      const champ = BracketUtils.el('div', 'bm-champion',
        `<div class="champ-cup">&#127942;</div>` +
        `<div class="champ-name">${winnerCode} ${winnerName}</div>` +
        `<div class="champ-score">${winner.score != null ? winner.score : '-'} pts</div>`
      );
      champ.style.cssText = 'position:static;top:auto;left:auto;';
      aftermath.appendChild(champ);
    }

    if (thirdPlaceMatch && thirdPlaceMatch.status === 'FINISHED') {
      const tA = thirdPlaceMatch.teamA;
      const tB = thirdPlaceMatch.teamB;
      const tAWin = thirdPlaceMatch.p1Won;
      const tBWin = thirdPlaceMatch.p2Won;
      const scoreA = thirdPlaceMatch.scoreA;
      const scoreB = thirdPlaceMatch.scoreB;
      const codeA = tA ? BracketUtils.codeFromName(tA.name) : 'TBD';
      const codeB = tB ? BracketUtils.codeFromName(tB.name) : 'TBD';
      const third = BracketUtils.el('div', 'bm-third-card',
        `<div class="tp-title">Third Place</div>` +
        `<div class="tp-teams">` +
          `<span class="tp-team ${tAWin ? 'win' : ''}">${codeA} ${tA ? tA.name : 'TBD'} ${scoreA != null ? scoreA : '-'}</span>` +
          `<span class="tp-vs">vs</span>` +
          `<span class="tp-team ${tBWin ? 'win' : ''}">${codeB} ${tB ? tB.name : 'TBD'} ${scoreB != null ? scoreB : '-'}</span>` +
        `</div>`
      );
      third.style.cssText = 'position:static;top:auto;left:auto;';
      aftermath.appendChild(third);
    }

    frag.appendChild(aftermath);
  },
};
