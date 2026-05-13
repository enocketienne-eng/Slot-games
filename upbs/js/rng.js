// Cryptographically-seeded RNG using the browser's crypto API.
function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pickSymbol(pool) {
  return pool[randomInt(pool.length)];
}

// 5 reels x 3 rows.
function generateGrid(pool) {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => pickSymbol(pool))
  );
}
