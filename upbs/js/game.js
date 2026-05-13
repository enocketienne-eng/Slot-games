class UPBSGame {
  constructor(renderer) {
    this.renderer = renderer;
    this.balance = 1000;
    this.bet = 1;
    this.lastWins = [];
    this.totalWon = 0;
    this.totalSpent = 0;
    this.spinCount = 0;
    this.running = false;

    this.freeSpinsRemaining = 0;
    this.freeSpinsMultiplier = FREE_SPINS_MULTIPLIER;
    this.inBonusRound = false;

    this.onBalanceChange = null;
    this.onWin = null;
    this.onSpin = null;
    this.onFreeSpinsTriggered = null;
    this.onFreeSpinsUpdate = null;
    this.onFreeSpinsComplete = null;
  }

  setBet(amount) {
    if (this.inBonusRound) return;
    this.bet = Math.max(1, Math.min(amount, 50));
  }

  canSpin() {
    return !this.running && (this.inBonusRound || this.balance >= this.bet);
  }

  async spin() {
    if (!this.canSpin()) return;

    this.running = true;
    const effectiveBet = this.bet;

    if (!this.inBonusRound) {
      this.balance -= effectiveBet;
      this.totalSpent += effectiveBet;
    }
    this.spinCount++;

    if (this.onBalanceChange) this.onBalanceChange(this.balance);
    if (this.onSpin) this.onSpin();

    const grid = generateGrid(SYMBOL_POOL);
    await this.renderer.spin(grid);

    const multiplier = this.inBonusRound ? this.freeSpinsMultiplier : 1;
    const wins = evaluateWins(grid, effectiveBet * multiplier);
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

    if (!this.inBonusRound) {
      const scatters = countScatters(grid);
      if (scatters >= FREE_SPINS_TRIGGER_COUNT) {
        this.freeSpinsRemaining = FREE_SPINS_COUNT;
        this.inBonusRound = true;
        if (this.onFreeSpinsTriggered) this.onFreeSpinsTriggered(FREE_SPINS_COUNT, this.freeSpinsMultiplier);
      }
    } else {
      this.freeSpinsRemaining--;
      if (this.onFreeSpinsUpdate) this.onFreeSpinsUpdate(this.freeSpinsRemaining);
      if (this.freeSpinsRemaining <= 0) {
        this.inBonusRound = false;
        if (this.onFreeSpinsComplete) this.onFreeSpinsComplete();
      }
    }

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
      freeSpinsRemaining: this.freeSpinsRemaining,
      inBonusRound: this.inBonusRound,
    };
  }
}
