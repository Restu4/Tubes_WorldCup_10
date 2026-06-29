/* ── Bracket Entry Point ──
 * Thin wrapper around BracketEngine.
 */

const Bracket = {
  mount(el) {
    BracketEngine.init(el).load();
  },
  refresh() {
    BracketEngine.refresh();
  },
};
