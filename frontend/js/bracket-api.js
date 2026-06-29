/* ── Bracket API ── */

const BracketAPI = {
  async fetch() {
    const url = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api/bracket'
      : '/api/bracket';
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to load bracket');
    return this.transform(json.data);
  },

  transform(data) {
    if (!data) return [];
    const rounds = [];

    const labels = {
      quarterFinal: 'Quarter-final',
      semiFinal: 'Semi-final',
      final: 'Final',
      roundOf16: 'Round of 16',
      thirdPlace: 'Third Place',
    };

    const order = ['roundOf16', 'quarterFinal', 'semiFinal', 'final', 'thirdPlace'];

    for (const key of order) {
      const matches = data[key];
      if (matches && matches.length > 0) {
        rounds.push({
          name: labels[key] || key,
          key: key,
          matches: matches,
        });
      }
    }

    return rounds;
  },
};
