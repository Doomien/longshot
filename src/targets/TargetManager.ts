import {
  TARGET_DEFINITIONS,
  idleReaction,
  type ActiveTarget,
  type TargetType,
} from './TargetDefinitions.ts';
import { isCenterHit, pointInTarget, worldToLocal } from './HitDetection.ts';
import { BACK_FORTY, type LevelDefinition } from '../levels/LevelDefinition.ts';
import { selectSpawnPoints } from './SpawnPoints.ts';
import type { Vec2 } from '../core/types.ts';
import { mulberry32, type Rng } from '../utils/random.ts';

// Owns live targets: session spawn, hit queries, hit state. Rendering and
// scoring read from here; reactions are animated in Phase 4 from the stored
// localImpact + hitAt. Firing order (Game.fireShot): impact -> findHit ->
// markHit -> scoring -> recoil.

export interface HitResult {
  target: ActiveTarget;
  local: Vec2;
  center: boolean;
}

export class TargetManager {
  private targets: ActiveTarget[] = [];

  constructor(
    private levelDef: LevelDefinition = BACK_FORTY,
    private readonly targetsPerRound = 8,
  ) {
    this.reset(Date.now());
  }

  get all(): readonly ActiveTarget[] {
    return this.targets;
  }

  get level(): LevelDefinition {
    return this.levelDef;
  }

  get remaining(): number {
    return this.targets.filter((t) => t.active && !t.hit).length;
  }

  reset(seed: number): void {
    const rng = mulberry32(seed);
    const dealt = selectSpawnPoints(this.levelDef, this.targetsPerRound, rng);
    this.targets = dealt.map(({ point: p, index }, i) => {
      const type = pickType(p.allowedTypes, rng, i);
      const def = TARGET_DEFINITIONS[type];
      const scale = p.scale ?? 1;
      return {
        id: `${type}_${i}`,
        type,
        position: { x: p.x, y: p.y },
        width: def.width * scale,
        height: def.height * scale,
        distance: p.distance,
        scoreValue: def.baseScore,
        spawnIndex: index,
        active: true,
        hit: false,
        hitAt: 0,
        localImpact: { x: 0.5, y: 0.5 },
        reaction: idleReaction(),
      } satisfies ActiveTarget;
    });
  }

  /** Topmost unhit target containing the world point, or null. */
  findHit(impact: Vec2): ActiveTarget | null {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i]!;
      if (t.active && !t.hit && pointInTarget(impact.x, impact.y, t)) return t;
    }
    return null;
  }

  /**
   * Add a live target (scene editor): appends a spawn point to the level so
   * the addition survives restarts and exports.
   */
  spawn(
    type: TargetType,
    position: Vec2,
    opts: { distance?: number; scale?: number } = {},
  ): ActiveTarget {
    const def = TARGET_DEFINITIONS[type];
    const scale = opts.scale ?? 1;
    const distance = opts.distance ?? 240;
    const spawnIndex =
      this.levelDef.spawnPoints.push({
        x: Math.round(position.x),
        y: Math.round(position.y),
        distance,
        allowedTypes: [type],
        scale,
      }) - 1;
    const target: ActiveTarget = {
      id: `${type}_edit${spawnIndex}`,
      type,
      position: { x: position.x, y: position.y },
      width: def.width * scale,
      height: def.height * scale,
      distance,
      scoreValue: def.baseScore,
      spawnIndex,
      active: true,
      hit: false,
      hitAt: 0,
      localImpact: { x: 0.5, y: 0.5 },
      reaction: idleReaction(),
    };
    this.targets.push(target);
    return target;
  }

  /** Record a hit with localized impact; returns center-hit flag. */
  markHit(target: ActiveTarget, impact: Vec2, nowSeconds: number): HitResult {
    const local = worldToLocal(target, impact);
    const center = isCenterHit(local);
    target.hit = true;
    target.hitAt = nowSeconds;
    target.localImpact = local;
    // Seed the tumble direction from impact side (animated in Phase 4):
    // edge hits spin, center hits launch straight back.
    const side = local.x - 0.5;
    target.reaction.rotationVelocity = side * 14;
    target.reaction.velocity = { x: side * 260, y: -180 };
    return { target, local, center };
  }
}

function pickType(allowed: TargetType[], rng: Rng, _index: number): TargetType {
  if (allowed.length === 0) return 'beerCan';
  if (allowed.length === 1) return allowed[0]!;
  return allowed[Math.floor(rng() * allowed.length) % allowed.length] ?? allowed[0]!;
}
