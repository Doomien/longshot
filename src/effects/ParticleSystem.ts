import type { Vec2 } from '../core/types.ts';

// Transient particles: pure data sim (spawn/update/cull), rendering reads the
// list. No canvas imports — a Phaser adapter would map these to its emitter.
// Capped so worst case stays far under the <100 live target in practice.

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export interface BurstOptions {
  count: number;
  speedMin: number;
  speedMax: number;
  /** Upward bias added to initial velocity (world px/s, negative = up). */
  upBias?: number;
  sizeMin: number;
  sizeMax: number;
  lifeMin: number;
  lifeMax: number;
  colors: string[];
  gravity?: number;
}

const MAX_PARTICLES = 240;

export class ParticleSystem {
  private particles: Particle[] = [];

  get list(): readonly Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles.length = 0;
  }

  burst(origin: Vec2, opts: BurstOptions, random: () => number = Math.random): void {
    for (let i = 0; i < opts.count; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const angle = random() * Math.PI * 2;
      const speed = opts.speedMin + random() * (opts.speedMax - opts.speedMin);
      const life = opts.lifeMin + random() * (opts.lifeMax - opts.lifeMin);
      this.particles.push({
        pos: { ...origin },
        vel: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed + (opts.upBias ?? 0),
        },
        life,
        maxLife: life,
        size: opts.sizeMin + random() * (opts.sizeMax - opts.sizeMin),
        color: opts.colors[Math.floor(random() * opts.colors.length)] ?? '#ffffff',
        gravity: opts.gravity ?? 900,
      });
    }
  }

  update(dt: number): void {
    if (dt <= 0) return;
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]!;
      p.life -= dt;
      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      p.vel.y += p.gravity * dt;
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
    }
  }
}
