import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type ResizeHandler } from '../core/ResizeHandler.ts';
import type { Vec2 } from '../core/types.ts';

// Input seam: the sim consumes IInputSource only. Today this is fed by DOM
// mouse/wheel events (DomInputManager). A Phaser build would implement the same
// interface from Phaser.Input events without touching Camera/Game.

export interface IInputSource {
  /** Desired aim point in logical screen coords (1920x1080 space). */
  readonly aimScreen: Vec2;
  /** True while the left mouse button is held (for scene-editor dragging). */
  readonly mouseDown: boolean;
  /** Consume one pending "zoom in" step, if any. */
  consumeZoomIn(): boolean;
  /** Consume one pending "zoom out" step, if any. */
  consumeZoomOut(): boolean;
  /** Consume one pending debug-overlay toggle (F1). */
  consumeDebugToggle(): boolean;
  /** Consume one pending dev-tool toggle (F2 or `). */
  consumePanelToggle(): boolean;
  /** Consume one pending shot (left click). */
  consumeFirePressed(): boolean;
  /** Consume one pending scene-editor delete (right click). */
  consumeDeletePressed(): boolean;
  /** Consume one pending round restart (R). */
  consumeRestartPressed(): boolean;
  /** Consume one pending mute toggle (M). */
  consumeMuteToggle(): boolean;
  /** Consume a pending level-switch hotkey (1-9), or null. Zero-based index. */
  consumeLevelHotkey(): number | null;
}

export class DomInputManager implements IInputSource {
  private aim: Vec2 = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 };
  private zoomInSteps = 0;
  private zoomOutSteps = 0;
  private debugToggles = 0;
  private panelToggles = 0;
  private firePresses = 0;
  private deletePresses = 0;
  private levelHotkey = -1;
  private restartPresses = 0;
  private mutePresses = 0;
  private mouseHeld = false;
  private detachFns: Array<() => void> = [];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly resizer: ResizeHandler,
    private readonly onGesture?: () => void,
  ) {}

  get aimScreen(): Vec2 {
    // Return a copy so consumers can't mutate internal state.
    return { x: this.aim.x, y: this.aim.y };
  }

  get mouseDown(): boolean {
    return this.mouseHeld;
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
    // Audio unlock must run synchronously inside the user gesture.
    const notifyGesture = (): void => {
      this.onGesture?.();
    };
    const onKey = (e: KeyboardEvent): void => {
      notifyGesture();
      if (e.key === 'F1') {
        e.preventDefault();
        this.debugToggles += 1;
      } else if (e.key === 'F2' || e.key === '`' || e.key === '~') {
        if (e.key === 'F2') e.preventDefault();
        this.panelToggles += 1;
      } else if (e.key === 'z' || e.key === 'Z') {
        this.zoomInSteps += 1;
      } else if (e.key === 'x' || e.key === 'X') {
        this.zoomOutSteps += 1;
      } else if (e.key === 'r' || e.key === 'R') {
        this.restartPresses += 1;
      } else if (e.key === 'm' || e.key === 'M') {
        this.mutePresses += 1;
      } else if (e.key >= '1' && e.key <= '9') {
        this.levelHotkey = Number(e.key) - 1;
      }
    };
    const onFire = (e: MouseEvent): void => {
      notifyGesture();
      if (e.button === 0) {
        this.firePresses += 1;
        this.mouseHeld = true;
      }
    };
    const onRelease = (e: MouseEvent): void => {
      if (e.button === 0) this.mouseHeld = false;
    };
    const onDelete = (e: MouseEvent): void => {
      // Right-click deletes the grabbed scene item in edit mode.
      e.preventDefault();
      this.deletePresses += 1;
    };
    window.addEventListener('mousemove', onMove);
    // { passive: false } so preventDefault() stops page scroll on wheel zoom.
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onFire);
    window.addEventListener('mouseup', onRelease);
    this.canvas.addEventListener('contextmenu', onDelete);
    this.detachFns = [
      () => window.removeEventListener('mousemove', onMove),
      () => window.removeEventListener('wheel', onWheel),
      () => window.removeEventListener('keydown', onKey),
      () => window.removeEventListener('mousedown', onFire),
      () => window.removeEventListener('mouseup', onRelease),
      () => this.canvas.removeEventListener('contextmenu', onDelete),
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

  consumePanelToggle(): boolean {
    if (this.panelToggles > 0) {
      this.panelToggles -= 1;
      return true;
    }
    return false;
  }

  consumeFirePressed(): boolean {
    if (this.firePresses > 0) {
      this.firePresses -= 1;
      return true;
    }
    return false;
  }

  consumeDeletePressed(): boolean {
    if (this.deletePresses > 0) {
      this.deletePresses -= 1;
      return true;
    }
    return false;
  }

  consumeRestartPressed(): boolean {
    if (this.restartPresses > 0) {
      this.restartPresses -= 1;
      return true;
    }
    return false;
  }

  consumeMuteToggle(): boolean {
    if (this.mutePresses > 0) {
      this.mutePresses -= 1;
      return true;
    }
    return false;
  }

  consumeLevelHotkey(): number | null {
    if (this.levelHotkey < 0) return null;
    const idx = this.levelHotkey;
    this.levelHotkey = -1;
    return idx;
  }
}
