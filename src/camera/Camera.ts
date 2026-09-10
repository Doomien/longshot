import { clamp } from '../utils/math.ts';
import type { Vec2 } from '../core/types.ts';

// Pure camera transform: world <-> screen conversions with pan + zoom.
// No DOM, no Canvas, no Phaser imports — unit-tested and reusable under any
// renderer. All gameplay logic must use world coordinates; screen coords are
// a rendering concern resolved through this class.
//
// Convention:
//   - World space: full environment, e.g. 4096x2304.
//   - Screen space: logical render surface, 1920x1080 (NOT physical pixels;
//     ResizeHandler owns the physical mapping).
//   - Camera position = world point at the center of the screen.

export interface CameraSnapshot {
  x: number;
  y: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

export class Camera {
  private snapshot: CameraSnapshot;

  constructor(
    private worldWidth: number,
    private worldHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    startX?: number,
    startY?: number,
    zoom = 1,
  ) {
    this.snapshot = {
      x: startX ?? worldWidth / 2,
      y: startY ?? worldHeight / 2,
      zoom,
      viewportWidth,
      viewportHeight,
    };
    this.clampToWorld();
  }

  get state(): CameraSnapshot {
    return { ...this.snapshot };
  }

  get position(): Vec2 {
    return { x: this.snapshot.x, y: this.snapshot.y };
  }

  get zoom(): number {
    return this.snapshot.zoom;
  }

  setZoom(zoom: number): void {
    this.snapshot.zoom = zoom;
    this.clampToWorld();
  }

  setViewport(width: number, height: number): void {
    this.snapshot.viewportWidth = width;
    this.snapshot.viewportHeight = height;
    this.clampToWorld();
  }

  setPosition(x: number, y: number): void {
    this.snapshot.x = x;
    this.snapshot.y = y;
    this.clampToWorld();
  }

  /** Visible world size at the current zoom. */
  visibleWorldSize(): { width: number; height: number } {
    return {
      width: this.snapshot.viewportWidth / this.snapshot.zoom,
      height: this.snapshot.viewportHeight / this.snapshot.zoom,
    };
  }

  screenToWorld(screenX: number, screenY: number): Vec2 {
    const s = this.snapshot;
    return {
      x: s.x + (screenX - s.viewportWidth / 2) / s.zoom,
      y: s.y + (screenY - s.viewportHeight / 2) / s.zoom,
    };
  }

  worldToScreen(worldX: number, worldY: number): Vec2 {
    const s = this.snapshot;
    return {
      x: (worldX - s.x) * s.zoom + s.viewportWidth / 2,
      y: (worldY - s.y) * s.zoom + s.viewportHeight / 2,
    };
  }

  /** Keep the view inside the world when the view is smaller than the world. */
  private clampToWorld(): void {
    const s = this.snapshot;
    const vis = this.visibleWorldSize();
    if (vis.width >= this.worldWidth) {
      s.x = this.worldWidth / 2;
    } else {
      const halfW = vis.width / 2;
      s.x = clamp(s.x, halfW, this.worldWidth - halfW);
    }
    if (vis.height >= this.worldHeight) {
      s.y = this.worldHeight / 2;
    } else {
      const halfH = vis.height / 2;
      s.y = clamp(s.y, halfH, this.worldHeight - halfH);
    }
  }
}
