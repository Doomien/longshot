import { configToJson, type GameConfig } from '../core/Config.ts';
import { TARGET_DEFINITIONS, type TargetType } from '../targets/TargetDefinitions.ts';

// Live developer tool, toggled with `~` (backquote) or F2. Two halves:
//   1. Tuning — sliders/inputs bound live to the shared config object, so
//      changes apply to aim/sway/recoil/dispersion on the next frame.
//   2. Scene — edit-mode placement of targets, background swapping, and
//      level-JSON export (first step toward a data-driven scene pipeline).
// Nothing persists; everything resets on reload. DOM-only: node/test
// environments never touch document (toggle() guards).

export interface SceneHooks {
  isEditing(): boolean;
  setEditing(v: boolean): void;
  addTargetAtReticle(type: TargetType): void;
  getBackground(): string | null;
  setBackground(path: string | null): void;
  exportSceneJson(): string;
  resetScene(): void;
}

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

  constructor(
    private readonly config: GameConfig,
    private readonly hooks?: SceneHooks,
  ) {}

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

  private sections(): Array<{ title: string; specs: SliderSpec[] }> {
    const aim = this.config.aim;
    const shoot = this.config.shooting;
    const cam = this.config.camera;
    const fx = this.config.effects;
    return [
      {
        title: 'Aim',
        specs: [
          { label: 'Follow speed', min: 1, max: 20, step: 0.5, get: () => aim.followSpeed, set: (v) => (aim.followSpeed = v) },
          { label: 'Base sway px', min: 0, max: 24, step: 0.5, get: () => aim.baseSwayPixels, set: (v) => (aim.baseSwayPixels = v) },
          { label: 'Sway speed', min: 0.1, max: 3, step: 0.1, get: () => aim.swaySpeed, set: (v) => (aim.swaySpeed = v) },
          { label: 'Move penalty', min: 0, max: 0.01, step: 0.0005, get: () => aim.movementInstability, set: (v) => (aim.movementInstability = v) },
          { label: 'Recovery /s', min: 0.5, max: 6, step: 0.1, get: () => aim.stabilityRecovery, set: (v) => (aim.stabilityRecovery = v) },
          { label: 'Unstable sway x', min: 0, max: 2, step: 0.1, get: () => aim.instabilitySwayMultiplier, set: (v) => (aim.instabilitySwayMultiplier = v) },
        ],
      },
      {
        title: 'Shooting',
        specs: [
          { label: 'Dispersion', min: 0, max: 6, step: 0.1, get: () => shoot.baseDispersion, set: (v) => (shoot.baseDispersion = v) },
          { label: 'Stability spread x', min: 0, max: 3, step: 0.1, get: () => shoot.stabilitySpreadFactor, set: (v) => (shoot.stabilitySpreadFactor = v) },
          { label: 'Recoil kick', min: 0, max: 30, step: 1, get: () => shoot.recoilKick, set: (v) => (shoot.recoilKick = v) },
          { label: 'Recoil side var', min: 0, max: 10, step: 0.5, get: () => shoot.recoilSideVariance, set: (v) => (shoot.recoilSideVariance = v) },
          { label: 'Recoil decay /s', min: 1, max: 15, step: 0.5, get: () => shoot.recoilDecayRate, set: (v) => (shoot.recoilDecayRate = v) },
        ],
      },
      {
        title: 'Camera / Effects',
        specs: [
          { label: 'Pan speed /s', min: 1, max: 12, step: 0.5, get: () => cam.panSpeed, set: (v) => (cam.panSpeed = v) },
          { label: 'Gravity px/s²', min: 0, max: 3000, step: 50, get: () => fx.gravity, set: (v) => (fx.gravity = v) },
          { label: 'Tumble damping /s', min: 0.1, max: 6, step: 0.1, get: () => fx.reactionDamping, set: (v) => (fx.reactionDamping = v) },
          { label: 'Shake max px', min: 0, max: 30, step: 1, get: () => fx.shakeMaxPixels, set: (v) => (fx.shakeMaxPixels = v) },
        ],
      },
    ];
  }

  private build(): HTMLDivElement {
    const root = document.createElement('div');
    root.id = 'dev-tool';
    root.style.cssText = [
      'position:fixed', 'top:12px', 'right:12px', 'z-index:10',
      'background:rgba(8,12,16,0.94)', 'border:1px solid rgba(120,200,255,0.5)',
      'padding:12px 14px', 'font:12px ui-monospace,Menlo,monospace', 'color:#bfe3ff',
      'width:300px', 'max-height:calc(100vh - 24px)', 'overflow-y:auto',
    ].join(';');
    const title = document.createElement('div');
    title.textContent = 'DEV TOOL (`) — live, no persist';
    title.style.fontWeight = '700';
    title.style.marginBottom = '8px';
    root.appendChild(title);

    for (const section of this.sections()) {
      root.appendChild(this.header(section.title));
      for (const spec of section.specs) root.appendChild(this.sliderRow(spec));
    }

    root.appendChild(this.header('Round'));
    root.appendChild(this.shotsRow());

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export tuning JSON to console';
    exportBtn.style.width = '100%';
    exportBtn.style.marginTop = '4px';
    exportBtn.addEventListener('click', () => {
      // eslint-disable-next-line no-console
      console.log('[longshot] tuning config\n' + configToJson(this.config));
      exportBtn.textContent = 'Exported — see console';
      setTimeout(() => (exportBtn.textContent = 'Export tuning JSON to console'), 1500);
    });
    root.appendChild(exportBtn);

    if (this.hooks) root.appendChild(this.sceneSection());

    return root;
  }

  private header(text: string): HTMLDivElement {
    const h = document.createElement('div');
    h.textContent = text;
    h.style.fontWeight = '700';
    h.style.margin = '10px 0 6px';
    h.style.color = '#ffe66d';
    return h;
  }

  private sliderRow(spec: SliderSpec): HTMLLabelElement {
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
    return row;
  }

  private shotsRow(): HTMLLabelElement {
    const row = document.createElement('label');
    row.style.display = 'block';
    row.style.marginBottom = '6px';
    const name = document.createElement('div');
    name.textContent = 'Shots per round (applies on restart)';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '30';
    input.value = String(this.config.round.shots);
    input.style.width = '100%';
    input.addEventListener('change', () => {
      const v = Math.max(1, Math.min(30, Math.floor(Number(input.value) || 10)));
      this.config.round.shots = v;
      input.value = String(v);
    });
    row.appendChild(name);
    row.appendChild(input);
    return row;
  }

  private sceneSection(): HTMLDivElement {
    const hooks = this.hooks!;
    const box = document.createElement('div');
    box.appendChild(this.header('Scene (edit mode)'));

    const hint = document.createElement('div');
    hint.textContent = 'Drag targets to move · right-click deletes · firing paused while editing.';
    hint.style.opacity = '0.8';
    hint.style.marginBottom = '6px';
    box.appendChild(hint);

    const editRow = document.createElement('label');
    editRow.style.display = 'block';
    editRow.style.marginBottom = '6px';
    const editBox = document.createElement('input');
    editBox.type = 'checkbox';
    editBox.checked = hooks.isEditing();
    editBox.addEventListener('change', () => hooks.setEditing(editBox.checked));
    editRow.appendChild(editBox);
    editRow.appendChild(document.createTextNode(' Edit mode'));
    box.appendChild(editRow);

    const addRow = document.createElement('div');
    addRow.style.display = 'flex';
    addRow.style.gap = '6px';
    addRow.style.marginBottom = '6px';
    const select = document.createElement('select');
    select.style.flex = '1';
    for (const type of Object.keys(TARGET_DEFINITIONS) as TargetType[]) {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      select.appendChild(opt);
    }
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add at reticle';
    addBtn.addEventListener('click', () => hooks.addTargetAtReticle(select.value as TargetType));
    addRow.appendChild(select);
    addRow.appendChild(addBtn);
    box.appendChild(addRow);

    const bgLabel = document.createElement('div');
    bgLabel.textContent = 'Background path (under public/)';
    const bgRow = document.createElement('div');
    bgRow.style.display = 'flex';
    bgRow.style.gap = '6px';
    bgRow.style.marginBottom = '6px';
    const bgInput = document.createElement('input');
    bgInput.type = 'text';
    bgInput.value = hooks.getBackground() ?? '';
    bgInput.placeholder = '/assets/backgrounds/back-forty.svg';
    bgInput.style.flex = '1';
    const bgBtn = document.createElement('button');
    bgBtn.textContent = 'Apply';
    const refreshBg = (): void => {
      bgInput.value = hooks.getBackground() ?? '';
    };
    bgBtn.addEventListener('click', () => {
      const v = bgInput.value.trim();
      hooks.setBackground(v.length > 0 ? v : null);
      refreshBg();
    });
    bgRow.appendChild(bgInput);
    bgRow.appendChild(bgBtn);
    box.appendChild(bgLabel);
    box.appendChild(bgRow);

    const area = document.createElement('textarea');
    area.readOnly = true;
    area.rows = 6;
    area.style.width = '100%';
    area.style.marginBottom = '6px';
    area.placeholder = 'Exported level JSON appears here…';
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '6px';
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export scene JSON';
    exportBtn.style.flex = '1';
    exportBtn.addEventListener('click', () => {
      const json = hooks.exportSceneJson();
      area.value = json;
      // eslint-disable-next-line no-console
      console.log('[longshot] scene JSON\n' + json);
    });
    const dlBtn = document.createElement('button');
    dlBtn.textContent = 'Download';
    dlBtn.addEventListener('click', () => {
      if (!area.value) return;
      const blob = new Blob([area.value], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'level-export.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset scene';
    resetBtn.addEventListener('click', () => {
      hooks.resetScene();
      refreshBg();
      area.value = '';
    });
    btnRow.appendChild(exportBtn);
    btnRow.appendChild(dlBtn);
    btnRow.appendChild(resetBtn);
    box.appendChild(area);
    box.appendChild(btnRow);
    return box;
  }
}
