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
| Game loop (RAF) | 💡 | |
| Input (mouse + click + wheel) | 💡 | |
| Camera (pan/zoom) | 💡 | |
| Scope mask (circle clip) | 💡 | |
| Reticle | 💡 | |
| Coordinate conversion | 💡 | screenToWorld / worldToScreen |
| Debug overlay (F1) | 💡 | |
| Config centralization | 💡 | Single JSON/config module |
| Developer tuning panel | 💡 | |
| Resize handling | 💡 | |
| Pause on tab hide | 💡 | |
| Responsive scaling | 💡 | 1920×1080 logical canvas |
| Frame-rate independence | 💡 | dt-based updates throughout |

## Aim Systems

| Feature | Stage | Notes |
|---------|-------|-------|
| Aim smoothing (follow inertia) | 💡 | Exponential: `1 - exp(-speed * dt)` |
| Sine-wave sway | 💡 | Multi-sine for MVP |
| Smooth noise sway (future) | 💡 | Perlin/Simplex replacement |
| Stability / settling | 💡 | Velocity penalizes, recovery restores |
| Recoil (kick + decay) | 💡 | Gaussian side variance |
| Gaussian dispersion | 💡 | Box-Muller, not uniform |
| Final reticle = smoothed + sway + recoil | 💡 | |
| Optional steady-aim (hold breath) | 💡 | Post-MVP if settling alone isn't enough |

## Targets

| Feature | Stage | Notes |
|---------|-------|-------|
| Beer can | 💡 | |
| Glass bottle | 💡 | |
| Metal plate | 💡 | |
| Tin can | 💡 | |
| Clay target | 💡 | |
| Target definitions (TypeScript interface) | 💡 | |
| Spawn points (authored) | 💡 | |
| Rectangular hitboxes | 💡 | |
| Elliptical hitboxes | 💡 | |
| Center-hit / bullseye zone | 💡 | |
| Localized impact position | 💡 | |
| Target reactions (tumble/rotation) | 💡 | Authored animation, no physics engine |
| Randomized sessions (seeded RNG) | 💡 | |
| Shuffled target selection | 💡 | |

## Rendering & Feedback

| Feature | Stage | Notes |
|---------|-------|-------|
| World renderer | 💡 | Background + overlays |
| Scope renderer | 💡 | Clip mask + darken outside |
| HUD (score, shots, streak) | 💡 | |
| Distance display | 💡 | |
| Particle system | 💡 | |
| Impact effects (dust, spark, splinter) | 💡 | |
| Screen shake | 💡 | |
| Score popups | 💡 | |
| Round start screen | 💡 | |
| Round complete screen | 💡 | |
| Fire sound | 💡 | |
| Impact sounds (metal, glass, dirt) | 💡 | |
| Distant echo / reverb | 💡 | |
| Randomized pitch variation | 💡 | |

## Game Modes

| Feature | Stage | Notes |
|---------|-------|-------|
| Ten-Shot Challenge | 💡 | MVP mode |
| Time Attack | 💡 | Post-MVP |
| Find Them All | 💡 | Post-MVP |
| One Shot | 💡 | Post-MVP |
| Endless Range | 💡 | Post-MVP |
| Daily Challenge (seeded) | 💡 | Post-MVP |

## Scoring & Persistence

| Feature | Stage | Notes |
|---------|-------|-------|
| Score = base × distance × streak | 💡 | |
| End-of-round accuracy bonus | 💡 | |
| Center-hit bonus | 💡 | |
| Streak multiplier (capped) | 💡 | |
| Best score (localStorage) | 💡 | |
| Session telemetry logging | 💡 | |

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