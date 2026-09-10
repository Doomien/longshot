import type { RenderFrame } from './Renderer.ts';

// Scope presentation (Phase 0 cut): circular optic centered on the aim point,
// darkened surround, thin tube edge, simple crosshair reticle + zoom label.
// Screen-space only — reads camera/aim from the frame, never from live sim
// objects, so a Phaser adapter can reproduce it with masks + graphics.

export const SCOPE_RADIUS_FRACTION = 0.32;

export function scopeRadius(viewportHeight: number): number {
  return viewportHeight * SCOPE_RADIUS_FRACTION;
}

export function drawScope(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  const w = frame.camera.viewportWidth;
  const h = frame.camera.viewportHeight;
  // The optic is centered on the VISIBLE reticle (smoothed + sway + recoil),
  // not the raw mouse — the player sees exactly where the shot will go.
  const cx = frame.reticleScreen.x;
  const cy = frame.reticleScreen.y;
  const r = scopeRadius(h);

  // Darken everything outside the optic.
  ctx.save();
  ctx.fillStyle = 'rgba(4, 6, 9, 0.78)';
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  // Even-odd fill punches the scope hole (supported broadly in Canvas2D).
  ctx.fill('evenodd');
  ctx.restore();

  // Tube edge.
  ctx.save();
  ctx.strokeStyle = '#101418';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(200, 215, 225, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Mild inner vignette ring (readability first — no heavy lens effects).
  const vignette = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Reticle: thin cross + center dot + mil ticks.
  ctx.save();
  ctx.strokeStyle = 'rgba(10, 12, 14, 0.92)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240, 244, 248, 0.9)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  // Tick marks.
  ctx.strokeStyle = 'rgba(240, 244, 248, 0.85)';
  ctx.lineWidth = 2;
  for (const d of [-120, -80, -40, 40, 80, 120]) {
    ctx.beginPath();
    ctx.moveTo(cx + d, cy - 10);
    ctx.lineTo(cx + d, cy + 10);
    ctx.moveTo(cx - 10, cy + d);
    ctx.lineTo(cx + 10, cy + d);
    ctx.stroke();
  }
  // Center dot.
  ctx.fillStyle = 'rgba(200, 30, 30, 0.95)';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Zoom label under the scope.
  ctx.save();
  ctx.fillStyle = 'rgba(240,244,248,0.9)';
  ctx.font = '600 28px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${frame.zoom}x  [wheel/Z/X]`,
    Math.min(Math.max(cx, 140), w - 140),
    Math.min(cy + r + 44, h - 20),
  );
  ctx.restore();
}
