---
title: "CURRENT_TASK.md — Active Slice"
description: "Size budget: <= 60 lines."
status: active
owner: "K_St_Games Team"
last_updated: 2026-09-10
kind: status
---
# CURRENT_TASK.md — Active Slice

**Size budget:** <= 60 lines.

---

## Active Work — Review Feedback + Pre-Art Hardening

### Completed
- MVP slice Phases 0–5 on `feat/phase-0-skeleton` (menu → 10 shots → results → R; 45+ tests green, build clean, dev serves 200).
- Tracking docs current: `feature-index.md`, `STATUS.md` (Gate 1), roadmap Phases 0–5 checked.

### Current
- Attend to `docs/reviews/2026-09-11-initial-implementation-review.md` (spine test, dead files, audio, scoring detail, placeholder art).

### Next Up (Phase 6 — Art Pass)
1. Final background illustration (replaces SVG placeholder)
2. Final target sprites (replaces procedural)
3. In-browser playtest + aim tuning via F2 panel
4. Audio polish (asset SFX or synth refinement)

### Next Up (remaining review + pre-art items)
1. Spine integration test (`src/game.test.ts`)
2. Delete dead `types/canvas.ts`; use `coordinates.ts` helpers
3. Audio: jitter everywhere + echo send
4. Results: center-hit count + streak bonus
5. Placeholder background asset + loader

### Working Rules
- See [AGENTS.md](AGENTS.md) for full working rules, subsystem ownership, and standing constraints.
- WIP limit: one feature at a time.
- Feature advancement tracked in [docs/status/feature-index.md](docs/status/feature-index.md).
- Before starting implementation, read [docs/vision/VISION.md](docs/vision/VISION.md) and [`longshot_target_practice_product_proposal.md`](longshot_target_practice_product_proposal.md) (sections 1–84).
- Vertical slice first: one background, one can, one scope, aim, settle, sway, zoom, one shot, one hit reaction. Answer: *"Is aiming at one can fun?"*

### Links
- Full design spec: `longshot_target_practice_product_proposal.md`
- Architecture: [docs/architecture/overview.md](docs/architecture/overview.md)
- Roadmap: [docs/roadmaps/mvp-roadmap.md](docs/roadmaps/mvp-roadmap.md)
- Feature index: [docs/status/feature-index.md](docs/status/feature-index.md)
- Status: [STATUS.md](STATUS.md)