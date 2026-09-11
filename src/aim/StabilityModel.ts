import { clamp } from '../utils/math.ts';

// Settling mechanic: fast aim movement drains stability, stillness recovers
// it. Stability scales sway amplitude, so the emergent loop is
// spot -> move -> stop -> settle -> time sway -> fire. Frame-rate independent.

export class StabilityModel {
  private stability = 1;

  get value(): number {
    return this.stability;
  }

  reset(): void {
    this.stability = 1;
  }

  /** Multiplicative penalty, e.g. post-shot disruption. */
  penalize(factor: number): void {
    this.stability = clamp(this.stability * factor, 0, 1);
  }

  update(
    dt: number,
    mouseSpeedWorldPerSec: number,
    movementInstability: number,
    recoveryRate: number,
  ): void {
    if (dt <= 0) return;
    this.stability -= mouseSpeedWorldPerSec * movementInstability * dt;
    const recovery = 1 - Math.exp(-recoveryRate * dt);
    this.stability += (1 - this.stability) * recovery;
    this.stability = clamp(this.stability, 0, 1);
  }
}
