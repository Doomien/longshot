import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type ResizeHandler } from '../core/ResizeHandler.ts';
import type { Vec2 } from '../core/types.ts';

// Input seam: the sim consumes IInputSource only. Today this is fed by DOM
// mouse/wheel events (DomInputManager). A Phaser build would implement the same
// interface from Phaser.Input events without touching Camera/Game.

export interface IInputSource {
  /** Desired aim point in logical screen coords (1920x1080 space). */
  readonly aimScreen: Vec2;
  /** Consume one pending "zoom in" step, if any. */
  consumeZoomIn(): boolean;
  /** Consume one pending "zoom out" step, if any. */
  consumeZoomOut(): boolean;
  /** Consume one pending debug-overlay toggle (F1). */
  consumeDebugToggle(): boolean;
}

export class DomInputManager implements IInputSource {
  private aim: Vec2 = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 };
  private zoomInSteps = 0;
  private zoomOutSteps = 0;
  private debugToggles = 0;
  private detachFns: Array<() => void> = [];

  constructor(
    _canvas: HTMLCanvasElement,
    private readonly resizer: ResizeHandler,
  ) {}

  get aimScreen(): Vec2 {
    // Return a copy so consumers can't mutate internal state.
    return { x: this.aim.x, y: this.aim.y };
  }

  attach(): void {
    const onMove = (e: MouseEvent): void => {
      const p = this.resizer.toLogical(e.clientX, e.clientY);
      this.aim.x = p.x;
      this.aim.y = p.y;
    };
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      if (e.deltaY < 0) this.zoomInSteps += 1;
      else if (e.deltaY > 0) this.zoomOutSteps += 1;
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.debugToggles += 1;
      } else if (e.key === 'z' || e.key === 'Z') {
        this.zoomInSteps += 1;
      } else if (e.key === 'x' || e.key === 'X') {
        this.zoomOutSteps += 1;
      }
    };
    window.addEventListener('mousemove', onMove);
    // { passive: false } so preventDefault() stops page scroll on wheel zoom.
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    this.detachFns = [
      () => window.removeEventListener('mousemove', onMove),
      () => window.removeEventListener('wheel', onWheel),
      () => window.removeEventListener('keydown', onKey),
    ];
  }

  detach(): void {
    for (const fn of this.detachFns) fn();
    this.detachFns = [];
  }

  consumeZoomIn(): boolean {
    if (this.zoomInSteps > 0) {
      this.zoomInSteps -= 1;
      return true;
    }
    return false;
  }

  consumeZoomOut(): boolean {
    if (this.zoomOutSteps > 0) {
      this.zoomOutSteps -= 1;
      return true;
    }
    return false;
  }

  consumeDebugToggle(): boolean {
    if (this.debugToggles > 0) {
      this.debugToggles -= 1;
      return true;
    }
    return false;
  }
}
