import { AimController } from './aim/AimController.ts';
import { Camera } from './camera/Camera.ts';
import { ScopeController } from './camera/ScopeController.ts';
import { DEFAULT_CONFIG, type GameConfig } from './core/Config.ts';
import { DomGameLoop, type IGameLoop } from './core/GameLoop.ts';
import { createInitialGameState, type GameState } from './core/GameState.ts';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, ResizeHandler } from './core/ResizeHandler.ts';
import { DomInputManager, type IInputSource } from './input/InputManager.ts';
import { CanvasRenderer } from './rendering/CanvasRenderer.ts';
import type { IRenderer, RenderFrame } from './rendering/Renderer.ts';
import { smoothingFactor } from './utils/math.ts';

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
    this.state = createInitialGameState(this.config.round.shots);
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

    this.resizer = new ResizeHandler(canvas, ctx);
    this.resizer.resize();

    const domInput = new DomInputManager(canvas, this.resizer);
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
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
    window.removeEventListener('resize', this.handleResize);
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

    // Phase 2 aim pipeline: mouse position maps proportionally across the
    // world (camera-independent desired point) -> follow inertia + sway +
    // recoil in AimController -> camera eases toward the smoothed aim.
    // Two-stage lag gives the scope visible weight; the reticle (not the
    // raw cursor) is what the scope centers on and what shots resolve from.
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
  }

  /** Freeze current sim state into a renderer-agnostic frame and draw it. */
  render(): void {
    const aimScreen = this.input.aimScreen;
    const aimWorld = this.camera.screenToWorld(aimScreen.x, aimScreen.y);
    const snap = this.aim.snapshot;
    const frame: RenderFrame = {
      camera: this.camera.state,
      worldWidth: this.config.world.width,
      worldHeight: this.config.world.height,
      aimScreen,
      aimWorld,
      reticleScreen: this.camera.worldToScreen(snap.finalReticle.x, snap.finalReticle.y),
      reticleWorld: { ...snap.finalReticle },
      stability: snap.stability,
      swayPixels: snap.swayPixels,
      spreadWorld: snap.spreadWorld,
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
}
