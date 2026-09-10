import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../core/Config.ts';
import type { Vec2 } from '../core/types.ts';
import { mulberry32 } from '../utils/random.ts';
import { AimController } from './AimController.ts';
import { applyDispersion, spreadWorld } from './DispersionModel.ts';
import { RecoilModel } from './RecoilModel.ts';
import { StabilityModel } from './StabilityModel.ts';
import { swayAmountPixels, swayOffset } from './SwayModel.ts';

const ORIGIN: Vec2 = { x: 2000, y: 1200 };

function makeAim(): AimController {
  return new AimController(DEFAULT_CONFIG, ORIGIN);
}

describe('SwayModel', () => {
  it('is deterministic for the same time', () => {
    expect(swayOffset(3.7, 8)).toEqual(swayOffset(3.7, 8));
  });

  it('scales amplitude with amount and keeps moving while stationary', () => {
    const a = swayOffset(1.0, 4);
    const b = swayOffset(1.0, 8);
    expect(b.x).toBeCloseTo(a.x * 2);
    expect(b.y).toBeCloseTo(a.y * 2);
    expect(swayOffset(1.0, 8)).not.toEqual(swayOffset(2.0, 8));
  });

  it('ranges from base sway (stable) to base*(1+mult) (unstable)', () => {
    expect(swayAmountPixels(8, 1, 1)).toBeCloseTo(8);
    expect(swayAmountPixels(8, 0, 1)).toBeCloseTo(16);
  });
});

describe('StabilityModel', () => {
  it('starts settled and stays settled at rest', () => {
    const s = new StabilityModel();
    s.update(1 / 60, 0, 0.003, 2.2);
    expect(s.value).toBeCloseTo(1);
  });

  it('fast movement drains stability and rest recovers it', () => {
    const s = new StabilityModel();
    for (let i = 0; i < 30; i++) s.update(1 / 60, 4000, 0.003, 2.2);
    expect(s.value).toBeLessThan(0.9);
    for (let i = 0; i < 600; i++) s.update(1 / 60, 0, 0.003, 2.2);
    expect(s.value).toBeCloseTo(1, 2);
  });

  it('clamps to [0, 1] under extreme movement', () => {
    const s = new StabilityModel();
    s.update(1, 1e9, 0.003, 2.2);
    expect(s.value).toBeGreaterThanOrEqual(0);
    expect(s.value).toBeLessThanOrEqual(1);
  });
});

describe('RecoilModel', () => {
  it('kicks upward and decays back to ~zero', () => {
    const r = new RecoilModel();
    r.applyKick(12, 3, mulberry32(7));
    expect(r.offset.y).toBeLessThan(0);
    for (let i = 0; i < 240; i++) r.update(1 / 60, 7);
    expect(Math.abs(r.offset.x)).toBeLessThan(0.05);
    expect(Math.abs(r.offset.y)).toBeLessThan(0.05);
  });
});

describe('DispersionModel', () => {
  it('spread grows as stability drops but stays small', () => {
    const settled = spreadWorld(1.5, 1, 1);
    const shaky = spreadWorld(1.5, 0, 1);
    expect(settled).toBeCloseTo(1.5);
    expect(shaky).toBeCloseTo(3.0);
  });

  it('gaussian impacts cluster near the reticle (seeded)', () => {
    const rng = mulberry32(42);
    let sum = 0;
    let maxAbs = 0;
    for (let i = 0; i < 200; i++) {
      const p = applyDispersion(ORIGIN, 1.5, rng);
      sum += p.x - ORIGIN.x;
      maxAbs = Math.max(maxAbs, Math.abs(p.x - ORIGIN.x));
    }
    expect(sum / 200).toBeLessThan(0.5); // ~zero mean
    expect(maxAbs).toBeLessThan(6); // extreme deviations rare
  });
});

describe('AimController', () => {
  it('converges smoothed aim toward a static desired point', () => {
    const aim = makeAim();
    const target = { x: 2500, y: 1000 };
    for (let i = 0; i < 240; i++) aim.update(1 / 60, target, 2);
    const s = aim.snapshot;
    expect(s.smoothed.x).toBeCloseTo(target.x, 0);
    expect(s.smoothed.y).toBeCloseTo(target.y, 0);
    expect(s.stability).toBeCloseTo(1, 1);
  });

  it('does not snap: one frame moves only partway', () => {
    const aim = makeAim();
    const target = { x: 3000, y: 1200 };
    aim.update(1 / 60, target, 2);
    expect(aim.snapshot.smoothed.x).toBeGreaterThan(ORIGIN.x);
    expect(aim.snapshot.smoothed.x).toBeLessThan(target.x);
  });

  it('is frame-rate independent (60x1/60 ~= 30x1/30)', () => {
    const a = makeAim();
    const b = makeAim();
    const target = { x: 2600, y: 900 };
    for (let i = 0; i < 60; i++) a.update(1 / 60, target, 2);
    for (let i = 0; i < 30; i++) b.update(1 / 30, target, 2);
    expect(a.snapshot.smoothed.x).toBeCloseTo(b.snapshot.smoothed.x, 0);
    expect(a.snapshot.smoothed.y).toBeCloseTo(b.snapshot.smoothed.y, 0);
  });

  it('final reticle = smoothed + sway + recoil, sway magnified by zoom', () => {
    const aim = makeAim();
    aim.update(1 / 60, ORIGIN, 1);
    const low = aim.snapshot;
    aim.update(1 / 60, ORIGIN, 4);
    const high = aim.snapshot;
    // Same pixel sway, smaller world offset at high zoom.
    expect(Math.abs(high.swayWorld.x)).toBeLessThanOrEqual(Math.abs(low.swayWorld.x) + 1e-9);
    const f = high.finalReticle;
    expect(f.x).toBeCloseTo(high.smoothed.x + high.swayWorld.x + high.recoilWorld.x);
  });

  it('firing penalizes stability and kicks the reticle', () => {
    const aim = makeAim();
    for (let i = 0; i < 120; i++) aim.update(1 / 60, ORIGIN, 2);
    expect(aim.snapshot.stability).toBeCloseTo(1, 2);
    aim.applyShotEffects(mulberry32(3));
    const after = aim.snapshot;
    expect(after.stability).toBeLessThan(1);
    aim.update(1 / 60, ORIGIN, 2);
    const kicked = aim.snapshot;
    expect(Math.abs(kicked.recoilWorld.y)).toBeGreaterThan(0);
  });
});
