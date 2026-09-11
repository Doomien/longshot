---
title: "Feature Index — Longshot Target Practice"
owner: "K_St_Games Team"
status: Active
lastUpdated: 2026-09-10
kind: status
---
# Feature Index

Lifecycle stages:

| Stage | Meaning |
|-------|---------|
| 💡 Proposed | In design doc, not implemented |
| 🔨 In Progress | Active implementation |
| ⚗️ Prototype | Rough first version exists |
| ✅ Done | Shipped with evidence (test or playtest date) |
| ❌ Cut | Explicitly removed from scope |

## Core Systems

| Feature | Stage | Notes |
|---------|-------|-------|
| Game loop (RAF) | ✅ | DomGameLoop, dt-clamped; `npm test` + `npm run build` green 2026-09-10 |
| Input (mouse + click + wheel) | ⚗️ | Move/wheel/Z/X/F1 live; click-to-fire pending Phase 3 |
| Camera (pan/zoom) | ✅ | Camera + ScopeController; `Camera.test.ts` 7/7 green 2026-09-10 |
| Scope mask (circle clip) | ⚗️ | Basic clip + darken + edge; lens polish later; browser playtest pending |
| Reticle | ⚗️ | Basic crosshair + ticks; browser playtest pending |
| Coordinate conversion | ✅ | screenToWorld/worldToScreen round-trip tested 2026-09-10 |
| Debug overlay (F1) | ⚗️ | Toggle renders FPS/cam/zoom/world; smoke-tested, browser check pending |
| Config centralization | ✅ | `src/core/Config.ts` single source; consumed by sim + overlay |
| Developer tuning panel | ✅ | F2 live sliders + console JSON export |
| Resize handling | ⚗️ | Letterboxed 1920×1080 + DPR cap; browser resize check pending |
| Pause on tab hide | ✅ | Auto-pause overlay, click resumes |
| Responsive scaling | ⚗️ | Letterboxed 1920×1080 + DPR cap; visual check pending |
| Frame-rate independence | ✅ | `smoothingFactor` half-step composition test; dt clamp 100ms |

## Aim Systems

| Feature | Stage | Notes |
|---------|-------|-------|
| Aim smoothing (follow inertia) | ✅ | AimController; frame-rate-independence test 2026-09-10 |
| Sine-wave sway | ✅ | SwayModel multi-sine; deterministic + amplitude tests |
| Smooth noise sway (future) | 💡 | Perlin/Simplex replacement |
| Stability / settling | ✅ | StabilityModel; drain/recover/clamp tests |
| Recoil (kick + decay) | ✅ | RecoilModel px kick + exp decay; kick/decay tests |
| Gaussian dispersion | ✅ | Box-Muller via utils/random; seeded cluster test |
| Final reticle = smoothed + sway + recoil | ✅ | AimController.snapshot; composition test |
| Optional steady-aim (hold breath) | 💡 | Post-MVP if settling alone isn't enough |

## Targets

| Feature | Stage | Notes |
|---------|-------|-------|
| Beer can | ✅ | Definition + procedural sprite; `Targets.test.ts` 2026-09-10 |
| Glass bottle | ✅ | Definition + procedural sprite |
| Metal plate | ✅ | Definition + procedural sprite |
| Tin can | ✅ | Definition + sprite; spawns in rotation |
| Clay target | ✅ | Definition + sprite; far-ridge spawns |
| Target definitions (TypeScript interface) | ✅ | `TargetDefinitions.ts` |
| Spawn points (authored) | ✅ | Back Forty 12 points; seeded shuffle tested |
| Rectangular hitboxes | ✅ | `pointInRect` tested |
| Elliptical hitboxes | ✅ | `pointInTarget` edge-tested |
| Center-hit / bullseye zone | ✅ | Normalized zone + 1.5x bonus tested |
| Localized impact position | ✅ | `worldToLocal`; seeds tumble direction |
| Target reactions (tumble/rotation) | ✅ | Authored gravity tumble, settles to floor; tested |
| Randomized sessions (seeded RNG) | ✅ | mulberry32 session select; determinism tested |
| Shuffled target selection | ✅ | Same suite |

## Rendering & Feedback

| Feature | Stage | Notes |
|---------|-------|-------|
| World renderer | ✅ | SVG backdrop + procedural fallback; final art in Phase 6 |
| Scope renderer | ⚗️ | Clip + reticle; browser playtest pending |
| HUD (score, shots, streak) | ✅ | Counters live; results panel on complete |
| Distance display | ✅ | Nearest-target DIST readout in HUD |
| Particle system | ✅ | Capped pool, gravity; tested |
| Impact effects (dust, spark, splinter) | ✅ | Per-material bursts + miss dust; tested |
| Screen shake | ✅ | Trauma shake, render-only; tested |
| Score popups | ✅ | Floating world-space text; tested |
| Round start screen | ✅ | Menu overlay, click/R starts |
| Round complete screen | ✅ | Score/accuracy/streak/best + R restart |
| Fire sound | ✅ | Procedural WebAudio; no-throw tested |
| Impact sounds (metal, glass, dirt) | ✅ | Per-material synth; M mutes |
| Distant echo / reverb | 💡 | Post-MVP polish |
| Randomized pitch variation | ✅ | Jitter on every play |

## Game Modes

| Feature | Stage | Notes |
|---------|-------|-------|
| Ten-Shot Challenge | ✅ | Playable end-to-end 2026-09-10 |
| Time Attack | 💡 | Post-MVP |
| Find Them All | 💡 | Post-MVP |
| One Shot | 💡 | Post-MVP |
| Endless Range | 💡 | Post-MVP |
| Daily Challenge (seeded) | 💡 | Post-MVP |

## Scoring & Persistence

| Feature | Stage | Notes |
|---------|-------|-------|
| Score = base × distance × streak | ✅ | `Scoring.ts` tested (cap 2.0) |
| End-of-round accuracy bonus | ✅ | Tiered bonus tested |
| Center-hit bonus | ✅ | 1.5x tested |
| Streak multiplier (capped) | ✅ | Tested |
| Best score (localStorage) | ✅ | Guarded load/store; shown in menu + results |
| Session telemetry logging | ✅ | Console JSON on round complete; builder tested |

## Levels & Environment

| Feature | Stage | Notes |
|---------|-------|-------|
| Desert junkyard level | 💡 | |
| Rural back lot level | 💡 | Post-MVP |
| Campsite level | 💡 | Post-MVP |
| Mountain cabin level | 💡 | Post-MVP |
| Environment hit regions (dirt/wood/metal) | 💡 | |
| Parallax layers | 💡 | Post-MVP |
| Atmospheric effects | 💡 | Post-MVP |
| Moving targets | 💡 | Post-MVP |

## Accessibility

| Feature | Stage | Notes |
|---------|-------|-------|
| Sway intensity slider | 💡 | |
| Camera motion toggle | 💡 | |
| Recoil shake toggle | 💡 | |
| Sound volume | 💡 | |
| UI scale | 💡 | |
| Reticle brightness/color | 💡 | |
| High-contrast target outline | 💡 | |