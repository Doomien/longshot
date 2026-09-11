import { configToJson, type GameConfig } from '../core/Config.ts';

// Live developer tuning panel (Standing Rule: config centralization).
// DOM overlay toggled with F2 — the sim reads the same config object by
// reference, so slider changes apply to aim/sway/recoil/dispersion/pan on
// the next frame with no reload. "Export JSON" logs current values for
// copy-paste into Config.ts. DOM-only: constructed lazily and guarded so
// node/test environments never touch document.

interface SliderSpec {
  label: string;
  min: number;
  max: number;
  step: number;
  get: () => number;
  set: (v: number) => void;
}

export class TuningPanel {
  private root: HTMLDivElement | null = null;
  private visible = false;

  constructor(private readonly config: GameConfig) {}

  get isVisible(): boolean {
    return this.visible;
  }

  toggle(): void {
    if (typeof document === 'undefined') return;
    this.visible = !this.visible;
    if (this.visible) {
      this.root ??= this.build();
      document.body.appendChild(this.root);
    } else {
      this.root?.remove();
    }
  }

  private specs(): SliderSpec[] {
    const aim = this.config.aim;
    const shoot = this.config.shooting;
    const cam = this.config.camera;
    return [
      { label: 'Follow speed', min: 1, max: 20, step: 0.5, get: () => aim.followSpeed, set: (v) => (aim.followSpeed = v) },
      { label: 'Base sway px', min: 0, max: 24, step: 0.5, get: () => aim.baseSwayPixels, set: (v) => (aim.baseSwayPixels = v) },
      { label: 'Sway speed', min: 0.1, max: 3, step: 0.1, get: () => aim.swaySpeed, set: (v) => (aim.swaySpeed = v) },
      { label: 'Move penalty', min: 0, max: 0.01, step: 0.0005, get: () => aim.movementInstability, set: (v) => (aim.movementInstability = v) },
      { label: 'Recovery /s', min: 0.5, max: 6, step: 0.1, get: () => aim.stabilityRecovery, set: (v) => (aim.stabilityRecovery = v) },
      { label: 'Unstable sway x', min: 0, max: 2, step: 0.1, get: () => aim.instabilitySwayMultiplier, set: (v) => (aim.instabilitySwayMultiplier = v) },
      { label: 'Dispersion', min: 0, max: 6, step: 0.1, get: () => shoot.baseDispersion, set: (v) => (shoot.baseDispersion = v) },
      { label: 'Recoil kick', min: 0, max: 30, step: 1, get: () => shoot.recoilKick, set: (v) => (shoot.recoilKick = v) },
      { label: 'Recoil decay /s', min: 1, max: 15, step: 0.5, get: () => shoot.recoilDecayRate, set: (v) => (shoot.recoilDecayRate = v) },
      { label: 'Pan speed /s', min: 1, max: 12, step: 0.5, get: () => cam.panSpeed, set: (v) => (cam.panSpeed = v) },
    ];
  }

  private build(): HTMLDivElement {
    const root = document.createElement('div');
    root.id = 'tuning-panel';
    root.style.cssText = [
      'position:fixed', 'top:12px', 'right:12px', 'z-index:10',
      'background:rgba(8,12,16,0.92)', 'border:1px solid rgba(120,200,255,0.5)',
      'padding:12px 14px', 'font:12px ui-monospace,Menlo,monospace', 'color:#bfe3ff',
      'width:280px',
    ].join(';');
    const title = document.createElement('div');
    title.textContent = 'TUNING (F2) — live';
    title.style.fontWeight = '700';
    title.style.marginBottom = '8px';
    root.appendChild(title);

    for (const spec of this.specs()) {
      const row = document.createElement('label');
      row.style.display = 'block';
      row.style.marginBottom = '6px';
      const name = document.createElement('div');
      const val = document.createElement('span');
      const refresh = (): void => {
        val.textContent = ` ${spec.get().toFixed(3)}`;
      };
      name.textContent = spec.label;
      name.appendChild(val);
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step);
      input.value = String(spec.get());
      input.style.width = '100%';
      input.addEventListener('input', () => {
        spec.set(Number(input.value));
        refresh();
      });
      refresh();
      row.appendChild(name);
      row.appendChild(input);
      root.appendChild(row);
    }

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export JSON to console';
    exportBtn.style.width = '100%';
    exportBtn.style.marginTop = '4px';
    exportBtn.addEventListener('click', () => {
      // eslint-disable-next-line no-console
      console.log('[longshot] tuning config\n' + configToJson(this.config));
      exportBtn.textContent = 'Exported — see console';
      setTimeout(() => (exportBtn.textContent = 'Export JSON to console'), 1500);
    });
    root.appendChild(exportBtn);
    return root;
  }
}
