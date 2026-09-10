import type { CameraSnapshot } from '../camera/Camera.ts';
import { applyCameraTransform } from './cameraTransform.ts';
import type { Particle } from '../effects/ParticleSystem.ts';
import type { ScorePopup } from '../effects/ScorePopups.ts';

// World-space transient rendering: particles + floating score text, drawn
// after targets and before the scope overlay (proposal section 38 order).

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  camera: CameraSnapshot,
  particles: readonly Particle[],
): void {
  if (particles.length === 0) return;
  ctx.save();
  applyCameraTransform(ctx, camera);
  for (const p of particles) {
    const fade = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = fade;
    ctx.fillStyle = p.color;
    const size = Math.max(0.5, p.size * (0.4 + 0.6 * fade));
    ctx.fillRect(p.pos.x - size / 2, p.pos.y - size / 2, size, size);
  }
  ctx.restore();
}

export function drawPopups(
  ctx: CanvasRenderingContext2D,
  camera: CameraSnapshot,
  popups: readonly ScorePopup[],
): void {
  if (popups.length === 0) return;
  ctx.save();
  applyCameraTransform(ctx, camera);
  ctx.textAlign = 'center';
  for (const p of popups) {
    const fade = Math.max(0, p.ttl / p.maxTtl);
    ctx.globalAlpha = Math.min(1, fade * 1.5);
    ctx.font = '700 34px ui-monospace, Menlo, monospace';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(5, 8, 10, 0.9)';
    ctx.strokeText(p.text, p.pos.x, p.pos.y);
    ctx.fillStyle = '#ffe66d';
    ctx.fillText(p.text, p.pos.x, p.pos.y);
  }
  ctx.restore();
}
