// Frame-rate-independent game loop over requestAnimationFrame.
// The loop itself is DOM-bound, but the contract it drives is engine-agnostic:
//   update(dtSeconds, elapsedSeconds) — pure sim step, no rendering
//   render() — consumes a snapshot, performs all drawing
// A future Phaser integration would replace this class with a Phaser.Scene
// adapter calling the same update() functions; sim code must never import this.

export interface LoopCallbacks {
  update: (dt: number, elapsed: number) => void;
  render: () => void;
}

export interface IGameLoop {
  start(): void;
  stop(): void;
  readonly fps: number;
}

export class DomGameLoop implements IGameLoop {
  private rafId = 0;
  private lastTimestamp = -1;
  private elapsed = 0;
  private running = false;
  private fpsSamples: number[] = [];
  private currentFps = 0;

  constructor(private readonly callbacks: LoopCallbacks) {}

  get fps(): number {
    return this.currentFps;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = -1;
    const tick = (timestamp: number) => {
      if (!this.running) return;
      if (this.lastTimestamp < 0) this.lastTimestamp = timestamp;
      // Clamp dt so tab-switch hitches don't teleport the sim (max 100ms step).
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;
      this.elapsed += dt;
      this.trackFps(dt);
      this.callbacks.update(dt, this.elapsed);
      this.callbacks.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }

  private readonly handleVisibility = (): void => {
    // Pause time accumulation while hidden: reset timestamp so the next
    // frame after refocus doesn't see a huge dt (dt is clamped anyway,
    // but this keeps elapsed honest).
    if (document.hidden) this.lastTimestamp = -1;
  };

  private trackFps(dt: number): void {
    if (dt <= 0) return;
    this.fpsSamples.push(1 / dt);
    if (this.fpsSamples.length > 30) this.fpsSamples.shift();
    const sum = this.fpsSamples.reduce((a, b) => a + b, 0);
    this.currentFps = sum / this.fpsSamples.length;
  }
}
