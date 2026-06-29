/* ── BracketLayout ──
 * Builds tournament tree from rounds/matches.
 * Computes node positions bottom-up per side (left/right/center).
 */

const BracketLayout = {
  build(adapted) {
    const { rounds, matches, participants } = adapted;
    if (!rounds.length) return null;

    const byRound = BracketUtils.groupMatchesByRound(matches);
    const pMap = BracketUtils.participantsById(participants);
    const CARD_H = BracketUtils.CARD_H;
    const GAP_Y = BracketUtils.GAP_Y;
    const COL_W = BracketUtils.COL_W;
    const CARD_W = BracketUtils.CARD_W;
    const startY = BracketUtils.CARD_H + 20;

    /* ── 1. Create node objects ── */
    const allNodes = [];
    const nodesByRound = {};

    for (const rid in byRound) {
      const roundId = parseInt(rid);
      const nodes = byRound[rid].map((m, idx) => ({
        id: m.id,
        match: m,
        roundIndex: roundId,
        matchIndex: idx,
        leftChild: null,
        rightChild: null,
        parent: null,
        x: 0, y: 0,
        side: 'center',
        column: 4,
      }));
      nodesByRound[roundId] = nodes;
      allNodes.push(...nodes);
    }

    const roundIndices = Object.keys(nodesByRound).map(Number).sort((a, b) => a - b);
    if (roundIndices.length === 0) return null;

    /* ── 2. Split first round into left/right halves ── */
    const firstRound = roundIndices[0];
    const firstNodes = nodesByRound[firstRound];
    const halfLen = Math.ceil(firstNodes.length / 2);
    const leftGroup = firstNodes.slice(0, halfLen);
    const rightGroup = firstNodes.slice(halfLen);

    /* ── 3. Assign columns and sides ── */
    const totalRounds = roundIndices.length;

    /* First round */
    leftGroup.forEach(n => { n.column = Math.max(1, 3 - (totalRounds - 2)); n.side = 'left'; });
    rightGroup.forEach(n => { n.column = Math.min(7, 5 + (totalRounds - 2)); n.side = 'right'; });

    /* Middle rounds: parent column = centered between children */
    for (let i = 1; i < roundIndices.length; i++) {
      const ri = roundIndices[i];
      const isLast = i === roundIndices.length - 1;
      const nodes = nodesByRound[ri];
      const children = nodesByRound[roundIndices[i - 1]];

      if (isLast) {
        nodes.forEach(n => { n.column = 4; n.side = 'center'; });
      } else {
        /* Assign columns based on children's sides */
        const leftChildren = children.filter(c => c.side === 'left');
        const rightChildren = children.filter(c => c.side === 'right');
        const leftParentCount = Math.ceil(nodes.length / 2);
        const rightParentCount = nodes.length - leftParentCount;

        nodes.forEach((n, idx) => {
          if (idx < leftParentCount) {
            n.side = 'left';
            n.column = Math.min(3, Math.max(2, (leftChildren[0]?.column || 2) + 1));
          } else {
            n.side = 'right';
            n.column = Math.max(5, Math.min(6, (rightChildren[0]?.column || 6) - 1));
          }
        });
      }
    }

    /* ── 4. Wire parent-child within each side ── */
    for (let i = 1; i < roundIndices.length; i++) {
      const parents = nodesByRound[roundIndices[i]];
      const children = nodesByRound[roundIndices[i - 1]];

      const leftParents = parents.filter(n => n.side === 'left' || n.side === 'center');
      const rightParents = parents.filter(n => n.side === 'right' || n.side === 'center');
      const leftChildren = children.filter(n => n.side === 'left');
      const rightChildren = children.filter(n => n.side === 'right');

      /* Wire left side */
      if (leftChildren.length > 0 && leftParents.length > 0) {
        const perParent = Math.ceil(leftChildren.length / leftParents.length);
        leftChildren.forEach((child, idx) => {
          const pIdx = Math.min(Math.floor(idx / perParent), leftParents.length - 1);
          const p = leftParents[pIdx];
          if (!p.leftChild) p.leftChild = child;
          else if (!p.rightChild) p.rightChild = child;
          child.parent = p;
        });
      }

      /* Wire right side */
      if (rightChildren.length > 0 && rightParents.length > 0) {
        const perParent = Math.ceil(rightChildren.length / rightParents.length);
        rightChildren.forEach((child, idx) => {
          const pIdx = Math.min(Math.floor(idx / perParent), rightParents.length - 1);
          const p = rightParents[pIdx];
          if (!p.leftChild) p.leftChild = child;
          else if (!p.rightChild) p.rightChild = child;
          child.parent = p;
        });
      }

      /* Wire center (Final) from previous round's sides */
      const prevNodes = nodesByRound[roundIndices[i - 1]];
      const prevLeft = prevNodes.filter(n => n.side === 'left');
      const prevRight = prevNodes.filter(n => n.side === 'right');
      const centerParents = parents.filter(n => n.side === 'center');
      if (centerParents.length > 0) {
        const lastLeft = prevLeft[prevLeft.length - 1];
        const firstRight = prevRight[0];
        if (lastLeft) { centerParents[0].leftChild = lastLeft; lastLeft.parent = centerParents[0]; }
        if (firstRight) { centerParents[0].rightChild = firstRight; firstRight.parent = centerParents[0]; }
      }
    }

    /* ── 5. Compute Y positions per side bottom-up ── */

    /* First round: evenly spaced per side */
    const assignEvenY = (nodes) => {
      nodes.forEach((n, i) => {
        n.y = startY + i * (CARD_H + GAP_Y) + CARD_H / 2;
      });
    };
    assignEvenY(leftGroup);
    assignEvenY(rightGroup);

    /* Subsequent rounds: parent Y = average of children within side */
    for (let i = 1; i < roundIndices.length; i++) {
      const parents = nodesByRound[roundIndices[i]];
      for (const p of parents) {
        const children = [];
        if (p.leftChild) children.push(p.leftChild);
        if (p.rightChild) children.push(p.rightChild);
        if (children.length > 0) {
          p.y = children.reduce((s, c) => s + c.y, 0) / children.length;
        } else {
          p.y = startY + parents.indexOf(p) * (CARD_H + GAP_Y) + CARD_H / 2;
        }
      }
    }

    /* ── 6. Compute X positions ── */
    for (const node of allNodes) {
      const col = node.column;
      if (col <= 3) {
        /* Left side: right-align within column */
        node.x = (col - 1) * COL_W + (COL_W - CARD_W) + CARD_W / 2;
      } else if (col >= 5) {
        /* Right side: left-align within column */
        node.x = (col - 1) * COL_W + CARD_W / 2;
      } else {
        /* Center */
        node.x = (col - 1) * COL_W + COL_W / 2;
      }
    }

    /* ── 7. Compact columns — remove unused left/right gaps ── */
    const usedCols = [...new Set(allNodes.map(n => n.column))].sort((a, b) => a - b);
    const minCol = usedCols[0];
    if (minCol > 1) {
      const shift = (minCol - 1) * COL_W;
      for (const node of allNodes) {
        node.column -= (minCol - 1);
        node.x -= shift;
      }
    }
    const totalColumns = usedCols.length;

    /* ── 8. Compute connector paths ── */
    const connectors = [];
    for (const node of allNodes) {
      if (node.leftChild) connectors.push(this._connectorPath(node.leftChild, node));
      if (node.rightChild) connectors.push(this._connectorPath(node.rightChild, node));
    }

    const root = allNodes.find(n => !n.parent);

    /* Build round labels from outside-in */
    const roundTypes = ['roundOf16', 'quarterFinal', 'semiFinal', 'final'];
    const labelOffset = roundTypes.length - roundIndices.length;

    return {
      rounds: roundIndices.map((ri, idx) => ({
        index: ri,
        label: BracketUtils.roundLabels[
          roundTypes[Math.max(0, labelOffset + idx)] || 'final'
        ] || `Round ${ri + 1}`,
        nodes: nodesByRound[ri],
      })),
      nodes: allNodes,
      root,
      connectors,
      layout: {
        columns: this._columnsByCol(allNodes),
        totalWidth: totalColumns * COL_W,
        totalHeight: Math.max(
          ...allNodes.map(n => n.y + CARD_H / 2 + 40),
          300
        ),
      },
    };
  },

  _connectorPath(child, parent) {
    const CARD_W = BracketUtils.CARD_W;
    const half = CARD_W / 2;
    return {
      from: child,
      to: parent,
      x1: child.column <= 3 ? child.x + half : child.x - half,
      y1: child.y,
      x2: child.column <= 3 ? parent.x - half : parent.x + half,
      y2: parent.y,
    };
  },

  _columnsByCol(nodes) {
    const cols = {};
    for (const n of nodes) {
      if (!cols[n.column]) cols[n.column] = [];
      cols[n.column].push(n);
    }
    return cols;
  },
};
