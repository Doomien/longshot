import {
  PERFECT_ZONE,
  type ActiveTarget,
} from './TargetDefinitions.ts';
import type { Vec2 } from '../core/types.ts';

// Hit detection in WORLD coordinates (never screen space). Ellipse test fits
// can/bottle/plate silhouettes; rect kept for future sign-like targets.

export function pointInTarget(x: number, y: number, target: ActiveTarget): boolean {
  const hw = target.width / 2;
  const hh = target.height / 2;
  if (hw <= 0 || hh <= 0) return false;
  const cx = target.position.x;
  const cy = target.position.y;
  const nx = (x - cx) / hw;
  const ny = (y - cy) / hh;
  return nx * nx + ny * ny <= 1;
}

export function pointInRect(x: number, y: number, target: ActiveTarget): boolean {
  return (
    x >= target.position.x - target.width / 2 &&
    x <= target.position.x + target.width / 2 &&
    y >= target.position.y - target.height / 2 &&
    y <= target.position.y + target.height / 2
  );
}

/** Normalized impact position within the target box (0..1, 0.5 = center). */
export function worldToLocal(target: ActiveTarget, impact: Vec2): Vec2 {
  return {
    x: (impact.x - (target.position.x - target.width / 2)) / target.width,
    y: (impact.y - (target.position.y - target.height / 2)) / target.height,
  };
}

/** True when the normalized impact falls in the smaller bullseye zone. */
export function isCenterHit(local: Vec2): boolean {
  return (
    local.x >= PERFECT_ZONE.x &&
    local.x <= PERFECT_ZONE.x + PERFECT_ZONE.width &&
    local.y >= PERFECT_ZONE.y &&
    local.y <= PERFECT_ZONE.y + PERFECT_ZONE.height
  );
}
