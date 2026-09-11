import { describe, expect, it } from 'vitest';
import { BACK_FORTY } from '../levels/LevelDefinition.ts';
import { mulberry32 } from '../utils/random.ts';
import {
  isCenterHit,
  pointInRect,
  pointInTarget,
  worldToLocal,
} from './HitDetection.ts';
import { accuracyBonus, distanceMultiplier, scoreForHit, streakBonus, streakMultiplier } from './Scoring.ts';
import { selectSpawnPoints, shuffle } from './SpawnPoints.ts';
import { TARGET_DEFINITIONS, type ActiveTarget } from './TargetDefinitions.ts';
import { TargetManager } from './TargetManager.ts';

function makeTarget(overrides: Partial<ActiveTarget> = {}): ActiveTarget {
  return {
    id: 'beerCan_0',
    type: 'beerCan',
    position: { x: 1000, y: 1000 },
    width: 44,
    height: 54,
    distance: 250,
    scoreValue: 100,
    spawnIndex: 0,
    active: true,
    hit: false,
    hitAt: 0,
    localImpact: { x: 0.5, y: 0.5 },
    reaction: {
      rotation: 0,
      rotationVelocity: 0,
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    },
    ...overrides,
  };
}

describe('HitDetection', () => {
  it('hits center, edge; misses outside', () => {
    const t = makeTarget();
    expect(pointInTarget(1000, 1000, t)).toBe(true);
    expect(pointInTarget(1000 + 22, 1000, t)).toBe(true); // ellipse edge
    expect(pointInTarget(1000 + 23, 1000, t)).toBe(false);
    expect(pointInTarget(1000, 1000 - 27, t)).toBe(true);
    expect(pointInTarget(500, 500, t)).toBe(false);
  });

  it('rect helper matches box bounds', () => {
    const t = makeTarget();
    expect(pointInRect(1000, 1000, t)).toBe(true);
    expect(pointInRect(1000 + 22, 1000 + 27, t)).toBe(true);
    expect(pointInRect(1000 + 23, 1000, t)).toBe(false);
  });

  it('local coords center on 0.5,0.5 and detect bullseye', () => {
    const t = makeTarget();
    expect(worldToLocal(t, { x: 1000, y: 1000 })).toEqual({ x: 0.5, y: 0.5 });
    expect(isCenterHit({ x: 0.5, y: 0.5 })).toBe(true);
    expect(isCenterHit({ x: 0.05, y: 0.5 })).toBe(false);
    expect(isCenterHit({ x: 0.5, y: 0.95 })).toBe(false);
  });
});

describe('Scoring', () => {
  it('computes base x distance x streak', () => {
    const t = makeTarget({ scoreValue: 100, distance: 250 });
    // 100 * 1.5 (distance) * 1.0 (first-hit streak) = 150
    expect(scoreForHit(t, 1, false).points).toBe(150);
    expect(distanceMultiplier(250)).toBeCloseTo(1.5);
    expect(streakMultiplier(1)).toBeCloseTo(1.0);
    expect(streakMultiplier(3)).toBeCloseTo(1.2);
  });

  it('caps the streak multiplier and boosts center hits', () => {
    expect(streakMultiplier(100)).toBeCloseTo(2.0);
    const t = makeTarget({ scoreValue: 100, distance: 0 });
    expect(scoreForHit(t, 1, true).points).toBe(150);
  });

  it('tiers the accuracy bonus', () => {
    expect(accuracyBonus(8, 10)).toBe(400);
    expect(accuracyBonus(6, 10)).toBe(200);
    expect(accuracyBonus(5, 10)).toBe(0);
    expect(accuracyBonus(0, 0)).toBe(0);
  });

  it('pays the streak bonus only beyond a 2-streak', () => {
    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(2)).toBe(0);
    expect(streakBonus(3)).toBe(50);
    expect(streakBonus(5)).toBe(150);
  });
});

describe('SpawnPoints', () => {
  it('is deterministic per seed and honors count', () => {
    const a = selectSpawnPoints(BACK_FORTY, 8, mulberry32(11));
    const b = selectSpawnPoints(BACK_FORTY, 8, mulberry32(11));
    expect(a).toEqual(b);
    expect(a).toHaveLength(8);
    expect(selectSpawnPoints(BACK_FORTY, 99, mulberry32(11))).toHaveLength(
      BACK_FORTY.spawnPoints.length,
    );
  });

  it('shuffles without losing or duplicating entries', () => {
    const shuffled = shuffle([1, 2, 3, 4, 5], mulberry32(5));
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('TargetManager', () => {
  it('spawns a session with unique ids and sane sizes', () => {
    const mgr = new TargetManager(BACK_FORTY, 8);
    mgr.reset(99);
    expect(mgr.all).toHaveLength(8);
    expect(new Set(mgr.all.map((t) => t.id)).size).toBe(8);
    for (const t of mgr.all) {
      const def = TARGET_DEFINITIONS[t.type];
      expect(t.width).toBeGreaterThan(0);
      expect(t.height).toBeGreaterThan(0);
      expect(t.scoreValue).toBe(def.baseScore);
    }
  });

  it('finds hits at target centers and records localized impacts', () => {
    const mgr = new TargetManager(BACK_FORTY, 8);
    mgr.reset(7);
    const first = mgr.all[0]!;
    const found = mgr.findHit({ x: first.position.x, y: first.position.y });
    expect(found?.id).toBe(first.id);
    expect(mgr.findHit({ x: -100, y: -100 })).toBeNull();
    const res = mgr.markHit(first, { x: first.position.x, y: first.position.y }, 3.5);
    expect(res.center).toBe(true);
    expect(first.hit).toBe(true);
    expect(mgr.remaining).toBe(7);
    // Hit targets no longer match.
    expect(mgr.findHit({ x: first.position.x, y: first.position.y })).toBeNull();
  });
});
