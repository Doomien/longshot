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

    // Phase 0 pan model: mouse position across the screen maps proportionally
    // across the world; the camera eases toward it frame-rate-independently.
    // (Phase 2 replaces this with aim-follow + sway + stability.)
    const aim = this.input.aimScreen;
    const targetX = (aim.x / LOGICAL_WIDTH) * this.config.world.width;
    const targetY = (aim.y / LOGICAL_HEIGHT) * this.config.world.height;
    const k = smoothingFactor(this.config.camera.panSpeed, dt);
    const pos = this.camera.position;
    this.camera.setPosition(
      pos.x + (targetX - pos.x) * k,
      pos.y + (targetY - pos.y) * k,
    );
  }

  /** Freeze current sim state into a renderer-agnostic frame and draw it. */
  render(): void {
    const aimScreen = this.input.aimScreen;
    const aimWorld = this.camera.screenToWorld(aimScreen.x, aimScreen.y);
    const frame: RenderFrame = {
      camera: this.camera.state,
      worldWidth: this.config.world.width,
      worldHeight: this.config.world.height,
      aimScreen,
      aimWorld,
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
