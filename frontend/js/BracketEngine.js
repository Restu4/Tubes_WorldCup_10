const BracketEngine = {
  container: null,
  retryCount: 0,
  maxRetries: 3,

  init(containerEl) {
    this.container = containerEl;
    return this;
  },

  async load() {
    if (!this.container) return;
    this._showLoading();

    try {
      const viewW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      BracketUtils.recalculate(viewW);

      const raw = await BracketAPI.fetch();
      if (!raw || raw.length === 0) { this._showEmpty(); return; }

      const dataObj = {};
      for (const r of raw) dataObj[r.key] = r.matches;

      const adapted = BracketAdapter.transform(dataObj);
      if (!adapted.stages.length || !adapted.rounds.length) { this._showEmpty(); return; }

      const tree = BracketLayout.build(adapted);
      if (!tree || !tree.nodes.length) { this._showEmpty(); return; }

      const pMap = BracketUtils.participantsById(adapted.participants);
      BracketRenderer.setParticipants(pMap);

      this.container.style.minHeight = 'auto';
      BracketRenderer.render(tree, this.container, adapted.thirdPlaceMatch || null);

      this.retryCount = 0;

    } catch (err) {
      console.error('BracketEngine error:', err);
      this._showError(err.message || 'Failed to load bracket');
    }
  },

  _showLoading() {
    if (!this.container) return;
    this.container.style.minHeight = '260px';
    this.container.innerHTML =
      `<div class="bracket-loading"><div class="skel-grid">` +
        `<div class="skel-card"></div><div class="skel-card"></div>` +
        `<div class="skel-card"></div><div class="skel-card"></div>` +
      `</div></div>`;
  },

  _showEmpty() {
    if (!this.container) return;
    this.container.style.minHeight = 'auto';
    this.container.innerHTML =
      '<div class="bracket-empty"><span style="font-size:28px">&#127942;</span><span>Knockout bracket not yet generated.</span></div>';
  },

  _showError(msg) {
    if (!this.container) return;
    this.container.style.minHeight = 'auto';
    const canRetry = this.retryCount < this.maxRetries;
    this.container.innerHTML =
      `<div class="bracket-error">` +
        `<span style="font-size:28px">&#9888;</span>` +
        `<span class="err-text">${msg}</span>` +
        (canRetry ? '<button class="btn btn-primary btn-sm" onclick="BracketEngine.retry()">Retry</button>' : '') +
      `</div>`;
  },

  retry() {
    this.retryCount++;
    this.load();
  },

  refresh() {
    this.retryCount = 0;
    this.load();
  },
};
