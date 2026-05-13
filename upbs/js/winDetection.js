// Win-detection logic — payline + scatter evaluation. Pure functions over
// (grid, bet); identical contract to the Gold Rush template.

function evaluatePayline(grid, payline) {
  const first = grid[0][payline[0]];
  const isWild = (id) => id === 'wild';

  let anchor = first;
  for (let i = 0; i < 5; i++) {
    const sym = grid[i][payline[i]];
    if (!isWild(sym)) { anchor = sym; break; }
  }

  let count = 0;
  for (let i = 0; i < 5; i++) {
    const sym = grid[i][payline[i]];
    if (sym === anchor || isWild(sym)) {
      count++;
    } else {
      break;
    }
  }

  if (count >= 3) {
    const mult = (PAYTABLE[anchor] || {})[count] || 0;
    return { symbol: anchor, count, multiplier: mult };
  }
  return null;
}

function evaluateScatter(grid) {
  let count = 0;
  for (let r = 0; r < 5; r++) {
    for (let row = 0; row < 3; row++) {
      if (grid[r][row] === 'scatter') count++;
    }
  }
  if (count >= FREE_SPINS_TRIGGER_COUNT) {
    const mult = (PAYTABLE['scatter'] || {})[Math.min(count, 5)] || 0;
    return { symbol: 'scatter', count, multiplier: mult, triggersBonus: count >= FREE_SPINS_TRIGGER_COUNT };
  }
  return null;
}

function countScatters(grid) {
  let n = 0;
  for (let r = 0; r < 5; r++) for (let row = 0; row < 3; row++) if (grid[r][row] === 'scatter') n++;
  return n;
}

function evaluateWins(grid, bet) {
  const wins = [];

  PAYLINES.forEach((payline, lineIndex) => {
    const result = evaluatePayline(grid, payline);
    if (result && result.multiplier > 0) {
      wins.push({
        lineIndex,
        payline,
        symbol: result.symbol,
        count: result.count,
        multiplier: result.multiplier,
        payout: result.multiplier * bet,
      });
    }
  });

  const scatter = evaluateScatter(grid);
  if (scatter && scatter.multiplier > 0) {
    wins.push({
      lineIndex: -1,
      payline: null,
      symbol: 'scatter',
      count: scatter.count,
      multiplier: scatter.multiplier,
      payout: scatter.multiplier * bet,
    });
  }

  return wins;
}

function totalPayout(wins) {
  return wins.reduce((sum, w) => sum + w.payout, 0);
}
