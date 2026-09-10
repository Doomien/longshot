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

- [ ] Vite + TypeScript scaffold
- [ ] Canvas setup
- [ ] Game loop (`requestAnimationFrame`)
- [ ] Resize handling
- [ ] Input manager (mouse move, click, wheel)
- [ ] Debug overlay (F1: FPS, camera, cursor, stability, sway)
- [ ] Frame-rate independent update loop

### Phase 1 — Scope Prototype
**Exit criterion:** Player can smoothly inspect the environment through a working optic.

- [ ] Scope mask (circle clipping)
- [ ] Reticle rendering
- [ ] Camera transform (pan, zoom)
- [ ] 3 zoom levels (1×, 2×, 4×)
- [ ] Mouse wheel zoom control
- [ ] Screen/world coordinate conversion

### Phase 2 — Aim Feel
**Exit criterion:** Merely moving and settling the reticle feels satisfying.

- [ ] Aim smoothing (follow inertia)
- [ ] Sway model (multi-sine waves)
- [ ] Stability / settling mechanic
- [ ] Recoil (kick + decay)
- [ ] Gaussian dispersion
- [ ] Final reticle calculation

### Phase 3 — Targets
**Exit criterion:** Player can shoot stationary cans with correct hit detection.

- [ ] Target data definitions (beer can, bottle, metal plate)
- [ ] Sprite rendering
- [ ] Spawn points system
- [ ] Hitboxes (rectangular/elliptical)
- [ ] Shot resolution
- [ ] Target hit/miss detection

### Phase 4 — Feedback
**Exit criterion:** A hit feels good.

- [ ] Target reactions (tumble, rotation, gravity)
- [ ] Particle system (dust, sparks, shatter)
- [ ] Impact effects
- [ ] Sound (fire, metal ping, glass break, dirt)
- [ ] Screen shake
- [ ] Score popups

### Phase 5 — Game Loop
**Exit criterion:** Complete replayable 10-shot game exists.

- [ ] Shots remaining counter
- [ ] Score + streak system
- [ ] Round start screen
- [ ] Round complete screen
- [ ] Restart
- [ ] Best score persistence (localStorage)
- [ ] Pause on tab visibility change

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
| One level with large background | ⏳ Phase 6 |
| Beer can, bottle, metal plate targets | ⏳ Phase 3 |
| Mouse aiming with smooth follow | ⏳ Phase 2 |
| Sine-wave sway | ⏳ Phase 2 |
| Stability/settling system | ⏳ Phase 2 |
| 3 zoom levels (1×, 2×, 4×) | ⏳ Phase 1 |
| 10-shot rounds | ⏳ Phase 5 |
| Hit detection | ⏳ Phase 3 |
| Scoring + streaks | ⏳ Phase 5 |
| Recoil | ⏳ Phase 2 |
| Target reactions (tumble) | ⏳ Phase 4 |
| Basic particles | ⏳ Phase 4 |
| Sound effects | ⏳ Phase 4 |
| Round-complete screen | ⏳ Phase 5 |
| Local best score | ⏳ Phase 5 |

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