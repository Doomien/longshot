import { drawWorld } from './WorldRenderer.ts';
import { drawScope } from './ScopeRenderer.ts';
import { drawTargets, drawTargetDebug } from './TargetRenderer.ts';
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
    if (frame.debugVisible || frame.hud.editing) {
      drawTargetDebug(ctx, frame.camera, frame.targets);
    }
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
  ctx.fillText(hud.nearestDistance !== null ? `DIST ${hud.nearestDistance}` : '', 24, 140);
  ctx.fillText(`${hud.levelIndex + 1}/${hud.levelCount} ${hud.levelName}`, 24, 180);
  if (hud.editing) {
    ctx.fillStyle = '#ffe66d';
    ctx.fillText('EDIT MODE — drag to move · right-click deletes', 24, 220);
  }
  ctx.textAlign = 'right';
  ctx.fillText(`SHOTS ${hud.shotsRemaining}/${hud.shotsTotal}`, 1896, 60);
  ctx.fillText(`SCOPE ${frame.zoom}x${hud.muted ? '  MUTED' : ''}`, 1896, 100);
  ctx.restore();

  if (hud.mode === 'menu') {
    drawMenu(ctx, frame);
  } else if (hud.mode === 'roundComplete') {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 9, 0.72)';
    ctx.fillRect(0, 0, frame.camera.viewportWidth, frame.camera.viewportHeight);
    ctx.fillStyle = '#f2f5f7';
    ctx.textAlign = 'center';
    const cx = frame.camera.viewportWidth / 2;
    ctx.font = '700 64px ui-monospace, Menlo, monospace';
    ctx.fillText('ROUND COMPLETE', cx, 400);
    if (hud.isNewBest) {
      ctx.fillStyle = '#ffe66d';
      ctx.font = '700 40px ui-monospace, Menlo, monospace';
      ctx.fillText('NEW BEST!', cx, 460);
    }
    ctx.fillStyle = '#f2f5f7';
    ctx.font = '500 38px ui-monospace, Menlo, monospace';
    ctx.fillText(`SCORE ${hud.score}   (accuracy +${hud.roundBonus}, streak +${hud.roundStreakBonus})`, cx, 530);
    ctx.fillText(
      `HITS ${hud.hits}/${hud.shotsTotal}   ACC ${(hud.accuracy * 100).toFixed(0)}%   CENTER ${hud.centerHits}   BEST STREAK ${hud.bestStreak}`,
      cx,
      585,
    );
    ctx.fillText(`BEST ${hud.bestScore}   —   Press R to shoot again`, cx, 650);
    ctx.restore();
  }

  if (hud.paused && hud.mode === 'playing') {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 9, 0.6)';
    ctx.fillRect(0, 0, frame.camera.viewportWidth, frame.camera.viewportHeight);
    ctx.fillStyle = '#f2f5f7';
    ctx.textAlign = 'center';
    ctx.font = '700 56px ui-monospace, Menlo, monospace';
    ctx.fillText('PAUSED — click to resume', frame.camera.viewportWidth / 2, 540);
    ctx.restore();
  }
}

function drawMenu(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  ctx.save();
  ctx.fillStyle = 'rgba(4, 6, 9, 0.55)';
  ctx.fillRect(0, 0, frame.camera.viewportWidth, frame.camera.viewportHeight);
  ctx.textAlign = 'center';
  const cx = frame.camera.viewportWidth / 2;
  ctx.fillStyle = '#f2f5f7';
  ctx.font = '700 84px ui-monospace, Menlo, monospace';
  ctx.fillText('LONGSHOT', cx, 380);
  ctx.font = '500 34px ui-monospace, Menlo, monospace';
  ctx.fillText('Target Practice', cx, 435);
  ctx.font = '400 30px ui-monospace, Menlo, monospace';
  ctx.fillStyle = '#c9d6df';
  ctx.fillText('Move to scan — settle the reticle — time the sway — click to fire', cx, 520);
  ctx.fillText('Wheel / Z/X zoom   ·   1/2 level   ·   R restart   ·   M mute   ·   F1 debug   ·   ` dev tool', cx, 570);
  if (frame.hud.bestScore > 0) {
    ctx.fillStyle = '#ffe66d';
    ctx.fillText(`BEST ${frame.hud.bestScore}`, cx, 630);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px ui-monospace, Menlo, monospace';
  ctx.fillText(frame.elapsed % 1 < 0.7 ? '— click to start —' : '', cx, 700);
  ctx.restore();
}
