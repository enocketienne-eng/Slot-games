class GoldRushGame {
  constructor(renderer) {
    this.renderer = renderer;
    this.balance = 1000;
    this.bet = 1;
    this.lastWins = [];
    this.totalWon = 0;
    this.totalSpent = 0;
    this.spinCount = 0;
    this.running = false;

    this.onBalanceChange = null;
    this.onWin = null;
    this.onSpin = null;
  }

  setBet(amount) {
    this.bet = Math.max(1, Math.min(amount, 50));
  }

  canSpin() {
    return !this.running && this.balance >= this.bet;
  }

  async spin() {
    if (!this.canSpin()) return;

    this.running = true;
    this.balance -= this.bet;
    this.totalSpent += this.bet;
    this.spinCount++;

    if (this.onBalanceChange) this.onBalanceChange(this.balance);
    if (this.onSpin) this.onSpin();

    const grid = generateGrid(SYMBOL_POOL);

    await this.renderer.spin(grid);

    const wins = evaluateWins(grid, this.bet);
    const payout = totalPayout(wins);

    if (payout > 0) {
      this.balance += payout;
      this.totalWon += payout;
      this.lastWins = wins;
      this.renderer.showWins(wins);
      if (this.onWin) this.onWin(wins, payout);
    } else {
      this.lastWins = [];
    }

    if (this.onBalanceChange) this.onBalanceChange(this.balance);

    this.running = false;
    return { wins, payout };
  }

  getStats() {
    return {
      balance: this.balance,
      bet: this.bet,
      spinCount: this.spinCount,
      totalSpent: this.totalSpent,
      totalWon: this.totalWon,
      rtp: this.totalSpent > 0 ? (this.totalWon / this.totalSpent * 100).toFixed(1) : '0.0',
    };
  }
}
