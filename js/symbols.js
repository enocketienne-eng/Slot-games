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

// Paytable: multipliers for 3, 4, 5 matching symbols on a payline
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

// 20 paylines on a 5x3 grid (row indices per reel)
const PAYLINES = [
  [1, 1, 1, 1, 1], // middle row
  [0, 0, 0, 0, 0], // top row
  [2, 2, 2, 2, 2], // bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // inverted V
  [0, 0, 1, 2, 2], // diagonal down-right
  [2, 2, 1, 0, 0], // diagonal up-right
  [1, 0, 0, 0, 1], // dip top
  [1, 2, 2, 2, 1], // dip bottom
  [0, 1, 0, 1, 0], // zigzag top
  [2, 1, 2, 1, 2], // zigzag bottom
  [1, 0, 1, 0, 1], // zigzag mid-top
  [1, 2, 1, 2, 1], // zigzag mid-bottom
  [0, 2, 0, 2, 0], // extreme zigzag top
  [2, 0, 2, 0, 2], // extreme zigzag bottom
  [0, 1, 1, 1, 2], // slope down
  [2, 1, 1, 1, 0], // slope up
  [1, 1, 0, 1, 1], // bump up
  [1, 1, 2, 1, 1], // bump down
  [0, 0, 2, 0, 0], // top with valley
];

// Build weighted symbol pool for random draws
function buildSymbolPool() {
  const pool = [];
  for (const sym of Object.values(SYMBOLS)) {
    for (let i = 0; i < sym.weight; i++) pool.push(sym.id);
  }
  return pool;
}

const SYMBOL_POOL = buildSymbolPool();
