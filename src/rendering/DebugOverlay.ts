import { configToJson, type GameConfig } from '../core/Config.ts';
import type { RenderFrame } from './Renderer.ts';

// F1 debug overlay (screen space). Shows the live values AGENTS.md requires:
// FPS, camera, zoom, mouse screen/world, plus viewport + tuning snapshot.
// Press F1 toggles; the panel is read-only in Phase 0 (sliders arrive with
// the tuning panel in Phase 2). Console export via `exportConfig()` for now.

export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  frame: RenderFrame,
  config: GameConfig,
): void {
  if (!frame.debugVisible) return;
  const lines = [
    `FPS      ${frame.fps.toFixed(0)}`,
    `CAM      ${frame.camera.x.toFixed(1)}, ${frame.camera.y.toFixed(1)}`,
    `ZOOM     ${frame.zoom}x  [${frame.zoomLevels.join('/')}]`,
    `MOUSE    ${frame.aimScreen.x.toFixed(0)}, ${frame.aimScreen.y.toFixed(0)} (screen)`,
    `WORLD    ${frame.aimWorld.x.toFixed(1)}, ${frame.aimWorld.y.toFixed(1)} (world)`,
    `RETICLE  ${frame.reticleWorld.x.toFixed(1)}, ${frame.reticleWorld.y.toFixed(1)}`,
    `STABILITY ${frame.stability.toFixed(2)}`,
    `SWAY     ${frame.swayPixels.toFixed(1)} px`,
    `SPREAD   ${frame.spreadWorld.toFixed(2)} px`,
    `VIEW     ${frame.camera.viewportWidth}x${frame.camera.viewportHeight}`,
    `T        ${frame.elapsed.toFixed(2)}s   (F1 toggles)`,
    `PAN      ${config.camera.panSpeed}/s  FOLLOW ${config.aim.followSpeed}/s`,
  ];
  ctx.save();
  const width = 460;
  const height = lines.length * 30 + 24;
  ctx.fillStyle = 'rgba(8, 12, 16, 0.82)';
  ctx.fillRect(16, 16, width, height);
  ctx.strokeStyle = 'rgba(120, 200, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width, height);
  ctx.fillStyle = '#bfe3ff';
  ctx.font = '500 22px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  lines.forEach((line, i) => {
    ctx.fillText(line, 32, 52 + i * 30);
  });
  ctx.restore();
}

export function exportConfig(config: GameConfig): void {
  // eslint-disable-next-line no-console
  console.log('[longshot] tuning config\n' + configToJson(config));
}
