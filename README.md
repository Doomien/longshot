---
title: "Longshot Target Practice"
description: "Browser-based 2D precision shooting-gallery game — find small distant objects through a magnified optic, settle the reticle, and hit satisfying targets."
status: active
owner: "K_St_Games Team"
last_updated: 2026-09-10
kind: index
---
# Longshot Target Practice

A browser-based 2D precision shooting-gallery game. Look across a rural, desert, junkyard, campground, or backyard target range and try to hit small objects at simulated distances through a magnified optic. Duck Hunt + Where's Waldo + a long-distance optic.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or Vite's default port).

## Requirements

- Node.js 18+
- npm

## What Makes This Game Different

- **Aim feel over simulation.** Not a realistic ballistics model. The fun comes from visible, readable reticle sway, settling, and timing — not wind doping or mil-ranging.
- **Scope is the mechanic.** The optic isn't decoration. Magnification, field of view, reticle drift, recoil, and stability are the primary game systems.
- **Fair misses.** 80–90% of imprecision is visible in the reticle. The player usually knows *why* a shot missed.
- **2D Canvas.** A large illustrated background, camera pan/zoom, sprite targets. No 3D engine needed.

## Architecture

```
├── src/
│   ├── core/          Game loop, state, config
│   ├── input/         Mouse/keyboard input
│   ├── camera/        Camera transform, zoom, scope
│   ├── aim/           Aim smoothing, sway, stability, recoil, dispersion
│   ├── targets/       Target definitions, hit detection, scoring
│   ├── effects/       Particles, impacts, target reactions
│   ├── rendering/     World, scope, and HUD renderers
│   ├── audio/         Sound manager
│   ├── levels/        Level definitions and loader
│   └── utils/         Math, coordinates, RNG
├── assets/
│   ├── backgrounds/
│   ├── targets/
│   ├── effects/
│   ├── audio/
│   └── ui/
└── docs/
```

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Unit tests (vitest)
```

## Controls

```text
Mouse Move   Scan / aim
Left Click   Fire (menu: click to start)
Wheel / Z/X  Zoom 1x / 2x / 4x
R            Restart round
M            Mute
F1           Debug overlay (FPS, camera, reticle, stability, hitboxes)
` (or F2)    Dev tool: live tuning sliders + scene editor + JSON export
```

In edit mode (dev-tool checkbox): drag targets to reposition, right-click
deletes, background path and spawn layout export as level JSON — first step
toward a fully data-driven scene pipeline.

## Documentation

Start at [`docs/vision/VISION.md`](docs/vision/VISION.md) for the product vision.
Full 86-section design spec: [`longshot_target_practice_product_proposal.md`](longshot_target_practice_product_proposal.md).
Agent handoff and working rules: [`AGENTS.md`](AGENTS.md).