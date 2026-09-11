// Centralized tunable gameplay constants (Standing Rule: config centralization).
// Nothing outside this module should hard-code tuning numbers; systems receive
// the slices they need via constructor params. Pure data + JSON export so the
// F1 debug overlay / tuning panel and a future Phaser adapter read the same source.

export interface AimConfig {
  followSpeed: number;
  baseSwayPixels: number;
  swaySpeed: number;
  movementInstability: number;
  stabilityRecovery: number;
  /** Sway amplitude multiplier at zero stability (1.0 -> 2x base sway). */
  instabilitySwayMultiplier: number;
}

export interface ShootingConfig {
  baseDispersion: number;
  /** Extra spread at zero stability, as a multiple of baseDispersion. */
  stabilitySpreadFactor: number;
  recoilKick: number;
  /** Random sideways recoil, screen pixels (stddev). */
  recoilSideVariance: number;
  /** Exponential recoil recovery rate (1/s). */
  recoilDecayRate: number;
  /** Stability multiplier applied when a shot is fired. */
  postShotStability: number;
}

export interface ScopeConfig {
  zoomLevels: number[];
  defaultZoom: number;
}

export interface RoundConfig {
  shots: number;
}

export interface WorldConfig {
  width: number;
  height: number;
}

export interface CameraConfig {
  /** Exponential pan rate toward the mouse-derived target (1/s). */
  panSpeed: number;
}

export interface GameConfig {
  aim: AimConfig;
  shooting: ShootingConfig;
  scope: ScopeConfig;
  round: RoundConfig;
  world: WorldConfig;
  camera: CameraConfig;
}

export const DEFAULT_CONFIG: GameConfig = {
  aim: {
    followSpeed: 10,
    baseSwayPixels: 8,
    swaySpeed: 1,
    movementInstability: 0.003,
    stabilityRecovery: 2.2,
    instabilitySwayMultiplier: 1.0,
  },
  shooting: {
    baseDispersion: 1.5,
    stabilitySpreadFactor: 1.0,
    recoilKick: 12,
    recoilSideVariance: 3,
    recoilDecayRate: 7,
    postShotStability: 0.55,
  },
  scope: {
    zoomLevels: [1, 2, 4],
    defaultZoom: 2,
  },
  round: {
    shots: 10,
  },
  world: {
    width: 4096,
    height: 2304,
  },
  camera: {
    panSpeed: 6,
  },
};

/** Serialize current tuning for the debug panel "export JSON" action. */
export function configToJson(config: GameConfig): string {
  return JSON.stringify(config, null, 2);
}
