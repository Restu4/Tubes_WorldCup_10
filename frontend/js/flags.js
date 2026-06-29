const Flags = {
  emoji(code) {
    const map = {
      ARG: '🇦🇷', CAN: '🇨🇦', JPN: '🇯🇵', MAR: '🇲🇦',
      BRA: '🇧🇷', MEX: '🇲🇽', CRO: '🇭🇷', SEN: '🇸🇳',
      FRA: '🇫🇷', POR: '🇵🇹', AUS: '🇦🇺', KOR: '🇰🇷',
      ESP: '🇪🇸', SUI: '🇨🇭', GER: '🇩🇪',       ENG: 'ENG',
      USA: '🇺🇸', NED: '🇳🇱', ITA: '🇮🇹', BEL: '🇧🇪',
      NGA: '🇳🇬', COL: '🇨🇴', URU: '🇺🇾', SRB: '🇷🇸', DEN: '🇩🇰',
    };
    return map[code] || '⚽';
  },
};

function getFlag(code) {
  return Flags.emoji(code);
}
