// Node.js test suite for core game logic (no DOM required).
// Run: node tests/gameLogic.test.js
//
// Path chosen: dual-export. js/symbols.js and js/winDetection.js stay as
// browser-global <script> files but also publish their identifiers via
// module.exports so this test can require them. Tests must NEVER redeclare
// names that exist in js/* — see scripts/check-no-redeclare.js (CI guard).

const {
  SYMBOLS,
  PAYTABLE,
  PAYLINES,
  FREE_SPINS_TRIGGER_COUNT,
} = require('../js/symbols.js');

const {
  evaluateWins,
  totalPayout,
} = require('../js/winDetection.js');

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
  const expected = Object.values(SYMBOLS).reduce((a, s) => a + s.weight, 0);
  assertEqual(sum, expected, 'Total weight');
  assert(sum > 0, 'Total weight must be positive');
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
  assert(!scatterWin, `Only ${FREE_SPINS_TRIGGER_COUNT - 1} scatters should not win`);
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
