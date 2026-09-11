import type { ActiveTarget } from '../targets/TargetDefinitions.ts';

// Authored tumbling for hit targets — no physics engine (proposal section 48).
// markHit() seeds velocity/rotationVelocity from the impact side; here we
// integrate gravity + motion and damp rotation so cans launch, spin, and
// settle into the knocked pose the renderer draws.

const GRAVITY = 1500;
const GROUND_FRICTION = 0.92;

export function updateTargetReactions(targets: readonly ActiveTarget[], dt: number): void {
  if (dt <= 0) return;
  for (const t of targets) {
    if (!t.hit) continue;
    const r = t.reaction;
    r.velocity.y += GRAVITY * dt;
    r.offset.x += r.velocity.x * dt;
    r.offset.y += r.velocity.y * dt;
    r.rotation += r.rotationVelocity * dt;
    // Bleed energy so motion settles instead of drifting forever.
    const damp = Math.exp(-2.2 * dt);
    r.velocity.x *= damp;
    r.rotationVelocity *= damp;
    // Floor: targets rest on the ground plane they were perched on.
    const floorY = t.height * 0.35;
    if (r.offset.y > floorY) {
      r.offset.y = floorY;
      r.velocity.y = 0;
      r.velocity.x *= GROUND_FRICTION;
    }
  }
}
