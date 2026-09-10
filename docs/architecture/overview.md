---
title: "Longshot Target Practice — Architecture Overview"
owner: "K_St_Games Team"
status: Active
lastUpdated: 2026-09-10
kind: architecture
---
# Architecture Overview

## Rendering Strategy

Canvas 2D via HTML5. No 3D engine. Draw order (back to front):

1. Clear canvas
2. Background / world image
3. Environment overlays
4. Targets (sorted by z-index)
5. Target effects (reactions, particles)
6. World impacts (dust, sparks)
7. Scope darkening / vignette (mask outside scope circle)
8. Reticle
9. Recoil / scope overlays
10. HUD (score, shots, streak, distance)
11. Score popups

## Scope Mask

Canvas clipping with arc path. The view through the scope shows the magnified world; everything outside is darkened.

## Coordinate Systems

Three distinct spaces:

| Space | Description |
|-------|-------------|
| Screen | Physical browser canvas pixels (0,0 – canvasW, canvasH) |
| Camera / View | Region currently visible through the scope transform |
| World | Full environment image coordinates (e.g. 4096×2304) |

**Rule:** All gameplay logic in world coords. Screen is for rendering only.
Provide: `screenToWorld(x,y)`, `worldToScreen(x,y)`

## Aim Pipeline

```
Mouse Intent
    ↓  (follow inertia)
Smoothed Aim
    ↓  (mouse velocity → stability penalty)
Stability
    ↓  (stability → sway multiplier)
Scope Sway (sine waves or smooth noise)
    ↓  (recoil on fire)
Recoil Offset
    ↓  (small Gaussian dispersion on shot)
Final Reticle Position → Impact Point
```

## Event Flow on Fire

```
PLAYER CLICK
    ↓ Validate game state (is playing, shots > 0)
    ↓ Capture reticle world position
    ↓ Calculate dispersion (Gaussian)
    ↓ Calculate impact point
    ↓ Query target manager for hit
    ├─ HIT → target reaction, score, streak, audio
    └─ MISS → environment impact, streak reset, audio
    ↓ Apply recoil
    ↓ Decrement shots
    ↓ Update HUD
    ↓ If shots == 0 → round complete
```

## Frame-Rate Independence

Use `dt` (delta time) for all time-dependent updates. Exponential smoothing form:
```js
const factor = 1 - Math.exp(-rate * dt);
```
Not lerp or fixed-step multiplication, which are frame-rate dependent.

## Subsystem Dependency Map

```
InputManager ──→ AimController ──→ SwayModel ──→ StabilityModel
                                        ↓
GameLoop ──→ Camera ──→ ScopeController ──→ RecoilModel
     │                │                      ↓
     │                ↓               DispersionModel
     │         WorldRenderer                ↓
     │                ↓              HitDetection ← TargetManager
     │          ScopeRenderer               ↓
     │                ↓              TargetReactions
     │              HUD                     ↓
     │                │              ParticleSystem
     │                ↓                      ↓
     └───────── GameState ←────────── AudioManager
```

## Level Definition (Data-Driven)

```json
{
  "id": "desert-junkyard-01",
  "name": "The Back Forty",
  "background": "/assets/backgrounds/junkyard.webp",
  "worldWidth": 4096,
  "worldHeight": 2304,
  "startingCamera": { "x": 2048, "y": 1152 }
}
```

Spawn points are authored positions with allowed target types, not random.

## Tuning Config

All gameplay constants in one place:

```json
{
  "aim": {
    "followSpeed": 10,
    "baseSway": 8,
    "swaySpeed": 1,
    "movementInstability": 0.003,
    "stabilityRecovery": 2.2
  },
  "shooting": {
    "baseDispersion": 1.5,
    "recoilKick": 12,
    "recoilDecay": 0.86
  },
  "scope": {
    "zoomLevels": [1, 2, 4],
    "defaultZoom": 2
  },
  "round": {
    "shots": 10
  }
}
```

## Tech Stack (MVP)

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Bundler | Vite |
| Rendering | Canvas 2D |
| Audio | Web Audio API |
| Persistence | localStorage |
| Physics | None (authored animation) |
| 3D Engine | None |

## Performance Targets

- 60 FPS on desktop browser
- 1080p Canvas (1920×1080 logical, scaled to viewport)
- 10–30 active targets
- <100 transient particles
- 1 large background image

## Accessibility

- Sway intensity slider
- Camera motion toggle
- Recoil shake toggle
- UI scale
- Reticle brightness / color
- High-contrast target outline mode