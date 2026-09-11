// Shared primitive types. Pure data — no DOM, no Canvas, no engine imports.
// These types are deliberately engine-agnostic so a future renderer
// (e.g. a Phaser bolt-on implementing IRenderer) can reuse them unchanged.

export interface Vec2 {
  x: number;
  y: number;
}

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}
