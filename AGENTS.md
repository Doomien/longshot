---
title: "Agent Handoff — Longshot Target Practice"
description: "Doc roles: README.md is the quick-start (install, run, dev) for anyone new. This file (AGENTS.md) is the engineer/agent handoff — working rules, current state, and subsystem ownership."
status: active
owner: "K_St_Games Team"
last_updated: 2026-09-10
kind: agent_os
---
# Agent Handoff — Longshot Target Practice

> **Doc roles:** `README.md` is the quick-start (install, run, dev) for anyone
> new to the repo. This file (`AGENTS.md`) is the engineer/agent handoff —
> working rules, subsystem ownership, and what's implemented vs. planned.
> Don't duplicate content between them; link out instead.

## Product Vision

Read [docs/vision/VISION.md](docs/vision/VISION.md) first — it is the durable "why" behind this project.
Then read [longshot_target_practice_product_proposal.md](longshot_target_practice_product_proposal.md) for the
full 86-section design specification (aim model, scope mechanics, targets, audio, scoring, etc.).

Longshot Target Practice is a **browser-based 2D precision shooting-gallery game** built around the
sensation of trying to hit small distant objects through a magnified optic. It is **Duck Hunt +
Where's Waldo + a long-distance optic** — an arcade precision game, not a military sniper simulator.

The game's central mechanic is the separation between:
1. where the player is trying to aim,
2. where the scope/reticle is pointing,
3. and where the shot lands.

## The Core Loop (P0)

> A round starts from the menu with a level and shot count. The player scans a large illustrated
> 2D scene through a magnified scope. Targets (cans, bottles, plates) sit at various simulated
> distances. The player moves the scope — aim lags behind the cursor smoothly, and a sine-wave
> sway drifts the reticle. Stopping movement lets the scope "settle" (stability recovers),
> reducing sway amplitude. The player times the sway, fires, and gets instant feedback (hit:
> reaction + score + particles + sound; miss: environment impact + streak reset). Shots are
> limited (10 by default). After the last shot, a round-complete screen shows score, accuracy,
> streak, and the option to restart.

## Standing Rules (adopted 2026-09-10)

1. **"Done" includes the consumer.** A feature is done when something *reads* the value it writes
   and the game loop produces an observable effect — not when the field is assigned.
2. **Coordinate-space discipline.** All gameplay logic works in *world coordinates*. Screen
   coordinates are for rendering only. Never let subsystems independently manipulate screen coordinates.
   Use the conversion helpers (`screenToWorld`, `worldToScreen`).
3. **Config centralization.** All tunable gameplay constants live in a single config file
   (`src/config.ts` or `config.json`). Never scatter tuning constants through the codebase.
   Include a developer tuning panel (toggle F1) for live adjustment.
4. **WIP limit: one.** Nothing new starts until the current feature's `feature-index.md` row flips
   to 🚢 with evidence attached.
5. **🚢 Shipped requires evidence.** A row may claim Shipped only if you can name the test or the
   playtest date.

## Current State

> **For live status, start with [`STATUS.md`](STATUS.md)** (tier/gate + Now/Next/Blockers) and
> **[`docs/status/feature-index.md`](docs/status/feature-index.md)** (the stage of every feature).

This repo is a fresh project — the product proposal (`longshot_target_practice_product_proposal.md`)
is the sole reference. No code has been committed yet. The first implementation milestone is a
**zero-scope vertical slice**: one background, one can, one scope, smooth aim, settling, sway,
one zoom control, one shot, one hit reaction. Answer one question: *"Is aiming at and hitting this
single can fun?"*

## Subsystem Ownership

The proposal defines four agent workstreams. Implement them in order (A → B → C → D).

### Agent A — Core / Camera

| Subsystem | File | Depends on |
|-----------|------|------------|
| Game loop | `src/main.ts`, `src/core/GameLoop.ts` | — |
| Camera | `src/camera/Camera.ts` | — |
| Zoom / scope controller | `src/camera/ScopeController.ts` | Camera |
| Coordinate transforms | `src/utils/coordinates.ts` | Camera |
| Resize handling | `src/core/ResizeHandler.ts` | — |
| Config | `src/core/Config.ts` | — |

**Exit criterion:** A cursor-controlled camera can pan across a placeholder background through a working scope.

### Agent B — Aim Mechanics

| Subsystem | File | Depends on |
|-----------|------|------------|
| Aim smoothing | `src/aim/AimController.ts` | Camera |
| Sway model | `src/aim/SwayModel.ts` | — |
| Stability model | `src/aim/StabilityModel.ts` | SwayModel |
| Recoil model | `src/aim/RecoilModel.ts` | — |
| Dispersion model | `src/aim/DispersionModel.ts` | StabilityModel |

**Exit criterion:** Merely moving and settling the reticle feels satisfying.

### Agent C — Target Systems

| Subsystem | File | Depends on |
|-----------|------|------------|
| Target definitions | `src/targets/TargetDefinitions.ts` | — |
| Target manager | `src/targets/TargetManager.ts` | Camera |
| Spawn points | `src/targets/SpawnPoints.ts` | Level |
| Hit detection | `src/targets/HitDetection.ts` | Aim, Camera |
| Target reactions | `src/targets/TargetReactions.ts` | — |
| Scoring | `src/targets/Scoring.ts` | — |

**Exit criterion:** Player can shoot stationary cans with correct hit detection.

### Agent D — Rendering / UX

| Subsystem | File | Depends on |
|-----------|------|------------|
| Scope rendering | `src/rendering/ScopeRenderer.ts` | Camera |
| World renderer | `src/rendering/WorldRenderer.ts` | Camera |
| HUD renderer | `src/rendering/HudRenderer.ts` | GameState |
| Particle system | `src/effects/ParticleSystem.ts` | — |
| Impact effects | `src/effects/ImpactEffects.ts` | Particles |
| Menus / round-complete UI | `src/ui/` | GameState |
| Audio | `src/audio/AudioManager.ts` | — |

**Exit criterion:** A complete replayable 10-shot game exists with satisfying feedback.

## Important Branches

- `main`: integration baseline. Currently empty (no commits).
- Future branches: create fresh from `origin/main` with `feat/|fix/|refactor/|chore/|docs/` naming.

## Architecture Structure

```
├── index.html
├── style.css
├── src/
│   ├── main.ts
│   ├── game.ts
│   ├── core/          GameLoop, GameState, Config, ResizeHandler
│   ├── input/         InputManager
│   ├── camera/        Camera, ScopeController
│   ├── aim/           AimController, SwayModel, StabilityModel, RecoilModel, DispersionModel
│   ├── targets/       Target, TargetManager, TargetDefinitions, HitDetection, SpawnPoints, Scoring
│   ├── effects/       ParticleSystem, ImpactEffects, TargetReactions
│   ├── rendering/     Renderer, ScopeRenderer, WorldRenderer, HudRenderer
│   ├── audio/         AudioManager
│   ├── levels/        LevelDefinition, LevelLoader
│   └── utils/         math, random, coordinates
├── assets/
│   ├── backgrounds/
│   ├── targets/
│   ├── effects/
│   ├── audio/
│   └── ui/
└── docs/
    ├── vision/
    ├── architecture/
    ├── roadmaps/
    ├── status/
    └── reference/
```

## Key Documents

| Document | Purpose |
|---|---|
| [`longshot_target_practice_product_proposal.md`](longshot_target_practice_product_proposal.md) | Full 86-section product design spec |
| [`docs/vision/VISION.md`](docs/vision/VISION.md) | Durable product vision and core principles |
| [`docs/architecture/overview.md`](docs/architecture/overview.md) | Architecture decisions, subsystem map |
| [`docs/roadmaps/mvp-roadmap.md`](docs/roadmaps/mvp-roadmap.md) | Approved development phases and sequencing |
| [`docs/status/feature-index.md`](docs/status/feature-index.md) | **Feature index** — lifecycle stage of every feature |
| [`STATUS.md`](STATUS.md) | **Top-level tracker** — tier/gate, Now/Next/Blockers |
| [`CURRENT_TASK.md`](CURRENT_TASK.md) | Active slice state (≤60 lines) |

## Commands

```bash
npm install
npm run dev         # Vite dev server
npm run build       # Production build
npm run preview     # Preview production build
```

## Important Implementation Rules

1. **Use world coordinates as the authoritative gameplay coordinate system.** This avoids the most common source of bugs (mixing target, camera, scope, and screen coordinates). Provide `screenToWorld(x,y)` and `worldToScreen(x,y)` helpers.

2. **Gaussian dispersion, not uniform.** Use Box-Muller or similar for shot spread so most shots land near the reticle and extreme deviations are rare.

3. **80–90% visible error, 10–20% hidden dispersion.** The player should understand why a miss happened by seeing the reticle pass beside the target. Avoid large invisible random offsets.

4. **Frame-rate-independent updates.** Use `dt` (delta time) with exponential smoothing: `1 - Math.exp(-rate * dt)` instead of lerp or fixed-step multiplication.

5. **No physics engine in MVP.** Do not add Matter.js or similar. Use authored animation/tumbling for target reactions.

6. **Mutable gameplay config.** Implement a live developer tuning panel (toggle with F1) early. It saves hours of edit-and-reload cycles. Show: stability, sway, spread, zoom, recoil values. Allow exporting as JSON.

7. **Target distance is a gameplay parameter, not a real unit.** It's a difficulty scalar that influences apparent size, sway relative to target size, allowable hit margin, and score. Use tunable constants, not formulas.

## Debug Overlay

Build this early:

```text
F1 toggle
Display: FPS, camera position, zoom, mouse world position,
reticle world position, stability, sway x/y, dispersion radius,
target hitboxes, spawn locations, active target IDs
```

## Telemetry for Playtesting

Log session metrics to console or localStorage:

```json
{
  "shots": 10,
  "hits": 7,
  "accuracy": 0.70,
  "averageAimTime": 2.4,
  "averageStabilityAtFire": 0.78,
  "zoomUsage": { "1x": 0.10, "2x": 0.30, "4x": 0.60 }
}
```

Key metrics: stability at firing, miss distance, time between acquisition and shot.