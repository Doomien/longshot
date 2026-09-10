import { AimController } from './aim/AimController.ts';
import { Camera } from './camera/Camera.ts';
import { ScopeController } from './camera/ScopeController.ts';
import { DEFAULT_CONFIG, type GameConfig } from './core/Config.ts';
import { DomGameLoop, type IGameLoop } from './core/GameLoop.ts';
import { createInitialGameState, type GameState } from './core/GameState.ts';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, ResizeHandler } from './core/ResizeHandler.ts';
import { loadSave, storeSave, type SaveData } from './core/Persistence.ts';
import { buildTelemetry, type ShotSample } from './core/Telemetry.ts';
import type { Vec2 } from './core/types.ts';
import { DomInputManager, type IInputSource } from './input/InputManager.ts';
import { BACK_FORTY } from './levels/LevelDefinition.ts';
import { CanvasRenderer } from './rendering/CanvasRenderer.ts';
import type { IRenderer, RenderFrame } from './rendering/Renderer.ts';
import { scoreForHit, accuracyBonus } from './targets/Scoring.ts';
import { TargetManager } from './targets/TargetManager.ts';
import type { TargetType } from './targets/TargetDefinitions.ts';
import { AudioManager, type SoundName } from './audio/AudioManager.ts';
import { ParticleSystem } from './effects/ParticleSystem.ts';
import { spawnHitBurst, spawnMissPuff } from './effects/ImpactEffects.ts';
import { ScorePopups } from './effects/ScorePopups.ts';
import { ScreenShake } from './effects/ScreenShake.ts';
import { updateTargetReactions } from './effects/TargetReactions.ts';
import { smoothingFactor } from './utils/math.ts';
import type { Rng } from './utils/random.ts';

// Game orchestrator: owns sim state (GameState, Camera, ScopeController) and
// wires the engine seams (IInputSource, IGameLoop, IRenderer) together.
// Update() is pure sim over dt — no ctx, no DOM events — so a Phaser scene
// could drive these same methods. Render() freezes an immutable RenderFrame.

export interface GameOptions {
  config?: GameConfig;
  input?: IInputSource;
  renderer?: IRenderer;
  loop?: IGameLoop;
}

export class Game {
  readonly config: GameConfig;
  readonly state: GameState;
  readonly camera: Camera;
  readonly scope: ScopeController;
  readonly aim: AimController;
  readonly targets: TargetManager;
  private readonly particles = new ParticleSystem();
  private readonly popups = new ScorePopups();
  private readonly shake = new ScreenShake();
  private readonly audio = new AudioManager();
  private save: SaveData = loadSave();
  private shotLog: ShotSample[] = [];
  private roundBonus = 0;
  private isNewBest = false;
  private paused = false;
  private lastShot: RenderFrame['lastShot'] = null;
  private readonly input: IInputSource;
  private readonly renderer: IRenderer;
  private readonly loop: IGameLoop;
  private readonly resizer: ResizeHandler | null;
  private elapsed = 0;
  private debugVisible = false;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: GameOptions = {},
  ) {
    this.config = options.config ?? structuredClone(DEFAULT_CONFIG);
    // Boot to the menu; the round starts on first click / R.
    this.state = createInitialGameState(this.config.round.shots, 'menu');
    this.camera = new Camera(
      this.config.world.width,
      this.config.world.height,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT,
      this.config.world.width / 2,
      this.config.world.height / 2,
      this.config.scope.defaultZoom,
    );
    this.scope = new ScopeController(
      this.config.scope.zoomLevels,
      this.config.scope.defaultZoom,
    );
    this.camera.setZoom(this.scope.zoom);
    this.aim = new AimController(this.config, {
      x: this.config.world.width / 2,
      y: this.config.world.height / 2,
    });
    this.targets = new TargetManager(BACK_FORTY, 8);

    this.resizer = new ResizeHandler(canvas, ctx);
    this.resizer.resize();

    const domInput = new DomInputManager(canvas, this.resizer, () => this.audio.unlock());
    domInput.attach();
    this.input = options.input ?? domInput;

    this.renderer =
      options.renderer ??
      new CanvasRenderer(ctx, () => this.resizer!.current, this.config);

    this.loop =
      options.loop ??
      new DomGameLoop({
        update: (dt, elapsed) => this.update(dt, elapsed),
        render: () => this.render(),
      });

    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }

  /** Sim step. Public so tests / future engine adapters can drive it. */
  update(dt: number, elapsed: number): void {
    this.elapsed = elapsed;
    this.state.elapsedTime = elapsed;

    if (this.input.consumeDebugToggle()) {
      this.debugVisible = !this.debugVisible;
    }

    let zoomChanged = false;
    // Drain queued steps so fast wheel spins don't get stuck at one level.
    while (this.input.consumeZoomIn()) zoomChanged = this.scope.zoomIn() || zoomChanged;
    while (this.input.consumeZoomOut()) zoomChanged = this.scope.zoomOut() || zoomChanged;
    if (zoomChanged) this.camera.setZoom(this.scope.zoom);

    // Restart / mute intents are consumed before the sim step so pause can
    // intercept them without advancing aim, camera, or effects.
    let wantsRestart = false;
    while (this.input.consumeRestartPressed()) wantsRestart = true;
    while (this.input.consumeMuteToggle()) this.audio.toggleMute();

    if (this.paused) {
      // Click resumes (swallowed, never fires); R restarts fresh.
      let resume = false;
      while (this.input.consumeFirePressed()) resume = true;
      if (wantsRestart) {
        this.paused = false;
        this.restartRound();
      } else if (resume) {
        this.paused = false;
      }
      return;
    }
    if (wantsRestart) {
      this.restartRound();
      return;
    }

    // Phase 2 aim pipeline: mouse position maps proportionally across the
    // world (camera-independent desired point) -> follow inertia + sway +
    // recoil in AimController -> camera eases toward the smoothed aim.
    // Two-stage lag gives the scope visible weight; the reticle (not the
    // raw cursor) is what the scope centers on and what shots resolve from.
    // Aim updates BEFORE fire handling so shots resolve from this frame.
    const mouse = this.input.aimScreen;
    const desiredWorld = {
      x: (mouse.x / LOGICAL_WIDTH) * this.config.world.width,
      y: (mouse.y / LOGICAL_HEIGHT) * this.config.world.height,
    };
    this.aim.update(dt, desiredWorld, this.scope.zoom);
    const smoothed = this.aim.snapshot.smoothed;
    const k = smoothingFactor(this.config.camera.panSpeed, dt);
    const pos = this.camera.position;
    this.camera.setPosition(
      pos.x + (smoothed.x - pos.x) * k,
      pos.y + (smoothed.y - pos.y) * k,
    );

    if (this.state.mode === 'menu') {
      // First click starts the round; the world stays alive behind the menu.
      let start = false;
      while (this.input.consumeFirePressed()) start = true;
      if (start) this.restartRound();
    } else if (this.state.mode === 'playing') {
      while (this.input.consumeFirePressed()) this.fireShot();
    } else {
      while (this.input.consumeFirePressed()) {
        /* swallow clicks on the round-complete panel */
      }
    }

    // Feedback sim (proposal section 31 order: targets -> effects).
    updateTargetReactions(this.targets.all, dt);
    this.particles.update(dt);
    this.popups.update(dt);
    this.shake.update(dt);
  }

  /**
   * Shot resolution (proposal section 68): validate -> capture reticle ->
   * dispersion -> impact -> hit query -> score/recoil -> decrement.
   * Impact is computed from the FINAL reticle (smoothed + sway + recoil).
   */
  fireShot(rng: Rng = Math.random): void {
    if (this.state.mode !== 'playing') return;
    if (this.state.shotsRemaining <= 0) return;

    const impact: Vec2 = this.aim.impactPoint(rng);
    const found = this.targets.findHit(impact);
    this.audio.play('fire');
    // Telemetry sample BEFORE recoil/stability effects land.
    this.shotLog.push({ stability: this.aim.snapshot.stability, zoom: this.scope.zoom });
    if (found) {
      const res = this.targets.markHit(found, impact, this.elapsed);
      this.state.streak += 1;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      const { points } = scoreForHit(found, this.state.streak, res.center);
      this.state.score += points;
      this.state.hits += 1;
      this.lastShot = { impact, hit: true, points, center: res.center };
      spawnHitBurst(this.particles, impact, found.type, rng);
      this.popups.add(impact, res.center ? `+${points} CENTER!` : `+${points}`);
      this.audio.play(materialSound(found.type));
      this.audio.play('score');
      this.shake.add(0.35);
    } else {
      this.state.streak = 0;
      this.lastShot = { impact, hit: false, points: 0, center: false };
      spawnMissPuff(this.particles, impact, rng);
      this.audio.play('dirt');
      this.shake.add(0.15);
    }

    // Recoil applies AFTER impact resolution — never moves this shot.
    this.aim.applyShotEffects(rng);
    this.state.shotsFired += 1;
    this.state.shotsRemaining -= 1;
    if (this.state.shotsRemaining <= 0) {
      this.completeRound();
    }
  }

  /** Round end: accuracy bonus, persistence, telemetry. */
  private completeRound(): void {
    this.state.mode = 'roundComplete';
    this.roundBonus = accuracyBonus(this.state.hits, this.state.shotsFired);
    this.state.score += this.roundBonus;
    const accuracy = this.state.shotsFired > 0 ? this.state.hits / this.state.shotsFired : 0;
    this.isNewBest = this.state.score > this.save.bestScore;
    this.save = {
      bestScore: Math.max(this.save.bestScore, this.state.score),
      bestAccuracy: Math.max(this.save.bestAccuracy, accuracy),
      roundsPlayed: this.save.roundsPlayed + 1,
    };
    storeSave(this.save);
    this.audio.play('round');
    // eslint-disable-next-line no-console
    console.log('[longshot] round telemetry', buildTelemetry(this.shotLog, this.state.hits));
  }

  restartRound(seed: number = Date.now()): void {
    const fresh = createInitialGameState(this.config.round.shots);
    this.state.mode = fresh.mode;
    this.state.score = 0;
    this.state.shotsRemaining = fresh.shotsRemaining;
    this.state.shotsFired = 0;
    this.state.hits = 0;
    this.state.streak = 0;
    this.state.bestStreak = 0;
    this.state.elapsedTime = 0;
    this.targets.reset(seed);
    this.particles.clear();
    this.popups.clear();
    this.shake.reset();
    this.shotLog = [];
    this.roundBonus = 0;
    this.isNewBest = false;
    this.lastShot = null;
  }

  /** Freeze current sim state into a renderer-agnostic frame and draw it. */
  render(): void {
    const aimScreen = this.input.aimScreen;
    const aimWorld = this.camera.screenToWorld(aimScreen.x, aimScreen.y);
    const snap = this.aim.snapshot;
    // Screen shake offsets the RENDER camera only — sim coords untouched.
    const shakePx = this.shake.offset(this.elapsed);
    const zoom = this.scope.zoom;
    const cam = this.camera.state;
    const shakenCamera = {
      ...cam,
      x: cam.x + shakePx.x / zoom,
      y: cam.y + shakePx.y / zoom,
    };
    const frame: RenderFrame = {
      camera: shakenCamera,
      worldWidth: this.config.world.width,
      worldHeight: this.config.world.height,
      aimScreen,
      aimWorld,
      reticleScreen: this.camera.worldToScreen(snap.finalReticle.x, snap.finalReticle.y),
      reticleWorld: { ...snap.finalReticle },
      stability: snap.stability,
      swayPixels: snap.swayPixels,
      spreadWorld: snap.spreadWorld,
      targets: this.targets.all,
      particles: this.particles.list,
      popups: this.popups.list,
      lastShot: this.lastShot ? { ...this.lastShot, impact: { ...this.lastShot.impact } } : null,
      hud: {
        mode: this.state.mode,
        score: this.state.score,
        shotsRemaining: this.state.shotsRemaining,
        shotsTotal: this.config.round.shots,
        streak: this.state.streak,
        muted: this.audio.isMuted,
        paused: this.paused,
        accuracy: this.state.shotsFired > 0 ? this.state.hits / this.state.shotsFired : 0,
        hits: this.state.hits,
        bestStreak: this.state.bestStreak,
        bestScore: this.save.bestScore,
        roundBonus: this.roundBonus,
        isNewBest: this.isNewBest,
      },
      zoom: this.scope.zoom,
      zoomLevels: this.scope.levels,
      fps: this.loop.fps,
      elapsed: this.elapsed,
      debugVisible: this.debugVisible,
    };
    this.renderer.render(frame);
  }

  private readonly handleResize = (): void => {
    this.resizer?.resize();
  };

  private readonly handleVisibility = (): void => {
    // Auto-pause when the tab hides mid-round; resume on click.
    if (typeof document !== 'undefined' && document.hidden && this.state.mode === 'playing') {
      this.paused = true;
    }
  };
}

function materialSound(type: TargetType): SoundName {
  switch (type) {
    case 'glassBottle':
      return 'glass';
    case 'clayTarget':
      return 'clay';
    default:
      return 'metal';
  }
}
