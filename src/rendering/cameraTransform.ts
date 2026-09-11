import type { CameraSnapshot } from '../camera/Camera.ts';

// Shared world->screen transform so every world-space renderer pans/zooms
// identically. A Phaser adapter would replace this with camera.setZoom +
// camera.centerOn — the seam stays inside rendering/.

export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: CameraSnapshot,
): void {
  ctx.translate(camera.viewportWidth / 2, camera.viewportHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
}
