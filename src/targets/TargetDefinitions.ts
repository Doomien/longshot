import type { Vec2 } from '../core/types.ts';

// Target data model (proposal sections 19-20). Pure data + authored tuning —
// no rendering imports. Distance is a difficulty scalar (gameplay units),
// not a physical unit.

// MVP archetypes. tinCan/clayTarget ship as data; the round spawns the MVP three.
export type TargetType = 'beerCan' | 'glassBottle' | 'metalPlate' | 'tinCan' | 'clayTarget';

export interface TargetDefinition {
  type: TargetType;
  /** Nominal size in world units at scale 1. */
  width: number;
  height: number;
  baseScore: number;
  /** Elliptical hitbox fits the sprite silhouettes well enough for MVP. */
  hitbox: 'ellipse' | 'rect';
}

export const TARGET_DEFINITIONS: Record<TargetType, TargetDefinition> = {
  beerCan: { type: 'beerCan', width: 44, height: 54, baseScore: 100, hitbox: 'ellipse' },
  glassBottle: { type: 'glassBottle', width: 30, height: 78, baseScore: 150, hitbox: 'ellipse' },
  metalPlate: { type: 'metalPlate', width: 64, height: 64, baseScore: 80, hitbox: 'ellipse' },
  tinCan: { type: 'tinCan', width: 40, height: 48, baseScore: 120, hitbox: 'ellipse' },
  clayTarget: { type: 'clayTarget', width: 36, height: 24, baseScore: 200, hitbox: 'ellipse' },
};

/** Normalized "perfect" center zone (fractions of w/h) for bullseye bonuses. */
export const PERFECT_ZONE = { x: 0.3, y: 0.2, width: 0.4, height: 0.6 };

export interface TargetSpawnPoint {
  x: number;
  y: number;
  distance: number;
  allowedTypes: TargetType[];
  scale?: number;
}

export interface ActiveTarget {
  id: string;
  type: TargetType;
  position: Vec2;
  width: number;
  height: number;
  distance: number;
  scoreValue: number;
  active: boolean;
  hit: boolean;
  /** Seconds since round start when hit (for reaction animation). */
  hitAt: number;
  /** Normalized impact point within the target box (0..1). */
  localImpact: Vec2;
  /** Authored tumble state (animated by TargetReactions in Phase 4). */
  reaction: TargetReaction;
}

export interface TargetReaction {
  rotation: number;
  rotationVelocity: number;
  offset: Vec2;
  velocity: Vec2;
}

export function idleReaction(): TargetReaction {
  return { rotation: 0, rotationVelocity: 0, offset: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } };
}
