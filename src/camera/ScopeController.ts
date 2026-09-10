// Zoom-level state machine. Pure logic: fixed levels [1x, 2x, 4x] per spec
// (no continuous zoom in MVP — easier to tune and balance). The Camera owns
// the numeric zoom; this owns *which* level is active.

export class ScopeController {
  private index: number;

  constructor(
    private readonly zoomLevels: number[],
    defaultZoom: number,
  ) {
    const found = zoomLevels.indexOf(defaultZoom);
    this.index = found >= 0 ? found : 0;
  }

  get zoom(): number {
    return this.zoomLevels[this.index];
  }

  get levelIndex(): number {
    return this.index;
  }

  get levels(): number[] {
    return [...this.zoomLevels];
  }

  zoomIn(): boolean {
    if (this.index < this.zoomLevels.length - 1) {
      this.index += 1;
      return true;
    }
    return false;
  }

  zoomOut(): boolean {
    if (this.index > 0) {
      this.index -= 1;
      return true;
    }
    return false;
  }
}
