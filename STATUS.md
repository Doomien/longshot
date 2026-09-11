---
title: "STATUS — Longshot Target Practice"
description: "Browser-based 2D precision shooting-gallery game — aiming feel, target practice, arcade scope mechanics."
repo: longshot-target-practice
status: active
tier: T0
kind: status
gate: "Gate 1 (Running prototype) — complete; Gate 2 (Playtest + art) — open"
last_updated: 2026-09-10
owner: K_St_Games Team
---

# STATUS — Longshot Target Practice

**One-liner:** Browser-based 2D precision shooting-gallery game. Find small distant objects, settle a magnified optic, time the sway, and hit satisfying targets.

## Now
- Product proposal complete and documented (86 sections)
- Project document set landed (AGENTS, README, STATUS, CURRENT_TASK, vision, architecture, roadmap, feature index)
- Phase 0 skeleton implemented on `feat/phase-0-skeleton` (Vite+TS, loop, input, camera, scope mask, F1 overlay; 10 tests green, build clean — browser playtest pending)
- Phase 2 aim feel implemented (AimController, sway, stability, recoil, dispersion; 24 tests green — browser playtest pending)
- Phase 3 targets implemented (5 archetypes, Back Forty spawns, ellipse hitboxes, bullseye, scoring; 34 tests green; slice playable: click to shoot, R to restart)
- Phase 4 feedback implemented (tumble reactions, particles, per-material bursts, procedural WebAudio, trauma shake, score popups; 40 tests green)
- Phase 5 game loop implemented (menu, results with accuracy/best, localStorage bests, auto-pause, telemetry; 45 tests green, build clean, dev serves 200)
- **MVP playable end-to-end** on `feat/phase-0-skeleton`: menu → 10 shots → results → R. Remaining: in-browser playtest + tuning, Phase 6 art

## Next
- **Vertical Slice (Phase 0):** Vite + TypeScript scaffold, Canvas game loop, input, camera with scope masking, reticle, zoom, aim smoothing, sway, stability, one target, one shot, one hit reaction
- **Answer the core question:** Is aiming at and hitting one can fun?

## Blockers / Risks
- Art asset pipeline not started — no background, target sprites, scope overlay, or sound assets exist yet
- Aim feel is the biggest product risk: too much sway = frustrating; too little = boring clicker; too much hidden dispersion = unfair

## Roadmap
| Phase | Goal | Status |
|-------|------|--------|
| 0 — Skeleton | Vite + Canvas + game loop + input + debug overlay | ⚗️ Prototype (code done, browser playtest pending) |
| 1 — Scope | Scope mask, reticle, zoom, camera, coordinates | ⏳ Not started |
| 2 — Aim Feel | Smoothing, sway, stability, recoil | ⏳ Not started |
| 3 — Targets | Data, sprites, spawn, hitboxes, resolution | ⏳ Not started |
| 4 — Feedback | Reactions, particles, impacts, sound, screen shake | ⏳ Not started |
| 5 — Game Loop | Shots, score, streak, round start/complete, restart | ✅ Complete (menu/results/persist/pause/telemetry) |
| 6 — Art Pass | Final background, sprites, scope art, audio polish | ⏳ Not started |

## Links
- Full design spec: [longshot_target_practice_product_proposal.md](longshot_target_practice_product_proposal.md)
- Agent handoff: [AGENTS.md](AGENTS.md)
- Architecture: [docs/architecture/overview.md](docs/architecture/overview.md)
- Roadmap: [docs/roadmaps/mvp-roadmap.md](docs/roadmaps/mvp-roadmap.md)
- Feature index: [docs/status/feature-index.md](docs/status/feature-index.md)
- Vision: [docs/vision/VISION.md](docs/vision/VISION.md)