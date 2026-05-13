// UPBS (Ultimate Piggy Bank Smash) — symbol definitions
// Math (weights, paytable, paylines, free-spins config) mirrors the Gold Rush
// template (PRI-184/PRI-185) so RTP behaviour is preserved across the reskin.
const SYMBOLS = {
  WILD:        { id: 'wild',        label: 'Piggy Bank', tier: 1, color: '#FF4F92', shape: 'piggybank', weight: 2 },
  SCATTER:     { id: 'scatter',     label: 'Coin Bag',   tier: 1, color: '#8E44AD', shape: 'coinbag',   weight: 2 },
  GOLD_COIN:   { id: 'gold_coin',   label: 'Gold Coin',  tier: 1, color: '#F5C518', shape: 'goldcoin',  weight: 4 },
  SILVER_COIN: { id: 'silver_coin', label: 'Silver',     tier: 2, color: '#C8CDD4', shape: 'silvercoin',weight: 6 },
  PIGLET:      { id: 'piglet',      label: 'Piglet',     tier: 2, color: '#FFB6C1', shape: 'piglet',    weight: 8 },
  HORSESHOE:   { id: 'horseshoe',   label: 'Horseshoe',  tier: 2, color: '#5D4037', shape: 'horseshoe', weight: 8 },
  TROPHY:      { id: 'trophy',      label: 'Trophy',     tier: 3, color: '#E8B923', shape: 'trophy',    weight: 10 },
  DIAMOND:     { id: 'diamond',     label: 'Diamond',    tier: 3, color: '#4FC3F7', shape: 'diamond',   weight: 10 },
};

// Paytable: multipliers identical to Gold Rush template — math sheet parity.
const PAYTABLE = {
  wild:        { 3: 50,  4: 200, 5: 1000 },
  scatter:     { 3: 5,   4: 20,  5: 100  },
  gold_coin:   { 3: 10,  4: 25,  5: 100  },
  silver_coin: { 3: 5,   4: 12,  5: 40   },
  piglet:      { 3: 5,   4: 15,  5: 50   },
  horseshoe:   { 3: 3,   4: 8,   5: 25   },
  trophy:      { 3: 2,   4: 5,   5: 15   },
  diamond:     { 3: 1,   4: 3,   5: 10   },
};

// 20 paylines on 5x3 — identical to Gold Rush template.
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

function buildSymbolPool() {
  const pool = [];
  for (const sym of Object.values(SYMBOLS)) {
    for (let i = 0; i < sym.weight; i++) pool.push(sym.id);
  }
  return pool;
}

const SYMBOL_POOL = buildSymbolPool();

// 3+ scatter triggers 10 free spins at 2x multiplier.
const FREE_SPINS_TRIGGER_COUNT = 3;
const FREE_SPINS_COUNT = 10;
const FREE_SPINS_MULTIPLIER = 2;
