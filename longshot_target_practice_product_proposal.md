# Product Proposal: Longshot Target Practice

**Working title:** Longshot Target Practice  
**Format:** Browser-based 2D JavaScript game  
**Primary platform:** Desktop web  
**Recommended stack:** HTML5 Canvas + TypeScript or modern JavaScript + Vite  
**Project type:** Small arcade shooting-gallery / precision-aiming game  
**Document purpose:** Implementation handoff for an agentic software-development team

---

## 1. Executive Summary

Longshot Target Practice is a lightweight browser game built around the sensation of trying to hit small, distant objects through a magnified optic.

The player looks across a rural, desert, junkyard, campground, or improvised backyard target range and attempts to hit beer cans, bottles, signs, clay targets, and other small objects placed at simulated distances. The game is not intended to model real-world rifle ballistics. Its central mechanic is **precision under visible, understandable aiming instability**.

The design deliberately separates:

1. where the player is trying to aim,
2. where the scope/reticle is currently pointing,
3. and where the shot ultimately lands.

This separation allows the game to simulate distance, instability, settling time, recoil, and shot dispersion without requiring a 3D engine or physically accurate projectile simulation.

The recommended MVP is a **2D Canvas game using a large illustrated background as the "world"**, with a camera transform used to pan and zoom across the scene. Targets are sprites positioned in world coordinates. A circular scope overlay, reticle, sway system, target hitboxes, impact effects, scoring, and sound create the experience.

The resulting game should feel less like a military sniper simulator and more like:

> **Duck Hunt + Where's Waldo + a long-distance optic.**

The core player skill should be target acquisition, settling the reticle, anticipating sway, and timing the shot.

---

# 2. Product Vision

## 2.1 Product Thesis

A compelling long-distance shooting experience does not require:

- 3D geometry,
- realistic ballistic tables,
- simulated bullet travel,
- full FPS controls,
- weapon inventories,
- character movement,
- or physics-based targets.

The essential feeling can be produced with four things:

- a visually distant target,
- magnification,
- an unstable-but-readable reticle,
- and satisfying hit feedback.

The game should therefore optimize for **clarity, responsiveness, charm, and repeatability**, rather than realism.

---

## 2.2 Player Fantasy

The player is sitting at a fixed shooting position with a scoped target rifle or equivalent fictionalized precision device.

Across the environment are small improvised targets:

- beer cans,
- soda cans,
- bottles,
- clay pigeons,
- small metal plates,
- old road signs,
- hanging objects,
- cans sitting on fence posts,
- cans balanced on rocks,
- targets on junk vehicles,
- novelty bonus objects.

The player scans the environment through the optic, finds targets, settles their aim, and fires.

A successful shot should be instantly satisfying:

- sharp report,
- recoil kick,
- impact sound,
- target reaction,
- particles,
- score pop-up,
- and perhaps a brief slow-motion or camera emphasis on exceptional shots.

---

# 3. Product Principles

## 3.1 Arcade First, Simulation Second

The player should feel that distance matters, but the system does not need to model actual firearm physics.

"Distance" should function primarily as a **difficulty scalar** that influences:

- target apparent size,
- sway relative to target size,
- allowable hit margin,
- target score,
- optional shot dispersion,
- optional environmental visual effects.

The implementation should favor tunable gameplay constants over real-world formulas.

---

## 3.2 Misses Must Feel Fair

The player should usually understand *why* a shot missed.

Most inaccuracy should come from visible reticle movement or player timing.

Recommended design target:

- **80–90% readable/visible imprecision**
- **10–20% hidden dispersion**

Avoid large invisible random offsets.

A shot where the reticle visibly passed just beside a can feels fair.

A shot where the reticle was perfectly centered but a hidden RNG system produces a miss feels arbitrary.

---

## 3.3 The Scope Is the Game

The scope experience is not just UI decoration. It is the primary mechanical interface.

The player should interact with:

- magnification,
- field of view,
- reticle drift,
- settling,
- recoil,
- perhaps a temporary stabilization mechanic,
- and target acquisition.

If those systems feel good, the game can remain mechanically simple elsewhere.

---

## 3.4 Use Stylization to Reduce Complexity

The game should not try to imitate a military simulator.

A lightly stylized setting allows:

- exaggerated can reactions,
- readable particles,
- forgiving proportions,
- funny bonus targets,
- a slightly oversized scope,
- dramatic ping sounds,
- playful scoring feedback,
- and simplified environmental art.

This also broadens the audience and keeps the tone recreational.

---

# 4. Competitive / Reference Projects

The following projects are useful as implementation or design references.

## 4.1 Holdover

**Repository:**  
https://github.com/ianzepp/holdover

Holdover is a browser-based long-distance shooting training simulator using TypeScript, Vite, and Canvas rendering.

Relevant architectural ideas include:

- Canvas-rendered scope/target view
- TypeScript interfaces
- scenario generation
- reticle modules
- target definitions
- impact rendering
- separation of ballistics, UI, scenarios, and drills
- browser-native implementation

Its repository is organized approximately as:

```text
src/
├── main.ts
├── index.html
├── styles.css
├── types.ts
├── ballistics/
├── drill/
├── reticles/
├── scenarios/
└── ui/
```

Holdover is much more simulation-oriented than the proposed product. It includes concepts such as range estimation, drop, wind, and reticle holdover.

### What to borrow

Borrow the **architectural separation** between:

- game/scenario state,
- targets,
- reticle rendering,
- Canvas rendering,
- and input.

### What not to borrow

Avoid implementing its real ballistic model for the MVP.

The goal here is arcade precision rather than actual long-range training.

### Licensing note

No explicit license was visible in the repository information reviewed during initial research. Treat it as an architectural/design reference unless licensing is independently verified.

---

## 4.2 Scope It Out

**Repository / design document:**  
https://github.com/NPNMD/scope-it-out/blob/main/GDD.md

This project is especially useful as a **game-feel reference**.

Its design document describes:

- narrow scope field of view,
- mouse/touch scope panning,
- Perlin-noise weapon sway,
- breath holding,
- sway reduction while holding breath,
- multiple zoom levels,
- dedicated fire input,
- visual hit effects.

The most relevant mechanic is the use of **smooth noise-based sway rather than random jitter**.

### What to borrow

Use slow, continuous, predictable-ish reticle drift.

The player should be able to observe the sway path and time the shot.

This creates a skill expression that random pixel jitter does not.

### Possible adaptation

Instead of explicitly implementing a "hold breath" mechanic in the MVP, the proposed game can initially use an automatic **settling/stability system**:

- rapid aim movement reduces stability,
- stopping movement gradually restores stability,
- more stability means less sway,
- firing creates a temporary recoil penalty.

A manual steady-aim button can be added later if playtesting shows it improves the game.

---

## 4.3 shoot_game

**Repository:**  
https://github.com/akon47/shoot_game

**License:** MIT

This is a Vanilla JavaScript HTML5 Canvas shooter project.

Relevant files/components include:

```text
camera_class.js
effect_class.js
graphics_class.js
input_class.js
object_class.js
particle_class.js
player_class.js
sound_class.js
sprite_class.js
system_class.js
```

### What to borrow

This project is a useful implementation reference for:

- Canvas game loops,
- camera abstraction,
- input abstraction,
- sprite handling,
- particles,
- effects,
- sound,
- object organization.

Unlike the more simulation-heavy projects, this is particularly relevant to a simple browser-native architecture.

Because it uses an MIT license, code reuse is much more straightforward than with GPL projects, subject to normal attribution/license compliance.

---

## 4.4 Shooting Gallery

**Repository:**  
https://github.com/Sparrowworks/Shooting-Gallery

**Engine:** Godot 4  
**License:** GPL-2.0

This is a conventional point-and-shoot gallery game.

Relevant product ideas include:

- level scripting,
- scoring,
- high scores,
- simple point-and-shoot interactions,
- fast gameplay loops,
- persistent statistics.

### What to borrow

Use it primarily as a design reference for:

- rounds,
- score handling,
- high-score persistence,
- level progression.

### Licensing note

GPL-2.0 is substantially more restrictive than MIT. Do not copy code directly into a proprietary or differently licensed implementation without considering GPL obligations.

---

## 4.5 COLD BORE

**Project page:**  
https://devniee.itch.io/cold-bore

COLD BORE is a recent HTML5 sniper prototype with considerably more simulation depth.

It includes:

- mouse aiming,
- zoom,
- breath control,
- fine aim controls,
- distance/ranging,
- wind,
- spin drift,
- elevation adjustment,
- long-range scoring.

Its simulated distances extend from hundreds to thousands of meters.

### What to borrow

Use COLD BORE as a reference for what a future **simulation mode** could become.

### What not to borrow for MVP

Do not initially implement:

- wind,
- ballistic coefficients,
- elevation dialing,
- spin drift,
- mil-ranging,
- realistic projectile trajectories.

Those systems would move the project away from its intended casual precision-game identity.

---

# 5. Core Gameplay Loop

The basic loop should be:

```text
SCAN
  ↓
FIND TARGET
  ↓
MOVE SCOPE
  ↓
SETTLE AIM
  ↓
TIME SWAY
  ↓
FIRE
  ↓
HIT / MISS FEEDBACK
  ↓
SCORE
  ↓
FIND NEXT TARGET
```

A complete round might contain:

- 10 shots,
- 10 targets,
- 60 seconds,
- or a combination of shot and time limits.

An MVP should start with a simple shot-limited round.

Example:

```text
10 rounds
12 visible targets
Hit as many as possible
Smaller / farther targets = more points
```

---

# 6. Scope and Camera Model

## 6.1 World as a Large 2D Scene

The environment can be one large image:

```text
3000 × 1800
```

or potentially:

```text
4096 × 2304
```

Targets are placed using world coordinates.

Example:

```text
World
┌─────────────────────────────────────────────┐
│ hills                                       │
│                    bottle                   │
│                                             │
│       can                    road sign       │
│                                             │
│              old truck                      │
│                                  bottle     │
│ fence     cooler      barrel                │
└─────────────────────────────────────────────┘
```

The player sees only a portion of this world through the current camera transform.

---

## 6.2 Coordinate Spaces

The implementation should distinguish at least three coordinate systems:

### Screen coordinates

The physical browser Canvas.

```text
0,0 ---------------- canvasWidth
 |
 |
 |
 canvasHeight
```

### Camera/view coordinates

The region currently visible through the scope.

### World coordinates

The full environment image and target positions.

Provide conversion helpers:

```js
screenToWorld(x, y)
worldToScreen(x, y)
```

Avoid performing target logic directly in screen coordinates.

---

## 6.3 Scope Magnification

Zoom should adjust the camera scale.

Conceptually:

```js
camera.zoom = 1.0;
camera.zoom = 2.0;
camera.zoom = 4.0;
```

Higher zoom should:

- enlarge distant targets,
- narrow the visible field of view,
- magnify apparent sway,
- make scanning slower.

This creates a natural tradeoff.

High zoom makes a target easier to see but harder to hold steady.

---

# 7. Aiming Model

This is the central technical system.

The game should not treat mouse position as bullet impact.

Instead:

```text
Mouse Intent
    ↓
Desired Aim
    ↓
Aim Inertia
    ↓
Stability
    ↓
Scope Sway
    ↓
Visible Reticle
    ↓
Shot Dispersion
    ↓
Impact Point
```

---

# 8. Mouse Aim / Follow Inertia

Let the reticle camera lag slightly behind mouse intent.

Simplified pseudocode:

```js
aim.x += (mouse.x - aim.x) * 0.12;
aim.y += (mouse.y - aim.y) * 0.12;
```

A frame-rate-independent version is preferable in production:

```js
const follow = 1 - Math.exp(-followSpeed * dt);

aim.x += (mouse.x - aim.x) * follow;
aim.y += (mouse.y - aim.y) * follow;
```

This creates subtle weight and prevents aiming from feeling like a standard desktop cursor.

---

# 9. Scope Sway

## 9.1 MVP Sine-Wave Model

Version 1 can create smooth sway using several sine waves.

```js
function swayX(t, amount) {
    return (
        Math.sin(t * 1.7) * amount * 0.60 +
        Math.sin(t * 0.63 + 2.1) * amount * 0.40
    );
}

function swayY(t, amount) {
    return (
        Math.sin(t * 1.35 + 1.2) * amount * 0.65 +
        Math.sin(t * 0.51) * amount * 0.35
    );
}
```

Then:

```js
crosshair.x = aim.x + swayX(time, swayAmount);
crosshair.y = aim.y + swayY(time, swayAmount);
```

This is cheap, deterministic, and easy to tune.

---

## 9.2 Recommended Later Model: Smooth Noise

After the basic game works, replace or augment sine sway with:

- Perlin noise,
- Simplex noise,
- or another smooth noise function.

Example conceptual implementation:

```js
const xNoise = noise2D(seedX, time * swaySpeed);
const yNoise = noise2D(seedY, time * swaySpeed);

crosshair.x = aim.x + xNoise * swayAmount;
crosshair.y = aim.y + yNoise * swayAmount;
```

Smooth noise creates wandering behavior that feels biological rather than mechanical.

---

# 10. Stability / Settling Mechanic

The scope should become less stable while the player moves quickly.

Conceptually:

```js
stability -= mouseSpeed * 0.002;
stability += (1 - stability) * 0.015;
```

Clamp:

```js
stability = clamp(stability, 0, 1);
```

Then:

```js
swayAmount = baseSway * (2 - stability);
```

A better frame-rate-independent form:

```js
const movementPenalty = mouseSpeed * movementInstabilityScale;

stability -= movementPenalty * dt;

stability +=
    (1 - stability) *
    (1 - Math.exp(-stabilityRecoveryRate * dt));

stability = clamp(stability, 0, 1);
```

This creates the desired emergent behavior:

```text
spot target
→ move scope
→ stop
→ settle
→ observe sway
→ fire
```

The player does not need a tutorial explaining this in detail because the mechanic can be learned visually.

---

# 11. Distance Model

Distance is a gameplay parameter, not a physical simulation.

Each target stores a nominal distance value.

Example:

```js
{
    id: "can_07",

    type: "beerCan",

    x: 1840,
    y: 920,

    width: 22,
    height: 54,

    distance: 240,

    points: 250
}
```

Distance can influence difficulty.

Example:

```js
const difficulty = target.distance / 300;

const swayAmount =
    baseSway * (0.6 + difficulty * 0.8);

const dispersion =
    baseDispersion * (0.25 + difficulty);
```

Do not treat the constants as real units.

They are tuning parameters.

---

# 12. Recommended Difficulty Factors

A target's total difficulty can combine:

```text
distance
× target size
× target visibility
× target motion
× scope instability
× obstruction
```

An approximate target score can be calculated from the inverse of target area and distance.

Example:

```js
const sizeFactor =
    referenceTargetArea / (target.width * target.height);

const distanceFactor =
    1 + target.distance / distanceScale;

target.points =
    Math.round(
        basePoints *
        sizeFactor *
        distanceFactor
    );
```

Clamp scores to a reasonable range.

---

# 13. Shot Resolution

The player should fire at the **current visible reticle position**, not raw mouse coordinates.

Then add a small amount of dispersion.

```js
function fire() {

    const spread =
        calculateSpread();

    const impact = {
        x:
            crosshair.worldX +
            gaussianRandom() * spread,

        y:
            crosshair.worldY +
            gaussianRandom() * spread
    };

    const hit =
        findTargetAt(
            impact.x,
            impact.y
        );

    if (hit) {
        hitTarget(hit, impact);
    } else {
        createMissEffect(impact);
    }

    applyRecoil();
}
```

---

# 14. Gaussian Dispersion

Avoid simple uniform randomness.

Instead of:

```js
Math.random() * spread
```

use a Gaussian distribution so most shots land near the reticle and extreme deviations are rare.

Example Box-Muller helper:

```js
function gaussianRandom() {

    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    return (
        Math.sqrt(-2.0 * Math.log(u)) *
        Math.cos(2.0 * Math.PI * v)
    );
}
```

Then:

```js
impactX =
    crosshairX +
    gaussianRandom() * spread;

impactY =
    crosshairY +
    gaussianRandom() * spread;
```

---

# 15. Fairness Rule for Dispersion

Hidden spread should remain small.

Recommended philosophy:

```text
Visible aiming error: dominant
Hidden randomness: subtle
```

If a can has a 20-pixel visual width at the current zoom level, a typical hidden spread might only be around 1–3 pixels depending on difficulty.

The exact values should be tuned by playtesting rather than assumed.

---

# 16. Target Hit Detection

For MVP, rectangular or elliptical hitboxes are sufficient.

Simple:

```js
function pointInTarget(x, y, target) {

    return (
        x >= target.left &&
        x <= target.right &&
        y >= target.top &&
        y <= target.bottom
    );
}
```

For irregular targets, define a normalized hit mask later.

Avoid pixel-perfect collision for the first version.

---

# 17. Localized Impact Position

Store where within the object the player hit.

```js
const normalizedX =
    (impactX - target.left) /
    target.width;

const normalizedY =
    (impactY - target.top) /
    target.height;
```

This allows hits to react differently.

Example:

```text
center hit
→ target launches backward

left-edge hit
→ spins clockwise

right-edge hit
→ spins counterclockwise

bottom hit
→ tips over

graze
→ metallic ping + wobble
```

This gives the illusion of physics without requiring a physics engine.

---

# 18. Recoil

Recoil should disrupt aim briefly without making control frustrating.

Possible implementation:

```js
function applyRecoil() {

    recoil.velocityY -= recoilKick;

    recoil.velocityX +=
        gaussianRandom() *
        recoilSideVariance;

    stability *=
        postShotStabilityMultiplier;
}
```

Then decay recoil:

```js
recoil.x *= recoilDecay;
recoil.y *= recoilDecay;
```

The visual camera can kick upward independently from the true impact point.

Do not move the impact point after the trigger event.

---

# 19. Target Types

## MVP

Start with approximately five target archetypes.

### Beer can

- small
- common
- medium score
- falls/spins when hit

### Glass bottle

- narrow target
- higher score
- satisfying shatter effect

### Tin can

- moderate target
- metallic ping
- may tumble dramatically

### Metal plate

- easier
- lower score
- strong audio feedback

### Clay target

- small
- high score
- dramatic break effect

---

## Post-MVP targets

Potential additions:

- hanging cans,
- swinging bottles,
- balloons,
- wind chimes,
- old license plates,
- small bells,
- pumpkins,
- fruit,
- toy robots,
- garden ornaments,
- distant lights,
- hidden bonus objects,
- cans thrown into the air,
- moving toy vehicles.

---

# 20. Target State

Suggested interface:

```ts
interface Target {

    id: string;

    type: TargetType;

    position: {
        x: number;
        y: number;
    };

    size: {
        width: number;
        height: number;
    };

    distance: number;

    scoreValue: number;

    active: boolean;

    hit: boolean;

    hitPoints?: number;

    reaction?: TargetReaction;

    zIndex?: number;
}
```

---

# 21. Visual Composition

A level should resemble an environmental illustration rather than a firing lane.

Potential scenes:

## Desert junkyard

- rocks
- old appliances
- rusty truck
- fence posts
- barrels
- distant ridgeline

## Rural back lot

- wooden fence
- old cooler
- tree stumps
- barn
- tires
- pickup truck

## Campsite

- picnic table
- coolers
- lanterns
- cans
- signs
- fire ring

## Mountain cabin

- tree line
- logs
- fence
- shed
- bottles
- snow patches

The environment should contain many visually plausible locations where a tiny target can be positioned.

---

# 22. Scope Presentation

Recommended layout:

```text
┌─────────────────────────────────────────────┐
│ SCORE  4250                 SHOTS  7 / 10   │
│                                             │
│             dark vignette                   │
│        ╭──────────────────────╮             │
│        │          │           │             │
│        │          │           │             │
│        │ ─────────┼─────────  │             │
│        │          │     CAN   │             │
│        │          │           │             │
│        ╰──────────────────────╯             │
│                                             │
│ DISTANCE 240             STREAK ×4          │
└─────────────────────────────────────────────┘
```

Outside the circular optic:

- darken heavily,
- blur slightly,
- or show a dim peripheral world view.

The scope itself can include:

- circular edge,
- mild vignette,
- reticle,
- slight lens distortion,
- optional chromatic aberration,
- subtle glare.

Do not overdo optical effects because target readability is essential.

---

# 23. HUD

MVP HUD:

```text
Score
Shots remaining
Current streak
Optional target distance
```

Optional:

```text
Accuracy
Round timer
Best score
Current magnification
Stability indicator
```

Avoid creating a visually busy tactical HUD.

The tone should remain arcade-like.

---

# 24. Audio

Audio will have disproportionate impact on game feel.

Minimum audio set:

```text
fire
metal ping
glass break
wood impact
dirt impact
target fall
score confirmation
round start
round complete
```

A distant outdoor impulse response or echo can make the environment feel larger.

Use slight randomized pitch variation on repeated impact sounds.

---

# 25. Miss Feedback

Misses should still produce satisfying information.

Depending on background surface:

```text
dirt
→ dust puff

wood
→ splinter

metal
→ spark/ping

rock
→ chip/dust

glass background prop
→ crack
```

For MVP, surfaces can be defined as simple regions rather than real collision geometry.

Example:

```js
environmentRegions = [
    {
        type: "dirt",
        polygon: [...]
    },
    {
        type: "wood",
        polygon: [...]
    }
];
```

A simpler first version can use only generic dust.

---

# 26. Scoring

Simple MVP scoring:

```text
Target value
+ distance bonus
+ streak multiplier
```

Example:

```js
score =
    target.baseScore *
    distanceMultiplier *
    streakMultiplier;
```

Possible multiplier:

```js
distanceMultiplier =
    1 + target.distance / 500;
```

Streak:

```text
1 hit  → ×1.0
2 hits → ×1.1
3 hits → ×1.2
...
```

Cap the streak multiplier.

---

# 27. Accuracy Bonus

At the end of the round:

```text
Base Score        3,800
Accuracy 80%       +400
Longest Streak       ×5
Perfect Centers     +250
------------------------
TOTAL              4,450
```

This encourages careful shooting instead of rapid clicking.

---

# 28. Center-Hit / Bullseye System

Each target can optionally contain a smaller "perfect" hit zone.

Example:

```js
target.perfectZone = {
    x: 0.30,
    y: 0.20,
    width: 0.40,
    height: 0.60
};
```

Normalized values make the region scale with the target.

Benefits:

- additional score,
- special sound,
- stronger target reaction,
- "CENTER HIT" popup.

---

# 29. Game Modes

## MVP: Ten-Shot Challenge

Player receives 10 shots.

Goal:

> Score as many points as possible.

Advantages:

- easy to understand,
- quick session,
- rewards accuracy,
- easy leaderboard integration later.

---

## Future: Time Attack

Example:

```text
60 seconds
Unlimited shots
Targets respawn
```

---

## Future: Find Them All

A scene contains a fixed number of targets.

Goal:

```text
Find and hit all 15 targets
as quickly as possible.
```

This emphasizes scanning.

---

## Future: One Shot

Each challenge gives:

```text
1 target
1 shot
```

Increasing distance / difficulty per round.

---

## Future: Endless Range

Procedurally select targets and difficulty until the player misses a defined number of times.

---

# 30. Architecture

Recommended project:

```text
/index.html
/style.css

/src
    main.ts
    game.ts

    /core
        GameLoop.ts
        GameState.ts
        Config.ts

    /input
        InputManager.ts

    /camera
        Camera.ts
        ScopeController.ts

    /aim
        AimController.ts
        SwayModel.ts
        StabilityModel.ts
        RecoilModel.ts
        DispersionModel.ts

    /targets
        Target.ts
        TargetManager.ts
        TargetDefinitions.ts

    /effects
        ParticleSystem.ts
        ImpactEffects.ts
        TargetReactions.ts

    /rendering
        Renderer.ts
        ScopeRenderer.ts
        WorldRenderer.ts
        HudRenderer.ts

    /audio
        AudioManager.ts

    /levels
        LevelDefinition.ts
        LevelLoader.ts

    /utils
        math.ts
        random.ts
        coordinates.ts

/assets
    /backgrounds
    /targets
    /effects
    /audio
    /ui
```

This is slightly more structured than absolutely necessary, but it is appropriate for agentic implementation because subsystem ownership is clear.

---

# 31. Main Game Loop

Core loop:

```js
function gameLoop(timestamp) {

    const dt =
        calculateDeltaTime(timestamp);

    updateInput(dt);

    updateAim(dt);
    updateStability(dt);
    updateSway(dt);
    updateRecoil(dt);

    updateTargets(dt);
    updateEffects(dt);

    renderWorld();
    renderTargets();
    renderImpacts();
    renderScope();
    renderHUD();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

Recommended update order:

```text
INPUT
→ AIM INTENT
→ STABILITY
→ SWAY
→ RECOIL
→ CAMERA
→ TARGETS
→ EFFECTS
→ RENDER
```

---

# 32. Game State

Suggested high-level state:

```ts
interface GameState {

    mode:
        | "menu"
        | "playing"
        | "roundComplete";

    score: number;

    shotsRemaining: number;

    shotsFired: number;

    hits: number;

    streak: number;

    bestStreak: number;

    activeLevelId: string;

    elapsedTime: number;
}
```

Derived accuracy:

```js
accuracy =
    shotsFired === 0
        ? 0
        : hits / shotsFired;
```

---

# 33. Aim State

```ts
interface AimState {

    desired: Vec2;

    smoothed: Vec2;

    swayOffset: Vec2;

    recoilOffset: Vec2;

    finalReticle: Vec2;

    stability: number;

    mouseVelocity: Vec2;
}
```

Final reticle:

```js
finalReticle =
    smoothedAim
    + swayOffset
    + recoilOffset;
```

---

# 34. Camera State

```ts
interface CameraState {

    worldX: number;
    worldY: number;

    zoom: number;

    viewportWidth: number;
    viewportHeight: number;
}
```

---

# 35. Level Definition

Prefer data-driven levels.

```ts
interface LevelDefinition {

    id: string;

    name: string;

    background:
        string;

    worldWidth:
        number;

    worldHeight:
        number;

    spawnPoints:
        TargetSpawnPoint[];

    environmentRegions?:
        EnvironmentRegion[];

    startingCamera:
        Vec2;
}
```

Example JSON:

```json
{
  "id": "desert-junkyard-01",
  "name": "The Back Forty",
  "background": "/assets/backgrounds/junkyard.webp",
  "worldWidth": 4096,
  "worldHeight": 2304,
  "startingCamera": {
    "x": 2048,
    "y": 1152
  }
}
```

---

# 36. Target Spawn Points

Rather than allowing arbitrary random placement, author plausible spawn locations.

```ts
interface TargetSpawnPoint {

    x: number;
    y: number;

    distance: number;

    allowedTypes:
        TargetType[];

    scale?: number;

    occlusionMask?: string;
}
```

This gives the level artist control over composition while still allowing randomized sessions.

---

# 37. Randomized Sessions

At round start:

```js
const candidates =
    shuffle(level.spawnPoints);

const chosen =
    candidates.slice(
        0,
        targetsPerRound
    );
```

Then select compatible target types.

Using a deterministic seed is a useful optional feature:

```js
const rng =
    createSeededRandom(roundSeed);
```

Benefits:

- reproducible bugs,
- daily challenges,
- fair leaderboards,
- agent testing.

---

# 38. Rendering Strategy

Recommended draw order:

```text
1. clear canvas
2. background/world
3. environment overlays
4. targets
5. target effects
6. world impacts
7. scope darkening/vignette
8. reticle
9. recoil/scope overlays
10. HUD
11. score popups
```

---

# 39. Scope Mask

Canvas clipping is sufficient.

Conceptually:

```js
ctx.save();

ctx.beginPath();
ctx.arc(
    scopeCenterX,
    scopeCenterY,
    scopeRadius,
    0,
    Math.PI * 2
);

ctx.clip();

renderMagnifiedWorld();

ctx.restore();
```

Then render a dark overlay outside the scope.

---

# 40. Pointer Lock

Initial MVP should **not require Pointer Lock**.

Normal mouse movement is easier for casual users.

Pointer Lock may later be offered as an optional mode for:

- unrestricted panning,
- FPS-like control,
- large world navigation.

---

# 41. Zoom Controls

Recommended:

```text
Mouse wheel
or
Z / X
```

Example:

```js
const zoomLevels = [
    1.0,
    2.0,
    4.0
];
```

Do not initially implement continuous zoom.

Fixed levels are easier to tune and balance.

---

# 42. Input Map

Suggested desktop controls:

```text
Mouse Move   Aim / pan
Left Click   Fire
Wheel        Zoom
R            Restart round
Escape       Pause
```

Possible future control:

```text
Space        Steady aim / hold breath
```

---

# 43. Optional Steady-Aim Mechanic

If added:

```js
if (steadyAim) {

    swayMultiplier = 0.35;

    stamina -=
        steadyDrainRate * dt;

} else {

    stamina +=
        steadyRecoveryRate * dt;
}
```

Do not implement this until automatic settling has been playtested.

A dedicated steady mechanic may be redundant if the natural settling system already produces satisfying pacing.

---

# 44. Tuning Parameters

Centralize all gameplay tuning.

Example:

```ts
const AIM_CONFIG = {

    followSpeed: 10,

    baseSwayPixels: 8,

    swaySpeed: 1,

    movementInstability: 0.003,

    stabilityRecovery: 2.2,

    minimumStability: 0,

    maximumStability: 1,

    baseDispersion: 1.5,

    recoilKick: 12,

    recoilDecay: 0.86
};
```

Never scatter tuning constants throughout the codebase.

---

# 45. Debug Overlay

An implementation/debug mode will save significant time.

Toggle with:

```text
F1
```

Display:

```text
FPS
camera position
zoom
mouse world position
reticle world position
stability
sway x/y
dispersion radius
target hitboxes
spawn locations
active target IDs
```

Example:

```text
STABILITY: 0.82
SWAY:      4.3 px
SPREAD:    1.7 px
ZOOM:      4×
WORLD:     1834, 927
```

This should exist early in development.

---

# 46. Telemetry for Playtesting

Even without a backend, log session metrics locally:

```ts
{
    shots: 10,
    hits: 7,
    accuracy: 0.70,

    averageAimTime: 2.4,

    averageMissDistance: 7.3,

    averageStabilityAtFire: 0.78,

    zoomUsage: {
        "1x": 0.10,
        "2x": 0.30,
        "4x": 0.60
    }
}
```

These metrics can help tune the game.

Especially useful:

```text
stability at moment of firing
miss distance
time between target acquisition and shot
```

---

# 47. Player Feedback Rules

## Hit

Trigger:

- impact sound,
- target reaction,
- small particle burst,
- score popup,
- streak increment.

## Miss

Trigger:

- environment impact,
- no score,
- streak reset or reduction.

## Center hit

Trigger:

- enhanced target reaction,
- special audio cue,
- bonus text,
- bonus score.

---

# 48. Target Reaction Without Physics Engine

Avoid adding Matter.js or another physics engine in the MVP unless necessary.

Use authored animation.

Example target reaction state:

```ts
interface TargetReaction {

    rotation: number;

    rotationVelocity: number;

    offset: Vec2;

    velocity: Vec2;

    gravity: number;
}
```

Update:

```js
velocity.y += gravity * dt;

offset.x += velocity.x * dt;
offset.y += velocity.y * dt;

rotation +=
    rotationVelocity * dt;
```

This produces convincing tumbling for lightweight objects.

---

# 49. Performance Targets

Target:

```text
60 FPS
desktop browser
1080p Canvas
```

Likely target counts:

```text
10–30 active targets
<100 transient particles
1 large background
```

Canvas 2D should handle this comfortably.

---

# 50. Responsive Scaling

Use a logical render resolution.

Example:

```text
1920 × 1080 virtual canvas
```

Scale to browser size while preserving aspect ratio.

Do not make aim behavior dependent on physical CSS pixels.

---

# 51. Asset Strategy

## MVP assets

One polished environment is better than several weak levels.

Initial asset list:

```text
1 background illustration
5 target sprites
1 scope overlay
1 reticle
3–5 impact sprites
5–10 sound effects
basic HUD icons
```

Target sprites should be authored at higher resolution than their normal display size so zoom does not immediately expose pixelation.

---

# 52. Optional Parallax

A future visual enhancement can divide the environment into:

```text
foreground
midground
background
```

These layers move at subtly different rates while panning.

This creates pseudo-3D depth without a 3D engine.

Not necessary for MVP.

---

# 53. Optional Atmospheric Effects

Post-MVP:

- heat shimmer,
- dust,
- moving grass,
- drifting smoke,
- sun glare,
- bugs,
- blowing paper,
- birds,
- distant traffic.

These make a static scene feel alive.

They should not obscure targets excessively.

---

# 54. Difficulty Progression

Difficulty can increase using controlled variables.

### Early

```text
large targets
100–150 distance
low sway
high contrast
```

### Medium

```text
smaller targets
200–300 distance
moderate sway
partial visual clutter
```

### Hard

```text
tiny targets
300–500 distance
higher zoom required
greater sway
moving/hanging targets
```

Again, numbers are fictional gameplay units.

---

# 55. Possible Long-Term Progression

If the game expands:

```text
earn score / currency
        ↓
unlock scopes
        ↓
unlock reticles
        ↓
unlock ranges
        ↓
unlock novelty targets
```

Avoid weapon-stat progression that undermines player skill.

Cosmetic or side-grade optics may be more appropriate.

---

# 56. Optic Characteristics

Future scopes can change:

```text
magnification
field of view
reticle design
lens clarity
sway perception
settling behavior
```

Avoid making expensive optics simply eliminate difficulty.

---

# 57. Daily Challenge

Seeded scenario generation enables:

```text
same range
same target locations
same target types
same sway seed
same shot count
```

for all players during a given day.

This is a natural future leaderboard mode.

---

# 58. Accessibility

Recommended options:

```text
sway intensity
camera motion
recoil shake
sound volume
UI scale
reticle brightness
reticle color
high-contrast target outline mode
```

A reduced-motion mode should reduce:

- camera shake,
- recoil animation,
- impact shake.

Do not necessarily remove aim difficulty; it can instead reduce purely visual motion.

---

# 59. Save Data

MVP can use `localStorage`.

Store:

```ts
{
    bestScore: number,
    bestAccuracy: number,
    roundsPlayed: number,
    settings: {},
    unlockedLevels: []
}
```

No backend is required initially.

---

# 60. Error / Edge Cases

Implementation should explicitly handle:

- resizing the browser while playing,
- tab losing focus,
- clicks outside the Canvas,
- firing while paused,
- firing after shots reach zero,
- targets partially outside camera view,
- targets overlapping,
- extremely high/low frame rates,
- mobile/touch input if detected,
- audio autoplay restrictions.

Pause automatically on `visibilitychange`.

---

# 61. Suggested MVP Scope

The MVP should include only:

## Environment

- one level
- one large background

## Targets

- beer can
- bottle
- metal plate

## Gameplay

- mouse aiming
- smooth scope follow
- sway
- settling/stability
- 3 zoom levels
- 10-shot round
- hit detection
- scoring
- streaks

## Feedback

- recoil
- target reactions
- basic particles
- fire sound
- impact sounds
- round-complete screen

## Persistence

- local best score

That is enough to validate the core concept.

---

# 62. Explicit MVP Non-Goals

Do **not** initially implement:

- 3D world
- Three.js
- FPS movement
- multiplayer
- user accounts
- inventory
- real-world weapons database
- realistic bullet physics
- wind simulation
- bullet drop
- ballistic coefficient
- projectile travel time
- scope turret dialing
- AI enemies
- characters
- damage systems
- ragdolls
- server backend
- complex physics engine

These features are distractions until aiming itself is proven fun.

---

# 63. MVP Success Criteria

The prototype succeeds if:

1. Players immediately understand what to do.
2. Hitting a can at simulated long range feels difficult but possible.
3. Misses usually feel attributable to visible aim movement.
4. Players naturally pause for the reticle to settle.
5. A hit feels disproportionately satisfying relative to the system's simplicity.
6. Players want another 10-shot round after finishing the first.
7. The complete experience runs smoothly in a normal desktop browser.
8. The game's core systems remain tunable through centralized config values.

---

# 64. Core Acceptance Tests

## Aim

- Mouse movement changes desired aim.
- Reticle does not snap directly to cursor.
- Reticle follows smoothly.
- Reticle sway continues while stationary.
- Fast mouse movement temporarily increases instability.
- Stability recovers after movement stops.

## Zoom

- Player can switch zoom levels.
- Zoom centers on appropriate camera aim position.
- Targets appear larger at higher zoom.
- Visible world area decreases at higher zoom.

## Shooting

- Left click fires exactly one shot.
- Shot count decrements exactly once.
- Impact is computed from final reticle position.
- Small configured dispersion is applied.
- Hits are detected correctly.
- Miss effects occur when no target is struck.

## Score

- Target hit awards points.
- Miss awards no points.
- Streak increments on hit.
- Streak resets/reduces on miss.
- Round ends after shot limit.

## Persistence

- Best score survives page reload.

---

# 65. Development Sequence

## Phase 0 — Skeleton

Implement:

```text
Vite
Canvas
game loop
resize handling
input
debug overlay
```

Exit criterion:

> A cursor-controlled camera can pan across a placeholder background.

---

## Phase 1 — Scope Prototype

Implement:

```text
scope mask
reticle
zoom
camera
screen/world conversion
```

Exit criterion:

> Player can smoothly inspect the environment through a working optic.

---

## Phase 2 — Aim Feel

Implement:

```text
aim smoothing
sway
stability
recoil
```

Exit criterion:

> Merely moving and settling the reticle feels satisfying.

This phase should receive disproportionate tuning attention.

---

## Phase 3 — Targets

Implement:

```text
target data
sprite rendering
spawn points
hitboxes
shot resolution
```

Exit criterion:

> Player can shoot stationary cans.

---

## Phase 4 — Feedback

Implement:

```text
target tumble
particles
impact decals
sound
screen shake
score popup
```

Exit criterion:

> A hit feels good.

---

## Phase 5 — Game Loop

Implement:

```text
shots remaining
score
streak
round start
round complete
restart
best score
```

Exit criterion:

> Complete replayable 10-shot game exists.

---

## Phase 6 — Art Pass

Implement:

```text
final background
final sprites
scope artwork
audio polish
UI polish
```

---

# 66. Suggested Agent Workstreams

For an implementation-agent team, split ownership roughly as follows.

## Agent A — Core / Camera

Own:

```text
game loop
camera
zoom
coordinate transforms
resize
```

## Agent B — Aim Mechanics

Own:

```text
aim smoothing
sway
stability
dispersion
recoil
```

## Agent C — Target Systems

Own:

```text
targets
spawn points
hit detection
target reactions
scoring
```

## Agent D — Rendering / UX

Own:

```text
scope rendering
HUD
particles
impact effects
menus
round-complete UI
```

## Reviewer

Focus especially on:

```text
coordinate-space correctness
frame-rate independence
input latency
hidden randomness
config centralization
event ordering
```

---

# 67. Important Implementation Constraint

Do not let each subsystem independently manipulate screen coordinates.

Use world coordinates as the authoritative gameplay coordinate system.

A common source of bugs will otherwise be:

```text
target coordinates
≠
camera coordinates
≠
scope coordinates
≠
screen coordinates
```

Centralize coordinate conversion.

---

# 68. Suggested Event Flow When Firing

```text
PLAYER CLICK
    ↓
validate game state
    ↓
capture current reticle world position
    ↓
calculate dispersion
    ↓
calculate impact point
    ↓
query target manager
    ↓
HIT? --------------------- MISS?
 ↓                           ↓
target reaction         environment impact
score                   streak reset
streak increment
 ↓                           ↓
        apply recoil
             ↓
      decrement ammo
             ↓
     emit shot event
             ↓
      update HUD
```

---

# 69. Example Shot Function

More complete pseudocode:

```js
function fireShot() {

    if (game.mode !== "playing") {
        return;
    }

    if (game.shotsRemaining <= 0) {
        return;
    }

    const origin = {
        x: aim.finalReticleWorld.x,
        y: aim.finalReticleWorld.y
    };

    const spread =
        dispersionModel.getSpread({
            stability: aim.stability,
            zoom: camera.zoom
        });

    const impact = {
        x:
            origin.x +
            gaussianRandom() * spread,

        y:
            origin.y +
            gaussianRandom() * spread
    };

    const target =
        targetManager.findHit(impact);

    if (target) {

        const localImpact =
            target.worldToLocal(impact);

        targetManager.hit(
            target,
            localImpact
        );

        scoring.registerHit(
            target,
            localImpact
        );

    } else {

        effects.createMissImpact(
            impact
        );

        scoring.registerMiss();
    }

    recoil.apply();

    audio.play("fire");

    game.shotsRemaining--;
    game.shotsFired++;

    if (
        game.shotsRemaining === 0
    ) {
        completeRound();
    }
}
```

---

# 70. Aim Update Pseudocode

```js
function updateAim(dt) {

    const desired =
        input.getAimPosition();

    const velocity =
        calculateMouseVelocity(
            desired,
            aim.previousDesired,
            dt
        );

    aim.mouseVelocity =
        velocity;

    const follow =
        1 -
        Math.exp(
            -CONFIG.followSpeed * dt
        );

    aim.smoothed.x +=
        (desired.x - aim.smoothed.x) *
        follow;

    aim.smoothed.y +=
        (desired.y - aim.smoothed.y) *
        follow;

    aim.previousDesired =
        desired;
}
```

---

# 71. Stability Update Pseudocode

```js
function updateStability(dt) {

    const mouseSpeed =
        length(
            aim.mouseVelocity
        );

    aim.stability -=
        mouseSpeed *
        CONFIG.movementInstability *
        dt;

    const recovery =
        1 -
        Math.exp(
            -CONFIG.stabilityRecovery *
            dt
        );

    aim.stability +=
        (1 - aim.stability) *
        recovery;

    aim.stability =
        clamp(
            aim.stability,
            0,
            1
        );
}
```

---

# 72. Sway Update Pseudocode

```js
function updateSway(time) {

    const instability =
        1 - aim.stability;

    const amount =
        CONFIG.baseSway *
        (
            1 +
            instability *
            CONFIG.instabilitySwayMultiplier
        );

    aim.swayOffset.x =
        swayX(
            time,
            amount
        );

    aim.swayOffset.y =
        swayY(
            time,
            amount
        );
}
```

---

# 73. Final Reticle Calculation

```js
aim.finalReticle.x =
    aim.smoothed.x +
    aim.swayOffset.x +
    aim.recoilOffset.x;

aim.finalReticle.y =
    aim.smoothed.y +
    aim.swayOffset.y +
    aim.recoilOffset.y;
```

The game must use this final position for the shot.

---

# 74. First Playtest Questions

Ask testers:

1. Does aiming feel too loose or too precise?
2. Can you tell when the scope has "settled"?
3. When you miss, do you understand why?
4. Does zoom help enough to justify the narrower view?
5. Is sway predictable enough to time?
6. Is there too much hidden dispersion?
7. Does hitting a can feel satisfying?
8. Does recoil interrupt the next target acquisition appropriately?
9. Would you immediately play another round?
10. Which targets are most fun to hit?

---

# 75. Likely Tuning Risk

The biggest product risk is not technical complexity.

It is **aim feel**.

The game can fail if:

```text
sway too low
→ trivial click game

sway too high
→ frustrating

randomness too high
→ unfair

scope inertia too high
→ sluggish

scope inertia too low
→ ordinary mouse cursor

settling too fast
→ meaningless

settling too slow
→ tedious
```

Therefore implement a live developer tuning panel early.

---

# 76. Developer Tuning Panel

Suggested controls:

```text
Aim Follow Speed       [ slider ]
Base Sway              [ slider ]
Sway Speed             [ slider ]
Movement Penalty       [ slider ]
Recovery Speed         [ slider ]
Dispersion             [ slider ]
Recoil                 [ slider ]
Recoil Recovery        [ slider ]
Zoom Sway Multiplier   [ slider ]
```

Allow exporting current values as JSON.

This is especially useful in an agentic workflow because human reviewers can tune gameplay without asking agents to edit constants repeatedly.

---

# 77. Suggested Config File

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

---

# 78. Technical Recommendation

For the MVP:

### Recommended

```text
TypeScript
Vite
Canvas 2D
Web Audio
CSS
localStorage
```

### Avoid unless requirements change

```text
React
Three.js
Babylon.js
Phaser
Matter.js
Redux
backend framework
database
```

A small UI library could be introduced later if menus or metagame systems become substantial.

---

# 79. Why Canvas 2D Is the Right Starting Point

Canvas provides:

- direct control over render order,
- fast sprite rendering,
- simple clipping for the scope,
- transforms for camera/zoom,
- easy particles,
- low dependency count,
- extremely fast iteration.

The MVP contains no requirement that inherently needs a 3D engine.

---

# 80. Potential Future Evolution

If the core game succeeds, the architecture can grow toward:

```text
multi-layer parallax
animated environments
moving targets
daily challenges
leaderboards
multiple optics
multiple ranges
wind as an arcade modifier
trajectory visualization
challenge campaigns
procedural target placement
community levels
```

Only after those systems prove insufficient should a true 3D implementation be considered.

---

# 81. Long-Term Simulation Mode

A separate optional mode could later borrow concepts demonstrated by Holdover and COLD BORE.

Possible systems:

```text
drop
wind
range estimation
holdover
reticle subtensions
scope dialing
projectile travel time
```

This should be a **separate mode**, not a gradual corruption of the arcade mode.

The arcade game's identity depends on immediate accessibility.

---

# 82. Product Positioning Statement

> Longshot Target Practice is a browser-based precision shooting-gallery game in which the challenge comes from finding small distant objects, settling a magnified optic, anticipating natural reticle sway, and timing satisfying shots. It delivers the feeling of long-distance target shooting through a lightweight 2D Canvas implementation rather than a full firearm or ballistics simulator.

---

# 83. One-Sentence Implementation Rule

> **Build a shooting gallery whose input feels like a long-distance optic, not a sniper simulator that happens to contain cans.**

---

# 84. Recommended First Milestone

The first implementation milestone should contain **no scoring and almost no game logic**.

Build a single page with:

1. one environment image,
2. one can,
3. one scope,
4. smooth mouse aim,
5. aim settling,
6. sway,
7. one zoom control,
8. one shot,
9. one hit reaction.

Then answer only one question:

> **Is aiming at and hitting this single can fun?**

If yes, build the game around it.

If no, continue tuning the aiming model before expanding scope.

---

# 85. Reference Links

### Holdover
Browser precision-rifle training simulator; useful for Canvas/TypeScript structure and long-distance scope concepts.

https://github.com/ianzepp/holdover

### Scope It Out
Game design reference for scope panning, Perlin-noise sway, zoom, breath holding, and hit feedback.

https://github.com/NPNMD/scope-it-out/blob/main/GDD.md

### shoot_game
Vanilla JavaScript + HTML5 Canvas shooter; useful implementation patterns for camera, input, objects, particles, graphics, and sound.

https://github.com/akon47/shoot_game

License: MIT.

### Shooting Gallery
Godot shooting-gallery reference with rounds, scoring, high scores, and point-and-shoot gameplay.

https://github.com/Sparrowworks/Shooting-Gallery

License: GPL-2.0.

### COLD BORE
HTML5 long-range sniper prototype showing the simulation-heavy end of the design space.

https://devniee.itch.io/cold-bore

---

# 86. Final Recommendation

Start with an extremely small vertical slice.

The essential chain is:

```text
MOUSE INTENT
   ↓
SMOOTH AIM
   ↓
STABILITY
   ↓
VISIBLE SWAY
   ↓
RETICLE
   ↓
SMALL DISPERSION
   ↓
SHOT
   ↓
SATISFYING IMPACT
```

Everything else is secondary.

If that chain feels good, a surprisingly rich game can be built with a modest amount of JavaScript and artwork.

If it does not feel good, additional systems will not fix it.

The implementation team should therefore treat **aim feel, fairness, and impact feedback** as the three highest-priority product requirements.
