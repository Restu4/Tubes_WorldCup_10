function toast(msg, t = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${t}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function badge(s) {
  const labels = {
    FINISHED: 'FT',
    SCHEDULED: 'NS',
    LIVE: 'LIVE',
    PEN: 'PEN',
    ET: 'ET',
  };
  const classes = {
    FINISHED: 'badge-finished',
    SCHEDULED: 'badge-scheduled',
    LIVE: 'badge-live',
    PEN: 'badge-pen',
    ET: 'badge-et',
  };
  const label = labels[s] || s;
  const cls = classes[s] || 'badge-scheduled';
  return `<span class="badge ${cls}">${label}</span>`;
}

function rbadge(r) {
  const m = {
    GROUP: ['Group', 'badge-group'],
    QUARTER_FINAL: ['QF', 'badge-knockout'],
    SEMI_FINAL: ['SF', 'badge-knockout'],
    FINAL: ['Final', 'badge-knockout'],
    R16: ['R16', 'badge-knockout'],
    THIRD_PLACE: ['3rd Place', 'badge-knockout'],
  };
  const [l, c] = m[r] || [r, 'badge-scheduled'];
  return `<span class="badge ${c}">${l}</span>`;
}

// Nav
document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-links a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    document.querySelectorAll('.page-section').forEach(x => x.classList.remove('active'));
    document.getElementById('page-' + a.dataset.page).classList.add('active');
  });
});

// Filters
document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderMatches(b.dataset.filter);
  });
});

// ── Dashboard Stats ──
async function loadStats() {
  const el = document.getElementById('statsGrid');
  try {
    const [teams, groups, matches, status] = await Promise.all([
      api.teams.getAll(), api.groups.getAll(), api.matches.getAll(), api.tournament.getStatus(),
    ]);
    const d = matches.data || [];
    const knockouts = d.filter(m => m.phase === 'KNOCKOUT');
    const finalMatch = knockouts.find(m => m.round === 'FINAL');
    const champion = finalMatch?.winner?.name || '—';
    el.innerHTML = `
      <div class="stat-card"><div class="val">${(teams.data||[]).length}</div><div class="lbl">Teams</div></div>
      <div class="stat-card"><div class="val">${(groups.data||[]).length}</div><div class="lbl">Groups</div></div>
      <div class="stat-card"><div class="val">${d.filter(m => m.status === 'FINISHED').length}/${d.length}</div><div class="lbl">Played</div></div>
      <div class="stat-card"><div class="val" style="font-size:${champion.length > 8 ? '16px' : '22px'}">${champion}</div><div class="lbl">Champion</div></div>
    `;
  } catch { el.innerHTML = '<div class="empty-state">Could not load stats</div>'; }
}

// ── Standings ──
async function loadStandings(target = 'standingsView') {
  const el = document.getElementById(target);
  try {
    const { data } = await api.standings.getAll();
    const keys = Object.keys(data);
    if (!keys.length) { el.innerHTML = '<div class="empty-state">No standings yet</div>'; return; }
    el.innerHTML = `<div class="standings-grid">${keys.map(name => {
      const rows = data[name];
      return `<div class="card sgroup">
        <div class="gh">Group ${name} <span class="gh-sub">Knockout</span></div>
        <table>
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>${rows.map((s, i) => `<tr class="${i < 2 ? 'adv' : ''}">
            <td>${s.rank}</td>
            <td><strong>${s.team.name}</strong></td>
            <td>${s.played}</td><td>${s.win}</td><td>${s.draw}</td><td>${s.lose}</td>
            <td>${s.goalsFor}</td><td>${s.goalsAgainst}</td><td>${s.goalDiff}</td>
            <td><strong class="pts-cell">${s.points}</strong></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
    }).join('')}</div>`;
  } catch { el.innerHTML = '<div class="empty-state">Error loading standings</div>'; }
}

// ── Matches ──
let allMatches = [];

async function loadMatchesData() {
  try {
    const { data } = await api.matches.getAll();
    allMatches = data || [];
    const active = document.querySelector('.filter-btn.active');
    renderMatches(active?.dataset?.filter || 'all');
  } catch { document.getElementById('matchesView').innerHTML = '<div class="empty-state">Error</div>'; }
}

function renderMatches(filter = 'all') {
  const el = document.getElementById('matchesView');
  let list = allMatches;
  if (filter === 'GROUP' || filter === 'KNOCKOUT') list = list.filter(m => m.phase === filter);
  else if (filter === 'FINISHED' || filter === 'SCHEDULED') list = list.filter(m => m.status === filter);

  if (!list.length) { el.innerHTML = '<div class="empty-state">No matches</div>'; return; }
  el.innerHTML = list.map(m => {
    const isFinal = m.round === 'FINAL';
    const isThird = m.round === 'THIRD_PLACE';
    const roundLabel = isFinal ? 'Final' : isThird ? '3rd Place' : (m.group ? 'Group ' + m.group.name : m.round.replace('_', ' '));
    return `<div class="match-card">
      <div class="mtop">${rbadge(m.round)}${badge(m.status)}</div>
      <div class="teams">
        <div class="team-block">
          <span class="team-flag">${getFlag(m.teamA?.code)}</span>
          <div class="tn">${m.teamA?.name || 'TBD'}</div>
        </div>
        <div class="score-block">
          ${m.status === 'FINISHED' ? `<div class="sd">${m.scoreA}–${m.scoreB}</div>` : '<div class="vs">vs</div>'}
        </div>
        <div class="team-block">
          <span class="team-flag">${getFlag(m.teamB?.code)}</span>
          <div class="tn">${m.teamB?.name || 'TBD'}</div>
        </div>
      </div>
      <div class="meta">${roundLabel}${m.winner ? ' · ' + m.winner.name + ' wins' : ''}</div>
    </div>`;
  }).join('');
}

// ── Bracket ──
function loadBracket() {
  Bracket.mount(document.getElementById('bracketView'));
}

// ── Refresh ──
async function refreshAll() {
  await Promise.all([
    loadStats(),
    loadStandings('standingsView'),
    loadStandings('dashStandings'),
    loadMatchesData(),
    loadBracket(),
  ]);
}

document.addEventListener('DOMContentLoaded', refreshAll);
