let authed = false;

function checkAuth() {
  const t = localStorage.getItem('token');
  authed = !!t;
  document.getElementById('adminPanel').style.display = authed ? 'block' : 'none';
  document.getElementById('loginSection').style.display = authed ? 'none' : 'block';
  document.getElementById('logoutBtn').style.display = authed ? 'inline-flex' : 'none';
  if (authed) refreshAll();
}

// Nav toggle
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Sidebar nav
document.querySelectorAll('.admin-sb a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.admin-sb a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(x => x.classList.remove('active'));
    document.getElementById('section-' + a.dataset.section).classList.add('active');
  });
});

// Login
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const { token } = await api.auth.login(document.getElementById('password').value);
    localStorage.setItem('token', token);
    toast('Login successful!');
    checkAuth();
  } catch (err) { toast(err.message, 'error'); }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  checkAuth();
  toast('Logged out');
});

// Add team
document.getElementById('addTeamForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await api.teams.create({
      name: document.getElementById('teamName').value,
      code: document.getElementById('teamCode').value.toUpperCase(),
      group: document.getElementById('teamGroup').value.toUpperCase(),
      flag: document.getElementById('teamFlag').value || undefined,
    });
    toast('Team added!');
    document.getElementById('addTeamForm').reset();
    refreshAll();
  } catch (err) { toast(err.message, 'error'); }
});

// Tournament
document.getElementById('setupBtn').addEventListener('click', async () => {
  try { await api.tournament.setup(); toast('Tournament setup!'); refreshAll(); }
  catch (err) { toast(err.message, 'error'); }
});
document.getElementById('advanceBtn').addEventListener('click', async () => {
  try { await api.tournament.advance(); toast('Advanced to knockout!'); refreshAll(); }
  catch (err) { toast(err.message, 'error'); }
});
document.getElementById('resetBtn').addEventListener('click', async () => {
  if (!confirm('Reset tournament?')) return;
  try { await api.tournament.reset(); toast('Tournament reset'); refreshAll(); }
  catch (err) { toast(err.message, 'error'); }
});

// ── Admin panels ──
async function loadAdminStats() {
  try {
    const [teams, groups, matches] = await Promise.all([
      api.teams.getAll(), api.groups.getAll(), api.matches.getAll(),
    ]);
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card"><div class="val">${(teams.data||[]).length}</div><div class="lbl">Teams</div></div>
      <div class="stat-card"><div class="val">${(groups.data||[]).length}</div><div class="lbl">Groups</div></div>
      <div class="stat-card"><div class="val">${(matches.data||[]).length}</div><div class="lbl">Matches</div></div>
      <div class="stat-card"><div class="val">${(matches.data||[]).filter(m => m.status === 'FINISHED').length}</div><div class="lbl">Finished</div></div>`;
  } catch {}
}

async function loadTeamsTable() {
  const el = document.getElementById('teamsTable');
  try {
    const { data } = await api.teams.getAll();
    if (!data?.length) { el.innerHTML = '<div class="empty-state">No teams</div>'; return; }
    el.innerHTML = `<table><thead><tr><th>Name</th><th>Code</th><th>Group</th><th></th></tr></thead>
      <tbody>${data.map(t => `<tr><td><strong>${t.name}</strong></td><td>${t.code}</td><td>${t.group?.name || '-'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="delTeam(${t.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<div class="empty-state">Error</div>'; }
}

window.delTeam = async id => {
  if (!confirm('Delete?')) return;
  try { await api.teams.remove(id); toast('Deleted'); refreshAll(); }
  catch (err) { toast(err.message, 'error'); }
};

async function loadEditableMatches() {
  const el = document.getElementById('matchesTable');
  try {
    const { data } = await api.matches.getAll();
    if (!data?.length) { el.innerHTML = '<div class="empty-state">No matches. Setup tournament first.</div>'; return; }
    el.innerHTML = `<table><thead><tr><th>Group</th><th>Team A</th><th>Score</th><th>Team B</th><th>Status</th><th></th></tr></thead>
      <tbody>${data.map(m => `<tr>
        <td>${m.group?.name || '-'}</td><td>${m.teamA.name}</td>
        <td><strong>${m.status === 'FINISHED' ? m.scoreA + '–' + m.scoreB : '-'}</strong></td>
        <td>${m.teamB.name}</td>
        <td>${badge(m.status)}</td>
        <td><button class="btn btn-primary btn-sm" onclick="showScore(${m.id},'${m.teamA.name}','${m.teamB.name}',${m.scoreA ?? ''},${m.scoreB ?? ''})">${m.status === 'FINISHED' ? 'Edit' : 'Score'}</button></td>
      </tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<div class="empty-state">Error</div>'; }
}

window.showScore = (id, a, b, sa, sb) => {
  document.getElementById('matchId').value = id;
  document.getElementById('scoreATeam').textContent = a;
  document.getElementById('scoreBTeam').textContent = b;
  document.getElementById('scoreA').value = sa !== '' && sa != null ? sa : '';
  document.getElementById('scoreB').value = sb !== '' && sb != null ? sb : '';
  document.getElementById('scoreModal').classList.add('show');
};

document.getElementById('scoreForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await api.matches.updateResult(
      document.getElementById('matchId').value,
      parseInt(document.getElementById('scoreA').value),
      parseInt(document.getElementById('scoreB').value),
    );
    toast('Score updated!');
    document.getElementById('scoreModal').classList.remove('show');
    refreshAll();
  } catch (err) { toast(err.message, 'error'); }
});

document.querySelector('.cl').addEventListener('click', () => document.getElementById('scoreModal').classList.remove('show'));
window.addEventListener('click', e => { if (e.target === document.getElementById('scoreModal')) document.getElementById('scoreModal').classList.remove('show'); });

async function loadTournamentInfo() {
  try {
    const { data } = await api.tournament.getStatus();
    document.getElementById('tournamentInfo').innerHTML = `Status: <strong style="color:var(--blue)">${data.status.replace(/_/g, ' ')}</strong>`;
  } catch {}
}

async function refreshAll() {
  if (!authed) return;
  await Promise.all([
    loadAdminStats(), loadTeamsTable(), loadEditableMatches(), loadTournamentInfo(),
    loadTournamentStatus(), loadStandings('adminStandings'), loadMatchesData(), loadBracket(),
  ]);
}

document.addEventListener('DOMContentLoaded', checkAuth);
