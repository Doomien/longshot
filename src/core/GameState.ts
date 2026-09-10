import type { Vec2 } from './types.ts';

// High-level round state. Rendering-agnostic: renderers read snapshots,
// they never mutate this.

export type GameMode = 'menu' | 'playing' | 'roundComplete';

export interface GameState {
  mode: GameMode;
  score: number;
  shotsRemaining: number;
  shotsFired: number;
  hits: number;
  streak: number;
  bestStreak: number;
  elapsedTime: number;
}

export function createInitialGameState(totalShots: number, mode: GameMode = 'playing'): GameState {
  return {
    mode,
    score: 0,
    shotsRemaining: totalShots,
    shotsFired: 0,
    hits: 0,
    streak: 0,
    bestStreak: 0,
    elapsedTime: 0,
  };
}

export function accuracyOf(state: GameState): number {
  if (state.shotsFired === 0) return 0;
  return state.hits / state.shotsFired;
}

/** Mouse cursor in screen pixels — rendering input, kept here for debug parity. */
export interface CursorSnapshot {
  screen: Vec2;
  world: Vec2;
}
