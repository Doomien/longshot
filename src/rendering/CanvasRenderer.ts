import { drawWorld } from './WorldRenderer.ts';
import { drawScope } from './ScopeRenderer.ts';
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
    drawScope(ctx, frame);
    drawHud(ctx, frame);
    drawDebugOverlay(ctx, frame, this.config);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  ctx.save();
  ctx.fillStyle = 'rgba(240,244,248,0.92)';
  ctx.font = '600 30px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('LONGSHOT — vertical slice', 24, 1040);
  ctx.textAlign = 'right';
  ctx.fillText(`SCOPE ${frame.zoom}x`, 1896, 60);
  ctx.restore();
}
