import type { Vec2 } from '../core/types.ts';
import { gaussian, type Rng } from '../utils/random.ts';

// Recoil in SCREEN pixels (caller divides by zoom for world units).
// Arcade model: firing applies an instant positional kick (up + slight random
// sideways) that decays exponentially back to zero. Disrupts aim briefly
// without being frustrating; never moves an already-resolved impact point.

export class RecoilModel {
  private offsetX = 0;
  private offsetY = 0;

  get offset(): Vec2 {
    return { x: this.offsetX, y: this.offsetY };
  }

  applyKick(kickPixels: number, sideVariancePixels: number, rng: Rng = Math.random): void {
    this.offsetX += gaussian(rng) * sideVariancePixels;
    this.offsetY -= kickPixels + Math.abs(gaussian(rng)) * sideVariancePixels * 0.5;
  }

  update(dt: number, decayRatePerSec: number): void {
    if (dt <= 0) return;
    const damp = Math.exp(-decayRatePerSec * dt);
    this.offsetX *= damp;
    this.offsetY *= damp;
  }
}
