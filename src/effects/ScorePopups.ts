import type { Vec2 } from '../core/types.ts';

// Floating score text ("+150", "CENTER HIT!"). World-space, rises and fades.
// Read by the canvas renderer; a Phaser adapter would map to floating Text.

export interface ScorePopup {
  pos: Vec2;
  text: string;
  ttl: number;
  maxTtl: number;
}

const RISE_SPEED = 90;
const DEFAULT_TTL = 1.1;

export class ScorePopups {
  private popups: ScorePopup[] = [];

  get list(): readonly ScorePopup[] {
    return this.popups;
  }

  clear(): void {
    this.popups.length = 0;
  }

  add(pos: Vec2, text: string, ttl: number = DEFAULT_TTL): void {
    if (this.popups.length > 12) this.popups.shift();
    this.popups.push({ pos: { ...pos }, text, ttl, maxTtl: ttl });
  }

  update(dt: number): void {
    if (dt <= 0) return;
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i]!;
      p.ttl -= dt;
      p.pos.y -= RISE_SPEED * dt;
      if (p.ttl <= 0) this.popups.splice(i, 1);
    }
  }
}
