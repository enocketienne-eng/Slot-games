const CELL_W = 110;
const CELL_H = 100;
const REEL_COUNT = 5;
const ROW_COUNT = 3;
const CANVAS_W = CELL_W * REEL_COUNT;
const CANVAS_H = CELL_H * ROW_COUNT;
const SPIN_DURATION = 800; // ms base per reel
const REEL_STAGGER = 120; // ms delay between reels

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Per-reel spin state
    this.reelOffsets = Array(REEL_COUNT).fill(0);
    this.spinning = false;
    this.animFrameId = null;
    this.grid = Array.from({ length: REEL_COUNT }, () =>
      Array.from({ length: ROW_COUNT }, () => 'gold_nugget')
    );
    this.winLines = [];
    this.winFlash = 0;
  }

  drawSymbol(ctx, id, x, y, w, h) {
    const sym = SYMBOLS[id.toUpperCase()] || SYMBOLS[Object.keys(SYMBOLS).find(k => SYMBOLS[k].id === id)];
    if (!sym) return;

    // Background cell
    ctx.fillStyle = '#1a1005';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Border
    ctx.strokeStyle = '#4a3800';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // Emoji
    ctx.font = `${Math.floor(h * 0.42)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym.emoji, x + w / 2, y + h / 2 - 6);

    // Label
    ctx.fillStyle = sym.color;
    ctx.font = `bold 11px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(sym.label, x + w / 2, y + h - 8);
  }

  drawGrid(grid, winLines, flash) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw symbols
    for (let r = 0; r < REEL_COUNT; r++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        this.drawSymbol(ctx, grid[r][row], r * CELL_W, row * CELL_H, CELL_W, CELL_H);
      }
    }

    // Overlay win lines
    if (winLines.length > 0 && flash % 2 === 0) {
      winLines.forEach((win) => {
        if (!win.payline) return;
        ctx.beginPath();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        win.payline.forEach((row, r) => {
          const px = r * CELL_W + CELL_W / 2;
          const py = row * CELL_H + CELL_H / 2;
          if (r === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Highlight matched cells
        for (let r = 0; r < win.count; r++) {
          const row = win.payline[r];
          ctx.fillStyle = 'rgba(255,215,0,0.18)';
          ctx.fillRect(r * CELL_W + 2, row * CELL_H + 2, CELL_W - 4, CELL_H - 4);
        }
      });
    }

    // Reel dividers
    ctx.strokeStyle = '#7a5c00';
    ctx.lineWidth = 2;
    for (let r = 1; r < REEL_COUNT; r++) {
      ctx.beginPath();
      ctx.moveTo(r * CELL_W, 0);
      ctx.lineTo(r * CELL_W, CANVAS_H);
      ctx.stroke();
    }
  }

  // Animate a spinning reel (blur strip)
  drawSpinningReel(r, progress) {
    const ctx = this.ctx;
    const x = r * CELL_W;
    const stripH = CANVAS_H;

    ctx.fillStyle = '#0d0800';
    ctx.fillRect(x + 2, 0, CELL_W - 4, stripH);

    const stripeCount = 8;
    for (let i = 0; i < stripeCount; i++) {
      const alpha = 0.3 + 0.4 * Math.random();
      const yPos = ((i / stripeCount) * stripH + this.reelOffsets[r]) % stripH;
      ctx.fillStyle = `rgba(255,200,0,${alpha * 0.3})`;
      ctx.fillRect(x + 2, yPos, CELL_W - 4, CELL_H * 0.8);
    }
  }

  async spin(finalGrid) {
    if (this.spinning) return;
    this.spinning = true;
    this.winLines = [];

    const startTime = performance.now();
    const reelStops = Array(REEL_COUNT).fill(null).map((_, i) => startTime + SPIN_DURATION + i * REEL_STAGGER);
    const allDone = reelStops[REEL_COUNT - 1];
    const reelDone = Array(REEL_COUNT).fill(false);

    return new Promise((resolve) => {
      const animate = (now) => {
        // Update offsets for blur effect
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r]) {
            this.reelOffsets[r] = (this.reelOffsets[r] + 18) % CANVAS_H;
          }
        }

        // Draw base grid (partially obscured by spinning reels)
        this.drawGrid(this.grid, [], 0);

        // Overlay spinning reels
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r]) {
            this.drawSpinningReel(r, (now - startTime) / SPIN_DURATION);
          }
        }

        // Land reels one by one
        for (let r = 0; r < REEL_COUNT; r++) {
          if (!reelDone[r] && now >= reelStops[r]) {
            reelDone[r] = true;
            // Update grid for this reel
            for (let row = 0; row < ROW_COUNT; row++) {
              this.grid[r][row] = finalGrid[r][row];
            }
          }
        }

        if (now < allDone) {
          this.animFrameId = requestAnimationFrame(animate);
        } else {
          this.grid = finalGrid.map(col => [...col]);
          this.drawGrid(this.grid, [], 0);
          this.spinning = false;
          resolve();
        }
      };
      this.animFrameId = requestAnimationFrame(animate);
    });
  }

  showWins(wins) {
    this.winLines = wins;
    this.winFlash = 0;
    let flashes = 0;
    const maxFlashes = 8;

    const flash = () => {
      this.winFlash++;
      this.drawGrid(this.grid, this.winLines, this.winFlash);
      flashes++;
      if (flashes < maxFlashes) {
        setTimeout(flash, 300);
      }
    };
    if (wins.length > 0) flash();
  }
}
