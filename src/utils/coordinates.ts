import type { Camera } from '../camera/Camera.ts';
import type { Vec2 } from '../core/types.ts';

// Standalone conversion helpers required by AGENTS.md ("use the conversion
// helpers screenToWorld, worldToScreen"). Thin wrappers over Camera so call
// sites don't reach into camera internals and a future engine adapter can
// swap the implementation behind the same function names.

export function screenToWorld(camera: Camera, x: number, y: number): Vec2 {
  return camera.screenToWorld(x, y);
}

export function worldToScreen(camera: Camera, x: number, y: number): Vec2 {
  return camera.worldToScreen(x, y);
}
