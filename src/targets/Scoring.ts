import type { ActiveTarget } from './TargetDefinitions.ts';

// Scoring: target value x distance bonus x streak multiplier, plus center-hit
// and end-of-round accuracy bonuses. Pure logic over plain data — the Game
// owns the running totals, this module owns the formulas. All deterministic.

export const STREAK_STEP = 0.1;
export const STREAK_CAP = 2.0;
export const CENTER_BONUS_MULT = 1.5;

export function distanceMultiplier(distance: number): number {
  return 1 + Math.max(0, distance) / 500;
}

/** Streak multiplier AFTER incrementing: 1 hit -> x1.0, 2 -> x1.1, ... capped. */
export function streakMultiplier(streak: number): number {
  return Math.min(STREAK_CAP, 1 + Math.max(0, streak - 1) * STREAK_STEP);
}

export interface HitScore {
  points: number;
  center: boolean;
}

/** Points for a hit (call after incrementing streak). */
export function scoreForHit(target: ActiveTarget, streak: number, center: boolean): HitScore {
  const points = Math.round(
    target.scoreValue * distanceMultiplier(target.distance) * streakMultiplier(streak) * (center ? CENTER_BONUS_MULT : 1),
  );
  return { points, center };
}

/** End-of-round accuracy bonus: rewards careful shooting over rapid clicks. */
export function accuracyBonus(hits: number, shotsFired: number): number {
  if (shotsFired <= 0) return 0;
  const accuracy = hits / shotsFired;
  if (accuracy >= 0.8) return 400;
  if (accuracy >= 0.6) return 200;
  return 0;
}

/** Longest-streak bonus line item: +50 per hit beyond a 2-streak. */
export function streakBonus(bestStreak: number): number {
  return Math.max(0, bestStreak - 2) * 50;
}
