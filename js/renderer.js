// Canvas renderer — visual spec from LUC-4, asset pack from LUC-12
const CELL_W = 110;
const CELL_H = 100;
const REEL_COUNT = 5;
const ROW_COUNT = 3;
const CANVAS_W = CELL_W * REEL_COUNT;
const CANVAS_H = CELL_H * ROW_COUNT;
const SPIN_DURATION = 700;
const REEL_STAGGER = 130;

// Spec colors (LUC-4 §2)
const C = {
  goldPrimary: '#F5C518',
  goldDark:    '#C8960C',
  deepBrown:   '#3B1E08',
  saddleBrown: '#8B4513',
  warmTan:     '#D2A679',
  skyBlue:     '#6BAED6',
  crimsonRed:  '#C0392B',
  offWhite:    '#F5ECD7',
  shadowBlack: '#1A0A00',
};

function getSymbol(id) {
  return Object.values(SYMBOLS).find(s => s.id === id);
}

// Symbol image cache — preload all PNGs once, then drawImage from the cache.
// If an image is not yet loaded (or fails to load), drawSymbol falls back to
// the canvas-shape renderer so the game stays playable.
const SYMBOL_IMAGES = {};
let SYMBOL_IMAGES_READY = false;

function preloadSymbolImages() {
  const entries = Object.values(SYMBOLS).filter(s => s.image);
  if (entries.length === 0) return Promise.resolve();
  return Promise.all(entries.map(sym => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { SYMBOL_IMAGES[sym.id] = img; resolve(); };
    img.onerror = () => { console.warn(`Symbol image failed: ${sym.image}`); resolve(); };
    img.src = sym.image;
  }))).then(() => { SYMBOL_IMAGES_READY = true; });
}

function drawSymbolImage(ctx, sym, cx, cy, cellW, cellH) {
  const img = SYMBOL_IMAGES[sym.id];
  if (!img) return false;
  // Reserve space at the bottom for the label
  const padTop = 4;
  const padBottom = 14;
  const maxW = cellW - 8;
  const maxH = cellH - padTop - padBottom;
  const fit = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * fit;
  const h = img.height * fit;
  const x = cx - w / 2;
  const y = cy - h / 2 - 4; // shift up slightly to balance label
  ctx.drawImage(img, x, y, w, h);
  return true;
}

// Draw a single symbol using canvas shapes per spec §10
function drawSymbolShape(ctx, sym, cx, cy, size) {
  const s = size * 0.38;
  ctx.fillStyle = sym.color;
  ctx.strokeStyle = C.shadowBlack;
  ctx.lineWidth = 2;

  switch (sym.shape) {
    case 'rect': {
      // Gold Bar — rectangle with shine
      const w = s * 2.2, h = s * 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - w/2, cy - h/2, w, h, 4);
      ctx.fill(); ctx.stroke();
      // shine stripe
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.roundRect(cx - w/2 + 4, cy - h/2 + 4, w * 0.35, h * 0.3, 2);
      ctx.fill();
      break;
    }
    case 'star': {
      // Wild — 6-point sheriff star
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const outer = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const inner = outer + Math.PI / 6;
        const or = s * 1.1, ir = s * 0.45;
        if (i === 0) ctx.moveTo(cx + Math.cos(outer)*or, cy + Math.sin(outer)*or);
        else ctx.lineTo(cx + Math.cos(outer)*or, cy + Math.sin(outer)*or);
        ctx.lineTo(cx + Math.cos(inner)*ir, cy + Math.sin(inner)*ir);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // center circle
      ctx.fillStyle = C.deepBrown;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'diamond': {
      // Scatter — dynamite-styled diamond
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 1.15);
      ctx.lineTo(cx + s * 0.85, cy);
      ctx.lineTo(cx, cy + s * 1.15);
      ctx.lineTo(cx - s * 0.85, cy);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // inner facet
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.55);
      ctx.lineTo(cx + s * 0.35, cy - s * 0.1);
      ctx.lineTo(cx, cy + s * 0.2);
      ctx.lineTo(cx - s * 0.35, cy - s * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'circle': {
      // Gold Nugget — rough lumpy circle
      ctx.beginPath();
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // specular highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(cx - s * 0.3, cy - s * 0.35, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cross': {
      // Pickaxe — crossed picks
      const arm = s * 1.1, thick = s * 0.28;
      ctx.beginPath();
      ctx.rect(cx - thick/2, cy - arm, thick, arm * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx - arm, cy - thick/2, arm * 2, thick);
      ctx.fill(); ctx.stroke();
      // diagonal accent
      ctx.strokeStyle = C.goldPrimary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - arm * 0.65, cy - arm * 0.65);
      ctx.lineTo(cx + arm * 0.65, cy + arm * 0.65);
      ctx.stroke();
      break;
    }
    case 'horseshoe': {
      // Horseshoe — U arc
      ctx.lineWidth = s * 0.38;
      ctx.strokeStyle = sym.color;
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.8, Math.PI * 0.12, Math.PI * 0.88, false);
      ctx.stroke();
      // prongs
      ctx.lineWidth = s * 0.32;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.8 * Math.cos(Math.PI * 0.12), cy - s * 0.1 + s * 0.8 * Math.sin(Math.PI * 0.12));
      ctx.lineTo(cx - s * 0.8 * Math.cos(Math.PI * 0.12), cy + s * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.8 * Math.cos(Math.PI * 0.12), cy - s * 0.1 + s * 0.8 * Math.sin(Math.PI * 0.12));
      ctx.lineTo(cx + s * 0.8 * Math.cos(Math.PI * 0.12), cy + s * 0.75);
      ctx.stroke();
      // gold rim
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.goldPrimary;
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.8 + s * 0.19 + 1, Math.PI * 0.12, Math.PI * 0.88, false);
      ctx.stroke();
      break;
    }
    case 'hat': {
      // Cowboy Hat — trapezoid brim + crown
      const brimW = s * 2.4, crownW = s * 1.4, crownH = s * 1.0, brimH = s * 0.28;
      ctx.beginPath();
      ctx.moveTo(cx - brimW/2, cy + crownH/2);
      ctx.lineTo(cx + brimW/2, cy + crownH/2);
      ctx.lineTo(cx + brimW/2, cy + crownH/2 + brimH);
      ctx.lineTo(cx - brimW/2, cy + crownH/2 + brimH);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - crownW/2, cy + crownH/2);
      ctx.lineTo(cx - crownW/2 * 0.85, cy - crownH/2);
      ctx.lineTo(cx + crownW/2 * 0.85, cy - crownH/2);
      ctx.lineTo(cx + crownW/2, cy + crownH/2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // hat band
      ctx.fillStyle = C.goldPrimary;
      ctx.fillRect(cx - crownW/2, cy + crownH/2 - brimH * 0.9, crownW, brimH * 0.9);
      break;
    }
    case 'square': {
      // TNT Crate — box with text
      const w = s * 1.9;
      ctx.beginPath();
      ctx.roundRect(cx - w/2, cy - w/2, w, w, 3);
      ctx.fill(); ctx.stroke();
      // wood grain lines
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - w/2, cy - w/2 + (w/3)*i);
        ctx.lineTo(cx + w/2, cy - w/2 + (w/3)*i);
        ctx.stroke();
      }
      // TNT label
      ctx.fillStyle = C.offWhite;
      ctx.font = `bold ${Math.floor(s * 0.55)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TNT', cx, cy);
      break;
    }
  }
}

function drawCell(ctx, id, x, y, w, h, highlighted) {
  const sym = getSymbol(id);
  if (!sym) return;

  // Cell background — parchment warm tan from spec
  ctx.fillStyle = highlighted ? 'rgba(245,197,24,0.18)' : C.deepBrown;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  // Subtle inner border
  ctx.strokeStyle = highlighted ? C.goldPrimary : '#2a1400';
  ctx.lineWidth = highlighted ? 2 : 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  const cx = x + w / 2;
  const cy = y + h / 2 - 8;

  // Prefer the loaded PNG asset; fall back to the canvas shape if missing.
  if (!drawSymbolImage(ctx, sym, cx, cy, w, h)) {
    drawSymbolShape(ctx, sym, cx, cy, Math.min(w, h));
  }

  // Label
  ctx.fillStyle = highlighted ? C.goldPrimary : C.offWhite;
  ctx.font = `bold 10px 'Roboto Slab', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(sym.label.toUpperCase(), x + w / 2, y + h - 7);
}

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    this.grid = Array.from({ length: REEL_COUNT }, () =>
      Array.from({ length: ROW_COUNT }, () => 'gold_nugget')
    );
    this.spinning = false;
    this.reelOffsets = Array(REEL_COUNT).fill(0);
    this.winLines = [];
    this.winFlash = 0;
    this._winFlashTimer = null;
  }

  drawGrid(grid, winLines, flash) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Reel background — warm tan parchment
    ctx.fillStyle = C.warmTan;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Build highlighted cells set
    const highlighted = new Set();
    if (winLines.length > 0 && flash % 2 === 0) {
      for (const win of winLines) {
        if (!win.payline) continue;
        for (let r = 0; r < win.count; r++) {
          highlighted.add(`${r},${win.payline[r]}`);
        }
      }
    }

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        drawCell(ctx, grid[r][row], r * CELL_W, row * CELL_H, CELL_W, CELL_H, highlighted.has(`${r},${row}`));
      }
    }

    // Win line overlays
    if (winLines.length > 0 && flash % 2 === 0) {
      ctx.save();
      for (const win of winLines) {
        if (!win.payline) continue;
        ctx.beginPath();
        ctx.strokeStyle = C.goldPrimary;
        ctx.lineWidth = 3;
        ctx.shadowColor = C.goldPrimary;
        ctx.shadowBlur = 10;
        win.payline.forEach((row, r) => {
          const px = r * CELL_W + CELL_W / 2;
          const py = row * CELL_H + CELL_H / 2;
          if (r === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Reel dividers
    ctx.strokeStyle = C.saddleBrown;
    ctx.lineWidth = 2;
    for (let r = 1; r < REEL_COUNT; r++) {
      ctx.beginPath();
      ctx.moveTo(r * CELL_W, 0);
      ctx.lineTo(r * CELL_W, CANVAS_H);
      ctx.stroke();
    }
    // Row dividers
    ctx.strokeStyle = 'rgba(139,69,19,0.35)';
    ctx.lineWidth = 1;
    for (let row = 1; row < ROW_COUNT; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * CELL_H);
      ctx.lineTo(CANVAS_W, row * CELL_H);
      ctx.stroke();
    }
  }

  drawSpinningReel(r) {
    const ctx = this.ctx;
    const x = r * CELL_W;
    ctx.fillStyle = '#180e00';
    ctx.fillRect(x + 1, 0, CELL_W - 2, CANVAS_H);

    // Moving stripe blur
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      const yBase = ((i / stripes) * CANVAS_H + this.reelOffsets[r]) % CANVAS_H;
      const alpha = 0.15 + 0.1 * (i % 2);
      ctx.fillStyle = `rgba(245,197,24,${alpha})`;
      ctx.fillRect(x + 6, yBase, CELL_W - 12, CELL_H * 0.7);
    }

    // Motion blur overlay
    ctx.fillStyle = 'rgba(24,14,0,0.35)';
    ctx.fillRect(x + 1, 0, CELL_W - 2, CANVAS_H);
  }

  async spin(finalGrid) {
    if (this.spinning) return;
    this.spinning = true;
    if (this._winFlashTimer) { clearInterval(this._winFlashTimer); this._winFlashTimer = null; }
    this.winLines = [];

    const startTime = performance.now();
    const reelStops = Array.from({ length: REEL_COUNT }, (_, i) =>
      startTime + SPIN_DURATION + i * REEL_STAGGER
    );
    const allDone = reelStops[REEL_COUNT - 1];
    const reelDone = Array(REEL_COUNT).fill(false);
    const workGrid = this.grid.map(col => [...col]);

    return new Promise((resolve) => {
      const animate = (now) => {
        // Land reels that have reached their stop time
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r] && now >= reelStops[r]) {
            reelDone[r] = true;
            for (let row = 0; row < ROW_COUNT; row++) workGrid[r][row] = finalGrid[r][row];
          }
        }

        // Draw the current grid state (landed reels show final symbols)
        this.drawGrid(workGrid, [], 0);

        // Overlay blur on still-spinning reels
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r]) {
            this.reelOffsets[r] = (this.reelOffsets[r] + 20) % CANVAS_H;
            this.drawSpinningReel(r);
          }
        }

        if (now < allDone) {
          requestAnimationFrame(animate);
        } else {
          this.grid = finalGrid.map(col => [...col]);
          this.drawGrid(this.grid, [], 0);
          this.spinning = false;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  showWins(wins) {
    this.winLines = wins;
    this.winFlash = 0;
    if (this._winFlashTimer) clearInterval(this._winFlashTimer);
    let ticks = 0;
    this._winFlashTimer = setInterval(() => {
      this.winFlash++;
      this.drawGrid(this.grid, this.winLines, this.winFlash);
      ticks++;
      if (ticks >= 10) {
        clearInterval(this._winFlashTimer);
        this._winFlashTimer = null;
        this.drawGrid(this.grid, [], 0);
      }
    }, 280);
  }
}
