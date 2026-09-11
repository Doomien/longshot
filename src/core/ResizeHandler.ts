// Canvas resize handling: logical 1920x1080 render resolution scaled to the
// viewport while preserving aspect ratio (letterboxed), with devicePixelRatio
// support. Engine seam: a Phaser adapter would replace this with
// Phaser.Scale.FIT + CENTER_BOTH; the rest of the sim only reads viewportWidth/
// viewportHeight + scale, so the swap is localized here.

export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;

export interface Viewport {
  /** CSS pixel size of the canvas backing store actually drawn to. */
  canvasWidth: number;
  canvasHeight: number;
  /** Scale from logical (1920x1080) units to backing-store pixels. */
  scale: number;
  /** Letterbox offsets in backing-store pixels. */
  offsetX: number;
  offsetY: number;
}

export class ResizeHandler {
  private viewport: Viewport = {
    canvasWidth: LOGICAL_WIDTH,
    canvasHeight: LOGICAL_HEIGHT,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {}

  get current(): Viewport {
    return this.viewport;
  }

  /** Fit canvas to window and return the new viewport. Idempotent. */
  resize(): Viewport {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const targetAspect = LOGICAL_WIDTH / LOGICAL_HEIGHT;
    const windowAspect = cssW / cssH;

    let cssDrawW = cssW;
    let cssDrawH = cssH;
    if (windowAspect > targetAspect) {
      cssDrawW = cssH * targetAspect;
    } else {
      cssDrawH = cssW / targetAspect;
    }

    this.canvas.width = Math.round(cssDrawW * dpr);
    this.canvas.height = Math.round(cssDrawH * dpr);
    this.canvas.style.width = `${Math.round(cssDrawW)}px`;
    this.canvas.style.height = `${Math.round(cssDrawH)}px`;

    // Center via CSS margins on body flex? Keep simple: canvas fills via style
    // and we render logical coords scaled. Offsets are zero because the canvas
    // element itself is letterboxed by its CSS size.
    const scale = (cssDrawW * dpr) / LOGICAL_WIDTH;
    this.viewport = {
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      scale,
      offsetX: 0,
      offsetY: 0,
    };
    return this.viewport;
  }

  /** Map a client (mouse) event to logical 1920x1080 coordinates. */
  toLogical(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / Math.max(rect.width, 1);
    const py = (clientY - rect.top) / Math.max(rect.height, 1);
    return { x: px * LOGICAL_WIDTH, y: py * LOGICAL_HEIGHT };
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
