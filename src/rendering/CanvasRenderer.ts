import { drawWorld } from './WorldRenderer.ts';
import { drawScope } from './ScopeRenderer.ts';
import { drawTargets } from './TargetRenderer.ts';
import { drawParticles, drawPopups } from './EffectsRenderer.ts';
import { drawDebugOverlay } from './DebugOverlay.ts';
import type { GameConfig } from '../core/Config.ts';
import type { Viewport } from '../core/ResizeHandler.ts';
import type { IRenderer, RenderFrame } from './Renderer.ts';

// Canvas 2D implementation of IRenderer. Owns all ctx access: no other module
// touches the context, which keeps the Phaser seam to this single class.
// Render order per architecture/overview.md: world -> scope -> HUD/debug.

export class CanvasRenderer implements IRenderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly viewport: () => Viewport,
    private readonly config: GameConfig,
  ) {}

  render(frame: RenderFrame): void {
    const vp = this.viewport();
    const ctx = this.ctx;
    // Logical-space drawing: scale backing store down to 1920x1080 units.
    ctx.setTransform(vp.scale, 0, 0, vp.scale, 0, 0);
    ctx.fillStyle = '#0b0e12';
    ctx.fillRect(0, 0, frame.camera.viewportWidth, frame.camera.viewportHeight);

    drawWorld(ctx, frame);
    drawTargets(ctx, frame.camera, frame.targets);
    drawParticles(ctx, frame.camera, frame.particles);
    drawPopups(ctx, frame.camera, frame.popups);
    drawScope(ctx, frame);
    drawHud(ctx, frame);
    drawDebugOverlay(ctx, frame, this.config);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  const { hud } = frame;
  ctx.save();
  ctx.fillStyle = 'rgba(240,244,248,0.92)';
  ctx.font = '600 30px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${hud.score}`, 24, 60);
  ctx.fillText(hud.streak > 1 ? `STREAK x${hud.streak}` : '', 24, 100);
  ctx.textAlign = 'right';
  ctx.fillText(`SHOTS ${hud.shotsRemaining}/${hud.shotsTotal}`, 1896, 60);
  ctx.fillText(`SCOPE ${frame.zoom}x${hud.muted ? '  MUTED' : ''}`, 1896, 100);
  ctx.restore();

  if (hud.mode === 'roundComplete') {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 9, 0.72)';
    ctx.fillRect(0, 0, frame.camera.viewportWidth, frame.camera.viewportHeight);
    ctx.fillStyle = '#f2f5f7';
    ctx.textAlign = 'center';
    ctx.font = '700 64px ui-monospace, Menlo, monospace';
    ctx.fillText('ROUND COMPLETE', frame.camera.viewportWidth / 2, 460);
    ctx.font = '500 40px ui-monospace, Menlo, monospace';
    ctx.fillText(`SCORE  ${hud.score}`, frame.camera.viewportWidth / 2, 540);
    ctx.fillText('Press R to shoot again', frame.camera.viewportWidth / 2, 620);
    ctx.restore();
  }
}
