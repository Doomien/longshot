import type { Vec2 } from '../core/types.ts';

// Trauma-based screen shake (visual only — applied to the render camera copy,
// never to sim coordinates). Fire adds trauma; it decays exponentially and
// the offset is smooth sinusoidal noise scaled by trauma^2.

export class ScreenShake {
  private trauma = 0;

  add(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  reset(): void {
    this.trauma = 0;
  }

  update(dt: number, decayRate = 2.6): void {
    if (dt <= 0) return;
    this.trauma = Math.max(0, this.trauma - decayRate * this.trauma * dt - 0.15 * dt);
  }

  /** Screen-pixel offset for the given elapsed time. */
  offset(timeSeconds: number, maxPixels = 14): Vec2 {
    const s = this.trauma * this.trauma * maxPixels;
    return {
      x: s * (Math.sin(timeSeconds * 91.7) * 0.6 + Math.sin(timeSeconds * 47.3) * 0.4),
      y: s * (Math.cos(timeSeconds * 83.1) * 0.6 + Math.cos(timeSeconds * 53.9) * 0.4),
    };
  }
}
