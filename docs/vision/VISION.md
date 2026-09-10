---
title: "Longshot Target Practice — Product Vision"
owner: "K_St_Games Team"
status: Active
lastUpdated: 2026-09-10
kind: vision
---
# Product Vision: Longshot Target Practice

## Product Thesis

A compelling long-distance shooting experience does not require 3D geometry, realistic ballistic tables, simulated bullet travel, or full FPS controls. The essential feeling can be produced with four things:

- a visually distant target,
- magnification,
- an unstable but readable reticle,
- and satisfying hit feedback.

## Player Fantasy

The player sits at a fixed shooting position with a scoped precision device. Across the environment are small improvised targets — beer cans, bottles, clay pigeons, metal plates, old road signs, hanging objects, novelty bonus items. The player scans through the optic, finds targets, settles their aim, and fires.

A successful shot is instantly satisfying: sharp report, recoil kick, impact sound, target reaction, particles, score pop-up.

## Design Identity

> Build a shooting gallery whose input feels like a long-distance optic, not a sniper simulator that happens to contain cans.

## Core Principles

### Arcade First, Simulation Second
Distance functions as a **difficulty scalar** (apparent size, sway ratio, hit margin, score). The implementation favors tunable gameplay constants over real-world formulas.

### Misses Must Feel Fair
80–90% of imprecision is visible in the reticle movement. The player usually understands *why* a shot missed. Avoid large invisible random offsets.

### The Scope Is the Game
Magnification, field of view, reticle drift, settling, recoil — these are the primary mechanical interface, not UI decoration.

### Stylization Over Realism
A lightly stylized setting allows exaggerated reactions, readable particles, forgiving proportions, funny bonus targets, dramatic audio, and simplified environmental art. This broadens the audience and keeps the tone recreational.

## Positioning Statement

> Longshot Target Practice is a browser-based precision shooting-gallery game in which the challenge comes from finding small distant objects, settling a magnified optic, anticipating natural reticle sway, and timing satisfying shots. It delivers the feeling of long-distance target shooting through a lightweight 2D Canvas implementation rather than a full firearm or ballistics simulator.

## References

| Project | Use | License |
|---------|-----|---------|
| [Holdover](https://github.com/ianzepp/holdover) | Architecture — Canvas/TS scope sim | None visible |
| [Scope It Out](https://github.com/NPNMD/scope-it-out/blob/main/GDD.md) | Game-feel — Perlin sway, breath hold | Design reference |
| [shoot_game](https://github.com/akon47/shoot_game) | Implementation — canvas patterns, camera, particles | MIT |
| [Shooting Gallery](https://github.com/Sparrowworks/Shooting-Gallery) | Design — rounds, scoring, high scores | GPL-2.0 |
| [COLD BORE](https://devniee.itch.io/cold-bore) | Long-term future — simulation mode reference | Itch.io prototype |

## MVP Success Criteria

1. Players immediately understand what to do
2. Hitting a can at simulated long range feels difficult but possible
3. Misses usually feel attributable to visible aim movement
4. Players naturally pause for the reticle to settle
5. A hit feels disproportionately satisfying relative to the system's simplicity
6. Players want another 10-shot round after finishing the first
7. Runs smoothly in a normal desktop browser
8. Core systems remain tunable through centralized config