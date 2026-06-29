/* ── BracketConnector ──
 * Renders connector lines between parent-child tree edges.
 */

const BracketConnector = {
  /* Master entry: render all connectors into a container */
  render(connectors, container) {
    const linesEl = container.querySelector('.bm-lines-tree');
    if (!linesEl) return;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < connectors.length; i++) {
      const conn = connectors[i];
      this._drawOne(conn, linesEl, frag, i);
    }

    linesEl.appendChild(frag);
  },

  /* Draw a single connector (child → parent) */
  _drawOne(conn, linesEl, frag, index) {
    const { x1, y1, x2, y2 } = conn;
    const dx = Math.abs(x2 - x1);
    const dy = y2 - y1;

    if (Math.abs(dy) < 4) {
      const el = BracketUtils.el('div', 'bm-line bm-line-h');
      el.style.left = Math.min(x1, x2) + 'px';
      el.style.top = (y1 - 1) + 'px';
      el.style.width = dx + 'px';
      el.style.animationDelay = (0.3 + index * 0.03) + 's';
      frag.appendChild(el);
      return;
    }

    /* L-shaped connector: horizontal → vertical → horizontal
     * Handles both left→right and right→left flow.
     *
     *  Left side (child → parent, left to right):
     *    child ──────┐
     *                │
     *                ├────── parent
     *                │
     *    child ──────┘
     *
     *  Right side (child → parent, right to left):
     *                ┌────── child
     *                │
     *    parent ─────┤
     *                │
     *                └────── child
     */
    const midX = Math.min(x1, x2) + dx * 0.55;

    const h1Left = Math.min(x1, midX);
    const h1Width = Math.abs(midX - x1);
    const h1 = BracketUtils.el('div', 'bm-line bm-line-h');
    h1.style.left = h1Left + 'px';
    h1.style.top = (y1 - 1) + 'px';
    h1.style.width = h1Width + 'px';
    h1.style.animationDelay = (0.3 + index * 0.03) + 's';
    frag.appendChild(h1);

    const v = BracketUtils.el('div', 'bm-line bm-line-v');
    v.style.left = (midX - 1) + 'px';
    v.style.top = (dy > 0 ? y1 : y2) + 'px';
    v.style.height = Math.abs(dy) + 'px';
    v.style.animationDelay = (0.35 + index * 0.03) + 's';
    frag.appendChild(v);

    const h2Left = Math.min(midX, x2);
    const h2Width = Math.abs(x2 - midX);
    const h2 = BracketUtils.el('div', 'bm-line bm-line-h');
    h2.style.left = h2Left + 'px';
    h2.style.top = (y2 - 1) + 'px';
    h2.style.width = h2Width + 'px';
    h2.style.animationDelay = (0.4 + index * 0.03) + 's';
    frag.appendChild(h2);
  },
};
