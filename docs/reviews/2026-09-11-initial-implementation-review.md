---
title: "Review: Longshot Target Practice — Implementation Review"
owner: "K_St_Games Team"
status: Active
lastUpdated: 2026-09-11
kind: review
---

# Review: Longshot Target Practice — Implementation Feedback

**Review date:** 2026-09-11
**Review scope:** All source, tests, build, docs — post proposal + project-setup commits
**Reviewer:** HTF_Coder

---

## Summary

The implementation agent has landed substantial code across Phases 0–5 of the MVP roadmap. The architecture is clean, the aim pipeline is correctly implemented (follow inertia → stability → sway → recoil → dispersion), and all 45 tests pass with a clean typecheck and build (37.76 KB gzip'd). The core game loop is functional: you can scan a 4096×2304 procedural world through a 1×/2×/4× scope, acquire targets, fire, see reactions/particles/score popups, and complete a round with persistence.

However, there are several issues that should be addressed before calling this complete:

---

## Critical

### 1. Docs are stale — feature-index, STATUS, CURRENT_TASK, roadmap all show everything as 💡

The documents I landed in the initial project setup (0226050) correctly show everything as "Proposed" because *at that time* nothing had been implemented. The implementation agent built the entire game on `feat/phase-0-skeleton` but **never updated the tracking docs**.

| Doc | Current state | Should be |
|-----|--------------|-----------|
| `docs/status/feature-index.md` | Everything 💡 | ~25 features at ✅ Done or ⚗️ Prototype |
| `STATUS.md` | Gate 0 (Proposal) — complete | Gate X (Running prototype), 6 phases mostly done |
| `CURRENT_TASK.md` | Says ready for implementation handoff | Needs active-slice for remaining work (art assets, Phase 6, polish) |
| `docs/roadmaps/mvp-roadmap.md` | All boxes unchecked | Phases 0–5 substantially complete |

**Action:** Update all four docs to reflect the actual code state.

### 2. No integration / spine test

The proposal (section 74) and the SPS standard both call for a core-loop integration test that drives the full pipeline end-to-end (spawn → aim → fire → hit/miss → score → round complete). The 45 unit tests are good, but there's no test that proves the full `Game.update()` → `fireShot()` → scoring → round-complete chain works.

The game's `Game.update()` and `fireShot()` are public and accept injectable seams (IInputSource, IGameLoop, IRenderer, Rng) — perfect for this. Something like:

```ts
// Test that the full game loop produces a non-zero score
it('completes a full 10-shot round with hits and scoring', () => {
  const game = makeGame({ round: { shots: 10 } });
  // Feed input: aim at a target, fire 10 times...
  // Assert: state.shotsRemaining === 0, state.mode === 'roundComplete',
  //         state.score > 0, state.hits > 0
});
```

**Action:** Add one core-loop spine test in `src/game.test.ts` that injects deterministic input/RNG and asserts the full round lifecycle.

### 3. `src/types/canvas.ts` is a dead file

Contains only `export {};`. No code imports it. It's a leftover from the scaffold (likely intended for shared rendering types). Either:

- Remove it (preferred — the renderer seam is `RenderFrame` in `rendering/Renderer.ts`), or  
- Use it for something meaningful

**Action:** Delete `src/types/canvas.ts`.

### 4. `src/utils/coordinates.ts` is unused

Provides `screenToWorld()` and `worldToScreen()` wrappers around Camera methods, but nothing imports them (every caller uses `camera.screenToWorld()` directly). If this is intended as the "conversion helpers" referenced in AGENTS.md standing rules, it should be used consistently — or removed.

**Action:** Either import and use `coordinates.ts` in the rendering pipeline, or delete it.

---

## Medium

### 5. No art assets loaded at all

The procedural world/target rendering works great for prototyping, but the game currently ships zero asset files. `index.html` loads a single `<canvas id="game">` element, no background images, target sprites, scope overlays, or sound files. Phase 6 on the roadmap is explicitly "Art Pass", so this is expected — but it means the current build looks like a debug tool, not a game.

Consider adding a placeholder `.webp` background or sprite sheet so the Docker compose at least shows *something* beyond colored rectangles when deployed.

**Action:** At minimum, add a placeholder background image and scope reticle texture as committed assets.

### 6. `dist/` and `node_modules/` are correctly gitignored but `package-lock.json` is tracked

There's no `src/` gitignore for build artifacts. Move the generated `.vite/` and `vitest/` metadata under `node_modules/` to the gitignore to prevent accidental commits.

Actually verified: `git ls-files dist/` is empty. The `.gitignore` I created works fine. No problem here — strike this.

### 7. Procedural audio is clever but fragile

The AudioManager synthesizes all SFX via oscillator/noise buffers. This is impressive for a zero-asset slice, but has limitations:

- No audio feedback loop or volume normalization (some sounds are jarringly loud vs. quiet)
- No pitch variation on miss impacts (dirt puff is identical every time — proposal says "slight randomized pitch variation on repeated impact sounds")
- No distant impulse response / echo (proposal section 24 says "A distant outdoor impulse response or echo can make the environment feel larger")
- `jitter()` is called inconsistently — some sounds use it, some don't

**Action:** Add randomized pitch variation across all sounds; consider a simple reverb/delay node for the "distant range" feel.

### 8. `accuracyBonus` rewards are coarse

Proposal (section 27) describes a detailed end-of-round summary with accuracy bonus, longest-streak bonus, and center-hit count. The current implementation only has `accuracyBonus()`, which gives:

| Accuracy | Bonus |
|----------|-------|
| ≥80% | +400 |
| ≥60% | +200 |
| <60% | 0 |

There's no center-hit count display on the round-complete screen, no longest-streak bonus line-item. The proposal also has `score = target.baseScore * distanceMultiplier * streakMultiplier` — this IS implemented in `scoreForHit()`, so that part is fine. But the summary display could use the extra detail.

**Action:** Add center-hit count and streak bonus to the round-complete HUD display.

### 9. `state.mode` transitions don't enforce order

`GameState.mode` is a string union, but nothing prevents bouncing from `'roundComplete'` back to `'playing'` without going through `restartRound()`. If a caller sets `mode = 'playing'` while `shotsRemaining === 0`, the game loop lets you keep clicking and firing with negative counter display.

The loop does guard `if (shotsRemaining <= 0) return` in `fireShot()`, so it won't *break*, but the display and UX would be confusing.

**Action:** Either harden the mode transitions or add a guard in the update loop that re-checks mode consistency.

---

## Minor

### 10. Vite dev server port hard-coded to 5173

The `vite.config.ts` explicitly sets `port: 5173`. This is fine but the Dockerfile's `npm run build` succeeds regardless. However, the Docker compose serves via nginx on port 80 → host 3001, so the Vite dev port is irrelevant there. Non-issue unless someone expects dev mode on a different port.

**Action:** Remove the hard-coded port (Vite's default 5173 will apply automatically) or document it.

### 11. `SpawnPoints.ts` exposes `shuffle()` but nothing outside `selectSpawnPoints()` uses it

The shuffle utility could be moved to `utils/` or inlined. Minor — the export is fine for testing.

**Action:** Move `shuffle()` to `src/utils/random.ts` where it belongs (or keep it, it's fine).

### 12. `cameraTransform.ts` is in `rendering/` but `hitDetection.ts` imports nothing from it

This is correct architecture: `cameraTransform.ts` is a rendering utility (Canvas2D ctx transform setup). The hit detection is pure math in world coordinates. No issue beyond naming clarity.

### 13. No `404.html` for SPA fallback

The game isn't technically an SPA with client-side routing, so this is fine for now. If a future version adds hashless routing or a leaderboard page, add Vite's `appType: 'mpa'` or a 404 redirect.

---

## Overall Assessment

**Quality:** Solid. The architecture is clean, the aim pipeline is correct, the engine seams (IInputSource, IGameLoop, IRenderer) are well-designed for future Phaser adapter or test injection. All 45 tests pass, typecheck is clean, build is 37 KB gzip'd.

**Readiness for handoff to comprehensive implementation:** High. The core loop exists and is playable. The remaining work is:

1. **Docs update** (feature-index, STATUS, CURRENT_TASK, roadmap) — ~30 min
2. **Clean up dead files** (canvas.ts, coordinates.ts) — 5 min
3. **Add spine integration test** — ~1 hr
4. **Phase 6: Art assets + audio polish** — depends on artist timeline
5. **Fix medium issues** (accuracy bonus display, audio variation) — ~2 hr

**Ship recommendation:** Address items 1–3 before handing off to comprehensive implementation. Items 4–5 can be done in parallel by the next agent.

---

## Appendix: Test Results

```
Test Files  6 passed (6)
Tests       45 passed (45)
Duration    729ms

✓ src/core/CoreUtils.test.ts      (4 tests)
✓ src/camera/Camera.test.ts       (7 tests)
✓ src/effects/Effects.test.ts     (6 tests)
✓ src/targets/Targets.test.ts     (10 tests)
✓ src/aim/AimModels.test.ts       (14 tests)
✓ src/rendering/CanvasRenderer.test.ts (4 tests)
```

Build: 37.76 kB JS + 0.15 kB CSS (gzip: 12.40 kB + 0.13 kB)

## Appendix: Branch Structure

```
0226050 Project setup: land core project documents (master)
  └─ a96ea36 Phase 0 skeleton: Vite+TS scaffold, camera, scope mask, debug overlay
      └─ 4c281d7 Phase 2 aim feel: smoothing, sway, stability, recoil, dispersion
          └─ 6787ade Add Dockerfile + docker-compose.yaml for containerized hosting
              ├─ 1a5ca59 Phase 3 targets: definitions, spawns, hit detection, scoring, firing
                  └─ 607ad4c Phase 4 feedback: reactions, particles, procedural audio, shake, popups
                      └─ 593b6ff Phase 5 game loop: menu, results, persistence, pause, telemetry
                          └─ 7cc80ff Polish: F2 live tuning panel, distance readout, debug hitboxes
```

Note: All implementation work is on `feat/phase-0-skeleton`. `master` still points at the initial project-setup commit. The branch should be merged to `master` after the review items are addressed.