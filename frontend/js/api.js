const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
}

const api = {
  auth: {
    login: (password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  },
  teams: {
    getAll: (params) => request(`/teams${params ? '?' + new URLSearchParams(params) : ''}`),
    getById: (id) => request(`/teams/${id}`),
    create: (data) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
  },
  tournament: {
    getStatus: () => request('/tournament/status'),
    setup: () => request('/tournament/setup', { method: 'POST' }),
    advance: () => request('/tournament/advance', { method: 'POST' }),
    reset: () => request('/tournament/reset', { method: 'POST' }),
  },
  matches: {
    getAll: (params) => request(`/matches${params ? '?' + new URLSearchParams(params) : ''}`),
    getByGroup: (groupId) => request(`/matches/group/${groupId}`),
    updateResult: (id, scoreA, scoreB) => request(`/matches/${id}/result`, { method: 'PUT', body: JSON.stringify({ scoreA, scoreB }) }),
  },
  standings: {
    getAll: () => request('/standings'),
    getByGroup: (groupId) => request(`/standings/group/${groupId}`),
  },
  groups: {
    getAll: () => request('/groups'),
    getStandings: (id) => request(`/groups/${id}/standings`),
  },
  bracket: {
    get: () => request('/bracket'),
  },
};
