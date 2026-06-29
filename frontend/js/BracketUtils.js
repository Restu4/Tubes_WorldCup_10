const BracketUtils = {
  CARD_W: 150,
  CARD_H: 66,
  GAP_Y: 24,
  GAP_X: 28,
  COL_W: 178,

  recalculate(viewWidth) {
    const padding = 48;
    const available = Math.min(viewWidth, 1920) - padding;
    const maxCols = 7;
    this.COL_W = Math.max(135, Math.min(195, Math.floor(available / maxCols)));
    this.CARD_W = Math.max(110, Math.min(165, Math.floor(this.COL_W * 0.85)));
    this.GAP_X = this.COL_W - this.CARD_W;
    this.CARD_H = Math.max(52, Math.min(70, Math.floor(this.CARD_W * 0.44)));
    this.GAP_Y = Math.max(12, Math.min(26, Math.floor(this.COL_W * 0.1)));
  },

  flagEmoji(code) {
    const map = {
      ARG: '🇦🇷', CAN: '🇨🇦', JPN: '🇯🇵', MAR: '🇲🇦',
      BRA: '🇧🇷', MEX: '🇲🇽', CRO: '🇭🇷', SEN: '🇸🇳',
      FRA: '🇫🇷', POR: '🇵🇹', AUS: '🇦🇺', KOR: '🇰🇷',
      ESP: '🇪🇸', SUI: '🇨🇭', GER: '🇩🇪',       ENG: 'ENG',
      USA: '🇺🇸', NED: '🇳🇱', ITA: '🇮🇹', BEL: '🇧🇪',
      NGA: '🇳🇬', COL: '🇨🇴', URU: '🇺🇾', SRB: '🇷🇸', DEN: '🇩🇰',
    };
    return map[code] || '';
  },

  codeFromName(name) {
    return (name || '').substring(0, 3).toUpperCase();
  },

  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },

  roundsOrder: ['roundOf16', 'quarterFinal', 'semiFinal', 'final'],
  roundLabels: {
    roundOf16: 'Round of 16',
    quarterFinal: 'Quarter-finals',
    semiFinal: 'Semi-finals',
    final: 'Final',
  },

  roundSide(colCount, index, total) {
    const half = Math.ceil(total / 2);
    return index < half ? 'left' : 'right';
  },

  groupMatchesByRound(matches) {
    const byRound = {};
    for (const m of matches) {
      if (!byRound[m.round_id]) byRound[m.round_id] = [];
      byRound[m.round_id].push(m);
    }
    for (const rid in byRound) byRound[rid].sort((a, b) => a.number - b.number);
    return byRound;
  },

  participantsById(participants) {
    const map = {};
    for (const p of participants) map[p.id] = p;
    return map;
  },
};
