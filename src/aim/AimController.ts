import type { GameConfig } from '../core/Config.ts';
import type { Vec2 } from '../core/types.ts';
import { length, smoothingFactor } from '../utils/math.ts';
import type { Rng } from '../utils/random.ts';
import { applyDispersion, spreadWorld } from './DispersionModel.ts';
import { RecoilModel } from './RecoilModel.ts';
import { StabilityModel } from './StabilityModel.ts';
import { swayAmountPixels, swayOffset } from './SwayModel.ts';

// Aim pipeline (proposal section 7):
//   desired (world) -> follow inertia -> smoothed + stability -> sway ->
//   + recoil -> final reticle -> (+ dispersion at fire time) -> impact.
// Pure sim: no input/DOM/camera imports. Game feeds desiredWorld + zoom and
// reads the snapshot. A future engine adapter drives these same methods.

export interface AimSnapshot {
  smoothed: Vec2;
  swayWorld: Vec2;
  recoilWorld: Vec2;
  finalReticle: Vec2;
  stability: number;
  mouseSpeed: number;
  swayPixels: number;
  spreadWorld: number;
}

export class AimController {
  private readonly stability = new StabilityModel();
  private readonly recoil = new RecoilModel();
  private smoothed: Vec2;
  private previousDesired: Vec2 | null = null;
  private swayTime = 0;
  private lastZoom = 1;
  private last: AimSnapshot;

  constructor(
    private readonly config: GameConfig,
    startWorld: Vec2,
  ) {
    this.smoothed = { ...startWorld };
    this.last = {
      smoothed: { ...startWorld },
      swayWorld: { x: 0, y: 0 },
      recoilWorld: { x: 0, y: 0 },
      finalReticle: { ...startWorld },
      stability: 1,
      mouseSpeed: 0,
      swayPixels: 0,
      spreadWorld: 0,
    };
  }

  get snapshot(): AimSnapshot {
    return {
      ...this.last,
      smoothed: { ...this.last.smoothed },
      swayWorld: { ...this.last.swayWorld },
      recoilWorld: { ...this.last.recoilWorld },
      finalReticle: { ...this.last.finalReticle },
    };
  }

  update(dt: number, desiredWorld: Vec2, zoom: number): void {
    const aimCfg = this.config.aim;

    // First frame: anchor velocity reference to the desired point so spawn
    // never injects a bogus speed spike (and never snaps the smoothed aim).
    if (this.previousDesired === null) {
      this.previousDesired = { ...desiredWorld };
    }

    let speed = 0;
    if (dt > 0) {
      const vx = (desiredWorld.x - this.previousDesired.x) / dt;
      const vy = (desiredWorld.y - this.previousDesired.y) / dt;
      speed = length(vx, vy);
      const follow = smoothingFactor(aimCfg.followSpeed, dt);
      this.smoothed.x += (desiredWorld.x - this.smoothed.x) * follow;
      this.smoothed.y += (desiredWorld.y - this.smoothed.y) * follow;
      this.swayTime += dt * aimCfg.swaySpeed;
    }
    this.previousDesired = { ...desiredWorld };

    this.stability.update(dt, speed, aimCfg.movementInstability, aimCfg.stabilityRecovery);
    this.recoil.update(dt, this.config.shooting.recoilDecayRate);
    this.lastZoom = zoom > 0 ? zoom : 1;
    this.refresh(speed);
  }

  /** Fire-time effects: recoil kick + stability penalty. Call AFTER resolving impact. */
  applyShotEffects(rng?: Rng): void {
    const shootCfg = this.config.shooting;
    this.recoil.applyKick(shootCfg.recoilKick, shootCfg.recoilSideVariance, rng);
    this.stability.penalize(shootCfg.postShotStability);
    // Refresh so readers see the kick/penalty immediately, not next frame.
    this.refresh(this.last.mouseSpeed);
  }

  /** Impact point for the current reticle position with hidden dispersion. */
  impactPoint(rng?: Rng): Vec2 {
    return applyDispersion(this.last.finalReticle, this.last.spreadWorld, rng);
  }

  /** Recompose the snapshot from current smoothed/sway/recoil/stability. */
  private refresh(mouseSpeed: number): void {
    const aimCfg = this.config.aim;
    const shootCfg = this.config.shooting;
    const swayPx = swayAmountPixels(
      aimCfg.baseSwayPixels,
      this.stability.value,
      aimCfg.instabilitySwayMultiplier,
    );
    const swayPxVec = swayOffset(this.swayTime, swayPx);
    const swayWorld = { x: swayPxVec.x / this.lastZoom, y: swayPxVec.y / this.lastZoom };
    const recoilPx = this.recoil.offset;
    const recoilWorld = { x: recoilPx.x / this.lastZoom, y: recoilPx.y / this.lastZoom };
    const spread = spreadWorld(
      shootCfg.baseDispersion,
      this.stability.value,
      shootCfg.stabilitySpreadFactor,
    );

    this.last = {
      smoothed: { ...this.smoothed },
      swayWorld,
      recoilWorld,
      finalReticle: {
        x: this.smoothed.x + swayWorld.x + recoilWorld.x,
        y: this.smoothed.y + swayWorld.y + recoilWorld.y,
      },
      stability: this.stability.value,
      mouseSpeed,
      swayPixels: swayPx,
      spreadWorld: spread,
    };
  }
}
