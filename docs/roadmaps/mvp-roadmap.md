---
title: "Longshot Target Practice — MVP Roadmap"
owner: "K_St_Games Team"
status: Active
lastUpdated: 2026-09-10
kind: roadmap
---
# MVP Roadmap

## Development Phases

### Phase 0 — Skeleton
**Exit criterion:** A cursor-controlled camera can pan across a placeholder background.

- [x] Vite + TypeScript scaffold
- [x] Canvas setup
- [x] Game loop (`requestAnimationFrame`)
- [x] Resize handling
- [x] Input manager (mouse move, click, wheel)
- [x] Debug overlay (F1: FPS, camera, cursor, stability, sway)
- [x] Frame-rate independent update loop

### Phase 1 — Scope Prototype
**Exit criterion:** Player can smoothly inspect the environment through a working optic.

- [x] Scope mask (circle clipping)
- [x] Reticle rendering
- [x] Camera transform (pan, zoom)
- [x] 3 zoom levels (1×, 2×, 4×)
- [x] Mouse wheel zoom control
- [x] Screen/world coordinate conversion

### Phase 2 — Aim Feel
**Exit criterion:** Merely moving and settling the reticle feels satisfying.

- [x] Aim smoothing (follow inertia)
- [x] Sway model (multi-sine waves)
- [x] Stability / settling mechanic
- [x] Recoil (kick + decay)
- [x] Gaussian dispersion
- [x] Final reticle calculation

### Phase 3 — Targets
**Exit criterion:** Player can shoot stationary cans with correct hit detection.

- [x] Target data definitions (beer can, bottle, metal plate)
- [x] Sprite rendering
- [x] Spawn points system
- [x] Hitboxes (rectangular/elliptical)
- [x] Shot resolution
- [x] Target hit/miss detection

### Phase 4 — Feedback
**Exit criterion:** A hit feels good.

- [x] Target reactions (tumble, rotation, gravity)
- [x] Particle system (dust, sparks, shatter)
- [x] Impact effects
- [x] Sound (fire, metal ping, glass break, dirt)
- [x] Screen shake
- [x] Score popups

### Phase 5 — Game Loop
**Exit criterion:** Complete replayable 10-shot game exists.

- [x] Shots remaining counter
- [x] Score + streak system
- [x] Round start screen
- [x] Round complete screen
- [x] Restart
- [x] Best score persistence (localStorage)
- [x] Pause on tab visibility change

### Phase 6 — Art Pass
**Exit criterion:** Polished, shippable first level.

- [ ] Final background illustration
- [ ] Final target sprites
- [ ] Scope overlay artwork
- [ ] Audio polish
- [ ] UI polish
- [ ] One complete level: desert junkyard or rural back lot

## MVP Scope

| Feature | Status |
|---------|--------|
| One level with large background | ⚗️ Prototype (SVG placeholder; final art Phase 6) |
| Beer can, bottle, metal plate targets | ✅ Done |
| Mouse aiming with smooth follow | ✅ Done |
| Sine-wave sway | ✅ Done |
| Stability/settling system | ✅ Done |
| 3 zoom levels (1×, 2×, 4×) | ✅ Done |
| 10-shot rounds | ✅ Done |
| Hit detection | ✅ Done |
| Scoring + streaks | ✅ Done |
| Recoil | ✅ Done |
| Target reactions (tumble) | ✅ Done |
| Basic particles | ✅ Done |
| Sound effects | ✅ Done (procedural; polish Phase 6) |
| Round-complete screen | ✅ Done |
| Local best score | ✅ Done |

## Explicit MVP Non-Goals

- 3D world / Three.js
- FPS movement / character controls
- Multiplayer
- User accounts
- Weapon inventory
- Real-world ballistics
- Wind simulation
- Bullet drop / travel time
- Scope turret dialing
- AI enemies / damage systems
- Ragdolls / physics engine
- Server backend

## Post-MVP Potential

- Parallax layers
- Moving targets (swinging cans, rolling)
- Daily challenges (seeded rounds)
- Multiple optics with different characteristics
- Multiple ranges / environments
- Simulation mode (drop, wind, ranging)
- Leaderboards
- Time Attack mode
- Find Them All mode
- Progression / unlocks (cosmetic)