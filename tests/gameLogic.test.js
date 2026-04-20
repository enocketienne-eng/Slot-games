// Node.js test suite for core game logic (no DOM required)
// Run: node tests/gameLogic.test.js

// Inline dependencies (symbols, rng, winDetection)
// ---- symbols ----
const SYMBOLS = {
  WILD:       { id: 'wild',       label: 'Wild',       color: '#FFD700', emoji: '⭐', weight: 2 },
  SCATTER:    { id: 'scatter',    label: 'Scatter',    color: '#FF6B35', emoji: '💥', weight: 2 },
  GOLD_BAR:   { id: 'gold_bar',   label: 'Gold Bar',   color: '#FFD700', emoji: '🥇', weight: 4 },
  GOLD_NUGGET:{ id: 'gold_nugget',label: 'Nugget',     color: '#FFC200', emoji: '💛', weight: 6 },
  PICKAXE:    { id: 'pickaxe',    label: 'Pickaxe',    color: '#8B7355', emoji: '⛏️', weight: 8 },
  DYNAMITE:   { id: 'dynamite',   label: 'Dynamite',   color: '#CC2200', emoji: '🧨', weight: 8 },
  HORSESHOE:  { id: 'horseshoe',  label: 'Horseshoe',  color: '#C0C0C0', emoji: '🧲', weight: 10 },
  COWBOY_HAT: { id: 'cowboy_hat', label: 'Cowboy Hat', color: '#8B4513', emoji: '🤠', weight: 10 },
};

const PAYTABLE = {
  wild:        { 3: 50,  4: 200, 5: 1000 },
  scatter:     { 3: 5,   4: 20,  5: 100  },
  gold_bar:    { 3: 40,  4: 150, 5: 500  },
  gold_nugget: { 3: 25,  4: 100, 5: 250  },
  pickaxe:     { 3: 15,  4: 50,  5: 150  },
  dynamite:    { 3: 15,  4: 50,  5: 150  },
  horseshoe:   { 3: 5,   4: 20,  5: 75   },
  cowboy_hat:  { 3: 5,   4: 20,  5: 75   },
};

const PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [0, 1, 1, 1, 2],
  [2, 1, 1, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 0, 2, 0, 0],
];

// ---- winDetection ----
function evaluatePayline(grid, payline) {
  const isWild = (id) => id === 'wild';
  let anchor = grid[0][payline[0]];
  for (let i = 0; i < 5; i++) {
    const sym = grid[i][payline[i]];
    if (!isWild(sym)) { anchor = sym; break; }
  }
  let count = 0;
  for (let i = 0; i < 5; i++) {
    const sym = grid[i][payline[i]];
    if (sym === anchor || isWild(sym)) count++;
    else break;
  }
  if (count >= 3) {
    const mult = (PAYTABLE[anchor] || {})[count] || 0;
    return { symbol: anchor, count, multiplier: mult };
  }
  return null;
}

function evaluateScatter(grid) {
  let count = 0;
  for (let r = 0; r < 5; r++) for (let row = 0; row < 3; row++) if (grid[r][row] === 'scatter') count++;
  if (count >= 3) return { symbol: 'scatter', count, multiplier: (PAYTABLE['scatter'] || {})[count] || 0 };
  return null;
}

function evaluateWins(grid, bet) {
  const wins = [];
  PAYLINES.forEach((payline, lineIndex) => {
    const result = evaluatePayline(grid, payline);
    if (result && result.multiplier > 0) {
      wins.push({ lineIndex, payline, symbol: result.symbol, count: result.count, multiplier: result.multiplier, payout: result.multiplier * bet });
    }
  });
  const scatter = evaluateScatter(grid);
  if (scatter && scatter.multiplier > 0) {
    wins.push({ lineIndex: -1, payline: null, symbol: 'scatter', count: scatter.count, multiplier: scatter.multiplier, payout: scatter.multiplier * bet });
  }
  return wins;
}

function totalPayout(wins) {
  return wins.reduce((sum, w) => sum + w.payout, 0);
}

// ---- Test runner ----
let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || ''}: expected ${b}, got ${a}`);
}

// ---- Helper: build empty 5x3 grid ----
function emptyGrid(fill = 'cowboy_hat') {
  return Array.from({ length: 5 }, () => Array(3).fill(fill));
}

// ===== TESTS =====

console.log('\nSymbol Pool Tests');
test('symbol pool has all symbols represented', () => {
  const pool = [];
  for (const sym of Object.values(SYMBOLS)) for (let i = 0; i < sym.weight; i++) pool.push(sym.id);
  const ids = new Set(pool);
  assert(ids.has('wild'), 'wild in pool');
  assert(ids.has('scatter'), 'scatter in pool');
  assert(ids.has('gold_bar'), 'gold_bar in pool');
  assert(ids.has('cowboy_hat'), 'cowboy_hat in pool');
});

test('symbol weights sum to expected total', () => {
  let sum = 0;
  for (const sym of Object.values(SYMBOLS)) sum += sym.weight;
  assertEqual(sum, 50, 'Total weight');
});

console.log('\nPayline Evaluation Tests');
test('3 matching symbols on middle row pays correct multiplier', () => {
  const grid = emptyGrid('horseshoe');
  // middle row payline = [1,1,1,1,1]; only first 3 match then differ
  grid[3][1] = 'cowboy_hat';
  grid[4][1] = 'cowboy_hat';
  const wins = evaluateWins(grid, 1);
  const midWin = wins.find(w => w.payline && w.payline.every(r => r === 1));
  assert(midWin, 'Should have a middle row win');
  assertEqual(midWin.count, 3, 'Count');
  assertEqual(midWin.payout, PAYTABLE['horseshoe'][3], 'Payout');
});

test('5 matching symbols on middle row pays 5-of-a-kind multiplier', () => {
  const grid = emptyGrid('gold_bar');
  const wins = evaluateWins(grid, 2);
  const midWin = wins.find(w => w.symbol === 'gold_bar' && w.count === 5 && w.payline && w.payline.every(r => r === 1));
  assert(midWin, 'Should find 5-of-a-kind win');
  assertEqual(midWin.payout, PAYTABLE['gold_bar'][5] * 2, 'Payout with bet=2');
});

test('wild substitutes for any symbol on payline', () => {
  const grid = emptyGrid('pickaxe');
  // Middle row: wild, pickaxe, pickaxe, pickaxe, pickaxe → 5-of-a-kind pickaxe
  grid[0][1] = 'wild';
  const wins = evaluateWins(grid, 1);
  const pickWin = wins.find(w => w.symbol === 'pickaxe' && w.payline && w.payline.every(r => r === 1));
  assert(pickWin, 'Wild should substitute for pickaxe');
  assertEqual(pickWin.count, 5, 'Should count as 5');
});

test('all-wild payline pays wild rate', () => {
  const grid = emptyGrid('wild');
  const wins = evaluateWins(grid, 1);
  // Middle row all wilds → wild anchor
  const wildWin = wins.find(w => w.symbol === 'wild' && w.count === 5 && w.payline && w.payline.every(r => r === 1));
  assert(wildWin, 'All-wild should produce wild win');
  assertEqual(wildWin.payout, PAYTABLE['wild'][5], 'Wild 5-of-a-kind payout');
});

test('no win on mixed symbols (less than 3 in sequence)', () => {
  const grid = emptyGrid('horseshoe');
  grid[0][1] = 'gold_bar';
  grid[1][1] = 'gold_bar';
  grid[2][1] = 'horseshoe'; // break
  const wins = evaluateWins(grid, 1);
  const midLine = wins.find(w => w.payline && w.payline.every(r => r === 1));
  assert(!midLine, 'No win with sequence broken at 2');
});

console.log('\nScatter Tests');
test('3 scatter symbols anywhere trigger scatter win', () => {
  const grid = emptyGrid('horseshoe');
  grid[0][0] = 'scatter';
  grid[2][2] = 'scatter';
  grid[4][1] = 'scatter';
  const wins = evaluateWins(grid, 1);
  const scatterWin = wins.find(w => w.symbol === 'scatter');
  assert(scatterWin, 'Should detect 3 scatters');
  assertEqual(scatterWin.count, 3, 'Count');
  assertEqual(scatterWin.payout, PAYTABLE['scatter'][3], 'Payout');
});

test('2 scatter symbols do not trigger scatter win', () => {
  const grid = emptyGrid('horseshoe');
  grid[0][0] = 'scatter';
  grid[2][2] = 'scatter';
  const wins = evaluateWins(grid, 1);
  const scatterWin = wins.find(w => w.symbol === 'scatter');
  assert(!scatterWin, 'Only 2 scatters should not win');
});

console.log('\nPayout Tests');
test('totalPayout sums all win amounts', () => {
  const wins = [
    { payout: 25 },
    { payout: 10 },
    { payout: 5 },
  ];
  assertEqual(totalPayout(wins), 40, 'Total payout');
});

test('empty wins array returns 0 payout', () => {
  assertEqual(totalPayout([]), 0, 'No wins → 0');
});

test('bet multiplier correctly scales payout', () => {
  const grid = emptyGrid('gold_nugget');
  const wins1 = evaluateWins(grid, 1);
  const wins5 = evaluateWins(grid, 5);
  const p1 = totalPayout(wins1);
  const p5 = totalPayout(wins5);
  assert(p5 === p1 * 5, `Bet 5 should pay 5× bet 1: ${p1} vs ${p5}`);
});

console.log('\nPayline Coverage');
test('all 20 paylines are defined', () => {
  assertEqual(PAYLINES.length, 20, 'PAYLINES count');
});

test('every payline has exactly 5 row indices in range [0,2]', () => {
  for (const [i, pl] of PAYLINES.entries()) {
    assertEqual(pl.length, 5, `Payline ${i} length`);
    for (const row of pl) assert(row >= 0 && row <= 2, `Payline ${i} row out of range: ${row}`);
  }
});

// ---- Summary ----
console.log(`\n${'─'.repeat(40)}`);
console.log(`Tests: ${passed + failed}  Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
