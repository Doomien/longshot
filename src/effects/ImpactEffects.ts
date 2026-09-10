import type { Vec2 } from '../core/types.ts';
import type { TargetType } from '../targets/TargetDefinitions.ts';
import { ParticleSystem } from './ParticleSystem.ts';

// Impact looks per surface (proposal section 25). MVP uses generic dust for
// misses; hits vary spark/shard color by target material. Regions (dirt/wood/
// metal) arrive with environment art in Phase 6.

export function spawnHitBurst(
  particles: ParticleSystem,
  impact: Vec2,
  type: TargetType,
  random: () => number = Math.random,
): void {
  switch (type) {
    case 'glassBottle':
      particles.burst(impact, {
        count: 22, speedMin: 120, speedMax: 520, upBias: -120,
        sizeMin: 2, sizeMax: 6, lifeMin: 0.3, lifeMax: 0.8,
        colors: ['#bff0c8', '#eafff0', '#4fae6a', '#ffffff'],
        gravity: 1100,
      }, random);
      break;
    case 'clayTarget':
      particles.burst(impact, {
        count: 26, speedMin: 140, speedMax: 560, upBias: -100,
        sizeMin: 2, sizeMax: 7, lifeMin: 0.3, lifeMax: 0.9,
        colors: ['#e67e22', '#f5b041', '#7e5109', '#ffffff'],
        gravity: 1100,
      }, random);
      break;
    default:
      // Cans + plates: hot sparks + a few gray flecks.
      particles.burst(impact, {
        count: 18, speedMin: 160, speedMax: 620, upBias: -80,
        sizeMin: 2, sizeMax: 5, lifeMin: 0.2, lifeMax: 0.6,
        colors: ['#ffe66d', '#ffffff', '#f0a832', '#9aa5ad'],
        gravity: 1000,
      }, random);
      break;
  }
}

export function spawnMissPuff(
  particles: ParticleSystem,
  impact: Vec2,
  random: () => number = Math.random,
): void {
  particles.burst(impact, {
    count: 10, speedMin: 40, speedMax: 200, upBias: -140,
    sizeMin: 4, sizeMax: 10, lifeMin: 0.4, lifeMax: 1.0,
    colors: ['#b8a888', '#8a7a5f', '#cbbf9f'],
    gravity: 260,
  }, random);
}
