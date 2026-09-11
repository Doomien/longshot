import { applyCameraTransform } from './cameraTransform.ts';
import type { RenderFrame } from './Renderer.ts';

// Committed backdrop art (review item 5): drawn over the procedural base once
// loaded, so the deployed game shows an illustrated range instead of flat
// color. The procedural scene stays as the loading/error fallback — and as
// the deterministic backdrop for tests, which never load images.

let bgCache: { src: string; img: HTMLImageElement; ready: boolean } | null = null;

function backgroundImage(src: string | null): HTMLImageElement | null {
  if (!src || typeof Image === 'undefined') return null;
  if (!bgCache || bgCache.src !== src) {
    const img = new Image();
    const entry = { src, img, ready: false };
    bgCache = entry;
    img.onload = () => {
      entry.ready = true;
    };
    img.src = src;
  }
  return bgCache.ready ? bgCache.img : null;
}

// Procedural placeholder background (Phase 0 stand-in for the illustrated
// range art). Drawn fully in world coordinates under the camera transform so
// panning/zooming the camera visibly moves across it. Deterministic shapes —
// no RNG — so screenshots and playtests are reproducible.

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  frame: RenderFrame,
): void {
  const { camera, worldWidth: W, worldHeight: H } = frame;

  ctx.save();
  applyCameraTransform(ctx, camera);

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#87b5d6');
  sky.addColorStop(1, '#c9d9c4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Distant ridge.
  ctx.fillStyle = '#8a8f7a';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  const ridgePeaks = [0.42, 0.5, 0.46, 0.52, 0.44, 0.5, 0.47];
  const steps = ridgePeaks.length;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const peak = ridgePeaks[i % steps] ?? 0.48;
    ctx.lineTo(x, H * peak);
  }
  ctx.lineTo(W, H * 0.55);
  ctx.closePath();
  ctx.fill();

  // Ground.
  const ground = ctx.createLinearGradient(0, H * 0.55, 0, H);
  ground.addColorStop(0, '#a08b5f');
  ground.addColorStop(1, '#7a6746');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Survey grid every 256 world px (makes motion + zoom readable).
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2 / camera.zoom;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 256) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += 256) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();

  // Landmark props (fixed world positions — future spawn-point anchors).
  // Barn.
  drawBarn(ctx, W * 0.22, H * 0.62);
  // Truck silhouette.
  drawTruck(ctx, W * 0.58, H * 0.72);
  // Fence-post row.
  ctx.fillStyle = '#5d4a33';
  for (let i = 0; i < 12; i++) {
    const x = W * 0.08 + i * ((W * 0.84) / 11);
    ctx.fillRect(x, H * 0.66, 14, 90);
  }
  ctx.fillRect(W * 0.08, H * 0.68, W * 0.84, 10);
  // Barrels.
  drawBarrel(ctx, W * 0.78, H * 0.8);
  drawBarrel(ctx, W * 0.82, H * 0.8);

  // Committed art covers the procedural base once loaded (fallback stays).
  const bg = backgroundImage(frame.background);
  if (bg) {
    ctx.drawImage(bg, 0, 0, W, H);
  }

  // World border.
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, W, H);

  ctx.restore();
}

function drawBarn(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#7e3b2e';
  ctx.fillRect(x, y, 320, 200);
  ctx.fillStyle = '#5d2b21';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 160, y - 110);
  ctx.lineTo(x + 320, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8dcc3';
  ctx.fillRect(x + 130, y + 80, 60, 120);
}

function drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#4a5a6a';
  ctx.fillRect(x, y, 260, 90);
  ctx.fillRect(x + 190, y - 60, 110, 60);
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(x + 60, y + 90, 28, 0, Math.PI * 2);
  ctx.arc(x + 230, y + 90, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarrel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#6e7b8b';
  ctx.fillRect(x, y - 90, 56, 90);
  ctx.fillStyle = '#59616e';
  ctx.fillRect(x, y - 70, 56, 10);
  ctx.fillRect(x, y - 35, 56, 10);
}
