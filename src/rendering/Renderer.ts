import type { CameraSnapshot } from '../camera/Camera.ts';
import type { Vec2 } from '../core/types.ts';

// Renderer seam: the sim produces an immutable RenderFrame every tick; any
// renderer (Canvas 2D today, a Phaser Scene adapter tomorrow) consumes it.
// Nothing in sim/aim/targets may import Canvas or Phaser types — only this
// frame. To bolt on Phaser later: implement IRenderer with a Phaser.Scene
// that reads the same frame (camera snapshot, aim, debug) and draws with
// Phaser.GameObjects instead of ctx calls. No sim re-thought required.

export interface RenderFrame {
  camera: CameraSnapshot;
  worldWidth: number;
  worldHeight: number;
  /** Scope/aim point in logical screen coords (1920x1080). */
  aimScreen: Vec2;
  /** Same point resolved to world coords (authoritative for gameplay). */
  aimWorld: Vec2;
  zoom: number;
  zoomLevels: number[];
  fps: number;
  elapsed: number;
  debugVisible: boolean;
}

export interface IRenderer {
  render(frame: RenderFrame): void;
}
