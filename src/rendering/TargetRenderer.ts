import type { ActiveTarget } from '../targets/TargetDefinitions.ts';
import type { CameraSnapshot } from '../camera/Camera.ts';
import { applyCameraTransform } from './cameraTransform.ts';

// Procedural target sprites (stand-ins for final art). All centered on
// target.position, drawn in world space under the camera transform.
// Hit targets render tipped over; Phase 4 animates the tumble from
// target.reaction instead of this static knocked pose.

export function drawTargets(
  ctx: CanvasRenderingContext2D,
  camera: CameraSnapshot,
  targets: readonly ActiveTarget[],
): void {
  ctx.save();
  applyCameraTransform(ctx, camera);
  for (const t of targets) {
    if (!t.active) continue;
    ctx.save();
    ctx.translate(t.position.x + t.reaction.offset.x, t.position.y + t.reaction.offset.y);
    if (t.hit) {
      ctx.translate(0, t.height * 0.35);
      ctx.rotate(1.75 + t.reaction.rotation);
    } else {
      ctx.rotate(t.reaction.rotation);
    }
    drawSprite(ctx, t);
    ctx.restore();
  }
  ctx.restore();
}

function drawSprite(ctx: CanvasRenderingContext2D, t: ActiveTarget): void {
  const w = t.width;
  const h = t.height;
  switch (t.type) {
    case 'beerCan':
      // Red can, silver lid band, highlight stripe.
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#d5dbdb';
      ctx.fillRect(-w / 2, -h / 2, w, h * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(-w / 2 + w * 0.18, -h / 2, w * 0.16, h);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      break;
    case 'tinCan':
      ctx.fillStyle = '#7f8c9b';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#aab4c0';
      ctx.fillRect(-w / 2, -h / 2, w, h * 0.2);
      ctx.fillRect(-w / 2, h / 2 - h * 0.2, w, h * 0.2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-w / 2 + w * 0.2, -h / 2, w * 0.14, h);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      break;
    case 'glassBottle': {
      // Narrow body + neck.
      const bw = w;
      const bodyH = h * 0.62;
      ctx.fillStyle = '#1e7d46';
      ctx.fillRect(-bw / 2, h / 2 - bodyH, bw, bodyH);
      ctx.beginPath();
      ctx.moveTo(-bw / 2, h / 2 - bodyH);
      ctx.lineTo(-bw * 0.22, -h / 2);
      ctx.lineTo(bw * 0.22, -h / 2);
      ctx.lineTo(bw / 2, h / 2 - bodyH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5d3b22';
      ctx.fillRect(-bw * 0.26, -h / 2 - 6, bw * 0.52, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(-bw / 2 + bw * 0.16, h / 2 - bodyH + 4, bw * 0.16, bodyH - 8);
      ctx.strokeStyle = '#173d26';
      ctx.lineWidth = 3;
      ctx.strokeRect(-bw / 2, h / 2 - bodyH, bw, bodyH);
      break;
    }
    case 'metalPlate':
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a5a5a';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = '#6e7f80';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.18, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'clayTarget':
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.ellipse(0, h * 0.12, w / 2, h * 0.38, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7e5109';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
  }
}
