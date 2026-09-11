import type { CameraSnapshot } from '../camera/Camera.ts';
import type { GameMode } from '../core/GameState.ts';
import type { Particle } from '../effects/ParticleSystem.ts';
import type { ScorePopup } from '../effects/ScorePopups.ts';
import type { ActiveTarget } from '../targets/TargetDefinitions.ts';
import type { Vec2 } from '../core/types.ts';

// Renderer seam: the sim produces an immutable RenderFrame every tick; any
// renderer (Canvas 2D today, a Phaser Scene adapter tomorrow) consumes it.
// Nothing in sim/aim/targets may import Canvas or Phaser types — only this
// frame. To bolt on Phaser later: implement IRenderer with a Phaser.Scene
// that reads the same frame (camera snapshot, aim, debug) and draws with
// Phaser.GameObjects instead of ctx calls. No sim re-thought required.

export interface RenderFrame {
  camera: CameraSnapshot;
  worldWidth: number;
  worldHeight: number;
  /** Committed backdrop art path (public/), or null for procedural only. */
  background: string | null;
  /** Raw mouse point in logical screen coords (input intent, pre-smoothing). */
  aimScreen: Vec2;
  /** Raw mouse point resolved to world coords. */
  aimWorld: Vec2;
  /** Visible reticle in logical screen coords (smoothed + sway + recoil). */
  reticleScreen: Vec2;
  /** Visible reticle in world coords — the point shots resolve from. */
  reticleWorld: Vec2;
  /** Settling state 0..1 (1 = fully settled). */
  stability: number;
  /** Current sway amplitude, screen pixels. */
  swayPixels: number;
  /** Current hidden dispersion radius, world units. */
  spreadWorld: number;
  /** Live targets (references are read-only for renderers). */
  targets: readonly ActiveTarget[];
  /** Live particles (read-only). */
  particles: readonly Particle[];
  /** Floating score popups (read-only). */
  popups: readonly ScorePopup[];
  /** Last resolved shot, if any this round. */
  lastShot: { impact: Vec2; hit: boolean; points: number; center: boolean } | null;
  hud: {
    mode: GameMode;
    score: number;
    shotsRemaining: number;
    shotsTotal: number;
    streak: number;
    muted: boolean;
    paused: boolean;
    accuracy: number;
    hits: number;
    bestStreak: number;
    bestScore: number;
    roundBonus: number;
    roundStreakBonus: number;
    centerHits: number;
    isNewBest: boolean;
    nearestDistance: number | null;
  };
  zoom: number;
  zoomLevels: number[];
  fps: number;
  elapsed: number;
  debugVisible: boolean;
}

export interface IRenderer {
  render(frame: RenderFrame): void;
}
