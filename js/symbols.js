// Symbol definitions — visuals from Gold Rush Bonanza asset pack (LUC-12)
// Symbol IDs are stable across the game engine and tests; the label/color/image
// fields are the only display-side fields and can be changed freely.
const SYMBOLS = {
  WILD:       { id: 'wild',       label: 'Miner',      tier: 1, color: '#F2C24A', shape: 'star',      weight: 2,  image: 'assets/symbols/wild_miner.png' },
  SCATTER:    { id: 'scatter',    label: 'Dynamite',   tier: 1, color: '#E74C3C', shape: 'diamond',   weight: 2,  image: 'assets/symbols/scatter_dynamite.png' },
  GOLD_BAR:   { id: 'gold_bar',   label: 'Jackpot',    tier: 1, color: '#F5C518', shape: 'rect',      weight: 4,  image: 'assets/symbols/jackpot_cart.png' },
  GOLD_NUGGET:{ id: 'gold_nugget',label: 'Nugget',     tier: 2, color: '#E67E22', shape: 'circle',    weight: 6,  image: 'assets/symbols/gold_nugget.png' },
  PICKAXE:    { id: 'pickaxe',    label: 'Pickaxe',    tier: 2, color: '#7F8C8D', shape: 'cross',     weight: 8,  image: 'assets/symbols/pickaxe.png' },
  HORSESHOE:  { id: 'horseshoe',  label: 'Mine Cart',  tier: 2, color: '#2C3E50', shape: 'horseshoe', weight: 8,  image: 'assets/symbols/mine_cart.png' },
  COWBOY_HAT: { id: 'cowboy_hat', label: 'King',       tier: 3, color: '#8B4513', shape: 'hat',       weight: 10, image: 'assets/symbols/card_k.png' },
  TNT_CRATE:  { id: 'tnt_crate',  label: 'Ace',        tier: 3, color: '#E74C3C', shape: 'square',    weight: 10, image: 'assets/symbols/card_a.png' },
};

// Paytable — multipliers per the UX design spec (LUC-4 §4) for 3/4/5 on a payline
const PAYTABLE = {
  wild:        { 3: 50,  4: 200, 5: 1000 },
  scatter:     { 3: 5,   4: 20,  5: 100  },
  gold_bar:    { 3: 10,  4: 25,  5: 100  },
  gold_nugget: { 3: 5,   4: 12,  5: 40   },
  pickaxe:     { 3: 5,   4: 15,  5: 50   },
  horseshoe:   { 3: 3,   4: 8,   5: 25   },
  cowboy_hat:  { 3: 2,   4: 5,   5: 15   },
  tnt_crate:   { 3: 1,   4: 3,   5: 10   },
};

// 20 paylines on a 5x3 grid (row indices per reel) — 20 confirmed (LUC-5 §A.1)
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

// Free spins: 3+ scatter triggers 10 free spins at 2x multiplier (LUC-5 §A.3)
const FREE_SPINS_TRIGGER_COUNT = 3;
const FREE_SPINS_COUNT = 10;
const FREE_SPINS_MULTIPLIER = 2;

// Dual-export: in the browser this file is loaded as a <script> and the
// declarations above become window globals. In Node (tests, CI guards) we
// also publish the same names on globalThis so sibling modules that rely on
// the global pattern keep working, and on module.exports for `require()`.
if (typeof module !== 'undefined' && module.exports) {
  Object.assign(globalThis, {
    SYMBOLS, PAYTABLE, PAYLINES, SYMBOL_POOL,
    FREE_SPINS_TRIGGER_COUNT, FREE_SPINS_COUNT, FREE_SPINS_MULTIPLIER,
    buildSymbolPool,
  });
  module.exports = {
    SYMBOLS, PAYTABLE, PAYLINES, SYMBOL_POOL,
    FREE_SPINS_TRIGGER_COUNT, FREE_SPINS_COUNT, FREE_SPINS_MULTIPLIER,
    buildSymbolPool,
  };
}
