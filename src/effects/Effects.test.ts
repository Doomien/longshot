import { describe, expect, it } from 'vitest';
import { AudioManager } from '../audio/AudioManager.ts';
import { spawnHitBurst, spawnMissPuff } from './ImpactEffects.ts';
import { ParticleSystem } from './ParticleSystem.ts';
import { ScorePopups } from './ScorePopups.ts';
import { ScreenShake } from './ScreenShake.ts';
import { updateTargetReactions } from './TargetReactions.ts';
import type { ActiveTarget } from '../targets/TargetDefinitions.ts';
import { mulberry32 } from '../utils/random.ts';

function makeTarget(): ActiveTarget {
  return {
    id: 'beerCan_0',
    type: 'beerCan',
    position: { x: 1000, y: 1000 },
    width: 44,
    height: 54,
    distance: 200,
    scoreValue: 100,
    active: true,
    hit: true,
    hitAt: 0,
    localImpact: { x: 0.7, y: 0.5 },
    reaction: {
      rotation: 0,
      rotationVelocity: 2.8,
      offset: { x: 0, y: 0 },
      velocity: { x: 52, y: -180 },
    },
  };
}

describe('ParticleSystem', () => {
  it('spawns, integrates, and culls dead particles', () => {
    const ps = new ParticleSystem();
    ps.burst({ x: 0, y: 0 }, {
      count: 10, speedMin: 100, speedMax: 100, sizeMin: 2, sizeMax: 2,
      lifeMin: 0.5, lifeMax: 0.5, colors: ['#fff'], gravity: 0,
    }, mulberry32(1));
    expect(ps.list).toHaveLength(10);
    ps.update(0.25);
    expect(ps.list).toHaveLength(10);
    expect(ps.list[0]!.pos.x).not.toBeCloseTo(0);
    ps.update(1.0);
    expect(ps.list).toHaveLength(0);
  });

  it('caps live particles under burst spam', () => {
    const ps = new ParticleSystem();
    for (let i = 0; i < 10; i++) {
      spawnHitBurst(ps, { x: 0, y: 0 }, 'beerCan', mulberry32(i));
      spawnMissPuff(ps, { x: 0, y: 0 }, mulberry32(i + 100));
    }
    expect(ps.list.length).toBeLessThanOrEqual(240);
  });
});

describe('TargetReactions', () => {
  it('launches, spins, and settles hit targets; ignores unhit ones', () => {
    const hit = makeTarget();
    const calm = { ...makeTarget(), hit: false };
    updateTargetReactions([hit, calm], 1 / 60);
    expect(hit.reaction.offset.y).toBeLessThan(0); // launched upward first
    expect(hit.reaction.rotation).toBeGreaterThan(0);
    expect(calm.reaction.offset).toEqual({ x: 0, y: 0 });
    // After a long fall the target rests on its floor plane.
    for (let i = 0; i < 600; i++) updateTargetReactions([hit], 1 / 60);
    expect(hit.reaction.offset.y).toBeCloseTo(hit.height * 0.35);
  });
});

describe('ScorePopups', () => {
  it('rises and expires', () => {
    const popups = new ScorePopups();
    popups.add({ x: 0, y: 0 }, '+150');
    expect(popups.list).toHaveLength(1);
    popups.update(0.5);
    expect(popups.list[0]!.pos.y).toBeLessThan(0);
    popups.update(1.0);
    expect(popups.list).toHaveLength(0);
  });
});

describe('ScreenShake', () => {
  it('is still at rest, kicks on trauma, and decays', () => {
    const shake = new ScreenShake();
    const rest = shake.offset(1.0);
    expect(Math.abs(rest.x) + Math.abs(rest.y)).toBeCloseTo(0);
    shake.add(0.5);
    const kicked = shake.offset(1.0);
    expect(Math.abs(kicked.x) + Math.abs(kicked.y)).toBeGreaterThan(0);
    for (let i = 0; i < 600; i++) shake.update(1 / 60);
    const settled = shake.offset(99.0);
    expect(Math.abs(settled.x) + Math.abs(settled.y)).toBeLessThan(0.01);
  });
});

describe('AudioManager', () => {
  it('is a safe no-op without a browser AudioContext', () => {
    const audio = new AudioManager();
    expect(() => {
      audio.play('fire');
      audio.play('metal');
      audio.play('glass');
      audio.play('clay');
      audio.play('dirt');
      audio.play('score');
      audio.play('round');
    }).not.toThrow();
    expect(audio.toggleMute()).toBe(true);
    expect(audio.isMuted).toBe(true);
  });
});
