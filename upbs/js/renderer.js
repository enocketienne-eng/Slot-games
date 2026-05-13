// UPBS canvas renderer — piggy-bank theme.
const CELL_W = 110;
const CELL_H = 100;
const REEL_COUNT = 5;
const ROW_COUNT = 3;
const CANVAS_W = CELL_W * REEL_COUNT;
const CANVAS_H = CELL_H * ROW_COUNT;
const SPIN_DURATION = 700;
const REEL_STAGGER = 130;

// Pink/coin palette.
const C = {
  pinkPrimary: '#FF4F92',
  pinkLight:   '#FFB6C1',
  pinkPale:    '#FFE4EC',
  magenta:     '#8E1B5E',
  deepMagenta: '#3A0A22',
  goldCoin:    '#F5C518',
  goldDark:    '#C8960C',
  silverCoin:  '#C8CDD4',
  cream:       '#FFF5F7',
  shadow:      '#1A0010',
};

function getSymbol(id) {
  return Object.values(SYMBOLS).find(s => s.id === id);
}

function drawSymbolShape(ctx, sym, cx, cy, size) {
  const s = size * 0.38;
  ctx.fillStyle = sym.color;
  ctx.strokeStyle = C.shadow;
  ctx.lineWidth = 2;

  switch (sym.shape) {
    case 'piggybank': {
      // Wild — chunky pink piggy bank with coin slot
      const bodyW = s * 2.0, bodyH = s * 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.1, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // ear
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.18, cy - bodyH * 0.4);
      ctx.lineTo(cx - bodyW * 0.05, cy - bodyH * 0.65);
      ctx.lineTo(cx + bodyW * 0.05, cy - bodyH * 0.42);
      ctx.closePath();
      ctx.fillStyle = '#D63A7A';
      ctx.fill(); ctx.stroke();
      // snout
      ctx.fillStyle = '#D63A7A';
      ctx.beginPath();
      ctx.ellipse(cx + bodyW * 0.35, cy + s * 0.15, s * 0.32, s * 0.26, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // nostrils
      ctx.fillStyle = C.shadow;
      ctx.beginPath();
      ctx.arc(cx + bodyW * 0.32, cy + s * 0.15, s * 0.06, 0, Math.PI * 2);
      ctx.arc(cx + bodyW * 0.42, cy + s * 0.15, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // eye
      ctx.fillStyle = C.shadow;
      ctx.beginPath();
      ctx.arc(cx + bodyW * 0.05, cy - s * 0.05, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // coin slot
      ctx.fillStyle = C.shadow;
      ctx.fillRect(cx - s * 0.4, cy - bodyH * 0.45, s * 0.7, s * 0.12);
      // little leg
      ctx.fillStyle = sym.color;
      ctx.fillRect(cx - bodyW * 0.3, cy + bodyH * 0.4, s * 0.3, s * 0.25);
      ctx.fillRect(cx + bodyW * 0.05, cy + bodyH * 0.4, s * 0.3, s * 0.25);
      ctx.strokeRect(cx - bodyW * 0.3, cy + bodyH * 0.4, s * 0.3, s * 0.25);
      ctx.strokeRect(cx + bodyW * 0.05, cy + bodyH * 0.4, s * 0.3, s * 0.25);
      break;
    }
    case 'coinbag': {
      // Scatter — burlap money bag with $ on it
      ctx.fillStyle = sym.color;
      // bag body — rounded teardrop
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.85, cy + s * 0.95);
      ctx.quadraticCurveTo(cx - s * 1.05, cy - s * 0.1, cx - s * 0.5, cy - s * 0.6);
      ctx.lineTo(cx + s * 0.5, cy - s * 0.6);
      ctx.quadraticCurveTo(cx + s * 1.05, cy - s * 0.1, cx + s * 0.85, cy + s * 0.95);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // tie at top
      ctx.fillStyle = C.goldDark;
      ctx.fillRect(cx - s * 0.55, cy - s * 0.7, s * 1.1, s * 0.18);
      ctx.strokeRect(cx - s * 0.55, cy - s * 0.7, s * 1.1, s * 0.18);
      // $ sign
      ctx.fillStyle = C.goldCoin;
      ctx.font = `bold ${Math.floor(s * 0.95)}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', cx, cy + s * 0.2);
      break;
    }
    case 'goldcoin': {
      // Gold Coin — circle with $ stamp
      ctx.beginPath();
      ctx.arc(cx, cy, s * 1.0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // inner rim
      ctx.strokeStyle = C.goldDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      // $ stamp
      ctx.fillStyle = C.shadow;
      ctx.font = `bold ${Math.floor(s * 1.0)}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', cx, cy + s * 0.05);
      // shine
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.arc(cx - s * 0.35, cy - s * 0.35, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'silvercoin': {
      // Silver Coin — circle with star stamp
      ctx.beginPath();
      ctx.arc(cx, cy, s * 1.0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#7E8A99';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      // 5-point star
      ctx.fillStyle = '#7E8A99';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const inner = outer + Math.PI / 5;
        const or = s * 0.55, ir = s * 0.22;
        if (i === 0) ctx.moveTo(cx + Math.cos(outer) * or, cy + Math.sin(outer) * or);
        else ctx.lineTo(cx + Math.cos(outer) * or, cy + Math.sin(outer) * or);
        ctx.lineTo(cx + Math.cos(inner) * ir, cy + Math.sin(inner) * ir);
      }
      ctx.closePath();
      ctx.fill();
      // shine
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(cx - s * 0.35, cy - s * 0.35, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'piglet': {
      // Piglet — smaller cuter piggy facing forward
      const bodyW = s * 1.7, bodyH = s * 1.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.15, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // ears (two small triangles)
      ctx.fillStyle = '#FF8FA8';
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.32, cy - bodyH * 0.35);
      ctx.lineTo(cx - bodyW * 0.18, cy - bodyH * 0.6);
      ctx.lineTo(cx - bodyW * 0.05, cy - bodyH * 0.32);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + bodyW * 0.32, cy - bodyH * 0.35);
      ctx.lineTo(cx + bodyW * 0.18, cy - bodyH * 0.6);
      ctx.lineTo(cx + bodyW * 0.05, cy - bodyH * 0.32);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // snout
      ctx.fillStyle = '#FF8FA8';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.35, s * 0.3, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // nostrils
      ctx.fillStyle = C.shadow;
      ctx.beginPath();
      ctx.arc(cx - s * 0.1, cy + s * 0.35, s * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.1, cy + s * 0.35, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.beginPath();
      ctx.arc(cx - s * 0.3, cy - s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.3, cy - s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'horseshoe': {
      // Horseshoe — dark steel U with pink-gold rim
      ctx.lineWidth = s * 0.42;
      ctx.strokeStyle = sym.color;
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.8, Math.PI * 0.12, Math.PI * 0.88, false);
      ctx.stroke();
      ctx.lineWidth = s * 0.34;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.8 * Math.cos(Math.PI * 0.12), cy - s * 0.1 + s * 0.8 * Math.sin(Math.PI * 0.12));
      ctx.lineTo(cx - s * 0.8 * Math.cos(Math.PI * 0.12), cy + s * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.8 * Math.cos(Math.PI * 0.12), cy - s * 0.1 + s * 0.8 * Math.sin(Math.PI * 0.12));
      ctx.lineTo(cx + s * 0.8 * Math.cos(Math.PI * 0.12), cy + s * 0.75);
      ctx.stroke();
      // gold rim accent
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.goldCoin;
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.8 + s * 0.21 + 1, Math.PI * 0.12, Math.PI * 0.88, false);
      ctx.stroke();
      // nail dots
      ctx.fillStyle = C.goldCoin;
      for (let a = 0.25; a <= 0.75; a += 0.16) {
        const ang = Math.PI * (0.12 + (0.76 * a));
        const rx = cx + Math.cos(ang) * s * 0.6;
        const ry = cy - s * 0.1 + Math.sin(ang) * s * 0.6;
        ctx.beginPath();
        ctx.arc(rx, ry, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'trophy': {
      // Trophy — cup with handles on pedestal
      const cupW = s * 1.3, cupH = s * 1.1;
      // pedestal
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(cx - cupW * 0.35, cy + cupH * 0.55, cupW * 0.7, s * 0.25);
      ctx.strokeRect(cx - cupW * 0.35, cy + cupH * 0.55, cupW * 0.7, s * 0.25);
      ctx.fillRect(cx - cupW * 0.5, cy + cupH * 0.8, cupW, s * 0.18);
      ctx.strokeRect(cx - cupW * 0.5, cy + cupH * 0.8, cupW, s * 0.18);
      // cup body
      ctx.fillStyle = sym.color;
      ctx.beginPath();
      ctx.moveTo(cx - cupW / 2, cy - cupH * 0.45);
      ctx.lineTo(cx + cupW / 2, cy - cupH * 0.45);
      ctx.lineTo(cx + cupW * 0.35, cy + cupH * 0.55);
      ctx.lineTo(cx - cupW * 0.35, cy + cupH * 0.55);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // handles
      ctx.lineWidth = s * 0.18;
      ctx.strokeStyle = sym.color;
      ctx.beginPath();
      ctx.arc(cx - cupW * 0.55, cy - cupH * 0.1, s * 0.3, Math.PI * 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + cupW * 0.55, cy - cupH * 0.1, s * 0.3, Math.PI * 1.4, Math.PI * 0.6, true);
      ctx.stroke();
      // shine
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(cx - cupW * 0.3, cy - cupH * 0.35);
      ctx.lineTo(cx - cupW * 0.15, cy - cupH * 0.35);
      ctx.lineTo(cx - cupW * 0.05, cy + cupH * 0.4);
      ctx.lineTo(cx - cupW * 0.18, cy + cupH * 0.4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'diamond': {
      // Diamond — faceted gem
      ctx.fillStyle = sym.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 1.05);
      ctx.lineTo(cx + s * 0.95, cy - s * 0.25);
      ctx.lineTo(cx, cy + s * 1.05);
      ctx.lineTo(cx - s * 0.95, cy - s * 0.25);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // facets
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.95, cy - s * 0.25);
      ctx.lineTo(cx + s * 0.95, cy - s * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.45, cy - s * 0.25);
      ctx.lineTo(cx, cy - s * 1.05);
      ctx.lineTo(cx + s * 0.45, cy - s * 0.25);
      ctx.lineTo(cx, cy + s * 1.05);
      ctx.lineTo(cx - s * 0.45, cy - s * 0.25);
      ctx.stroke();
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.35, cy - s * 0.7);
      ctx.lineTo(cx - s * 0.05, cy - s * 0.95);
      ctx.lineTo(cx - s * 0.05, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.35, cy - s * 0.3);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

function drawCell(ctx, id, x, y, w, h, highlighted) {
  const sym = getSymbol(id);
  if (!sym) return;

  ctx.fillStyle = highlighted ? 'rgba(255,79,146,0.22)' : C.deepMagenta;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  ctx.strokeStyle = highlighted ? C.pinkPrimary : '#22030F';
  ctx.lineWidth = highlighted ? 2 : 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  const cx = x + w / 2;
  const cy = y + h / 2 - 8;

  drawSymbolShape(ctx, sym, cx, cy, Math.min(w, h));

  ctx.fillStyle = highlighted ? C.pinkPrimary : C.cream;
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
      Array.from({ length: ROW_COUNT }, () => 'gold_coin')
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

    // Reel background — soft pink wash
    ctx.fillStyle = C.pinkPale;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

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

    if (winLines.length > 0 && flash % 2 === 0) {
      ctx.save();
      for (const win of winLines) {
        if (!win.payline) continue;
        ctx.beginPath();
        ctx.strokeStyle = C.pinkPrimary;
        ctx.lineWidth = 3;
        ctx.shadowColor = C.pinkPrimary;
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

    ctx.strokeStyle = C.magenta;
    ctx.lineWidth = 2;
    for (let r = 1; r < REEL_COUNT; r++) {
      ctx.beginPath();
      ctx.moveTo(r * CELL_W, 0);
      ctx.lineTo(r * CELL_W, CANVAS_H);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(142,27,94,0.35)';
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
    ctx.fillStyle = '#2a0518';
    ctx.fillRect(x + 1, 0, CELL_W - 2, CANVAS_H);

    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      const yBase = ((i / stripes) * CANVAS_H + this.reelOffsets[r]) % CANVAS_H;
      const alpha = 0.15 + 0.1 * (i % 2);
      ctx.fillStyle = `rgba(255,79,146,${alpha})`;
      ctx.fillRect(x + 6, yBase, CELL_W - 12, CELL_H * 0.7);
    }

    ctx.fillStyle = 'rgba(42,5,24,0.35)';
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
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r] && now >= reelStops[r]) {
            reelDone[r] = true;
            for (let row = 0; row < ROW_COUNT; row++) workGrid[r][row] = finalGrid[r][row];
          }
        }

        this.drawGrid(workGrid, [], 0);

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
