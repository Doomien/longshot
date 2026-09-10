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

## Active Work — Project Setup & Foundation

### Completed
- Product proposal authored (`longshot_target_practice_product_proposal.md`) — 86 sections covering all design, mechanics, architecture, and implementation guidance.
- Repository initialized (`.git`, `LICENSE`, `.gitignore`).
- Project documents landed: `AGENTS.md`, `README.md`, `STATUS.md`, `CURRENT_TASK.md`.
- Docs created: `docs/vision/VISION.md`, `docs/architecture/overview.md`, `docs/roadmaps/mvp-roadmap.md`, `docs/status/feature-index.md`.

### Current
- MVP slice complete on `feat/phase-0-skeleton` (45 tests green, build clean, dev serves 200). Pending: in-browser playtest + aim tuning, then Phase 6 art.

### Next Up (Implementation Agent A — Core/Camera)
1. Initialize Vite + TypeScript project scaffold
2. Canvas setup, game loop, resize handling
3. Input manager
4. Camera transform with pan and zoom
5. Scope clipping mask + reticle rendering
6. Coordinate conversion helpers
7. Debug overlay (F1 toggle)

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