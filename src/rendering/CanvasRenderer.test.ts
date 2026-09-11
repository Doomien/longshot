import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../core/Config.ts';
import { CanvasRenderer } from './CanvasRenderer.ts';
import { drawDebugOverlay } from './DebugOverlay.ts';
import type { RenderFrame } from './Renderer.ts';
import { drawScope, scopeRadius } from './ScopeRenderer.ts';
import { drawWorld } from './WorldRenderer.ts';

// Smoke tests: run every renderer against a stub ctx to catch runtime typos
// (undefined vars, bad calls) without needing a browser. Not pixel assertions.

function stubCtx(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() };
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function makeFrame(debugVisible = false): RenderFrame {
  return {
    camera: { x: 2048, y: 1152, zoom: 2, viewportWidth: 1920, viewportHeight: 1080 },
    worldWidth: 4096,
    worldHeight: 2304,
    aimScreen: { x: 960, y: 540 },
    aimWorld: { x: 2048, y: 1152 },
    reticleScreen: { x: 960, y: 540 },
    reticleWorld: { x: 2048, y: 1152 },
    stability: 0.9,
    swayPixels: 5,
    spreadWorld: 1.5,
    targets: [],
    particles: [],
    popups: [],
    lastShot: null,
    hud: {
      mode: 'playing', score: 0, shotsRemaining: 10, shotsTotal: 10, streak: 0, muted: false,
      paused: false, accuracy: 0, hits: 0, bestStreak: 0, bestScore: 0, roundBonus: 0,
      isNewBest: false, nearestDistance: null,
    },
    zoom: 2,
    zoomLevels: [1, 2, 4],
    fps: 60,
    elapsed: 1.5,
    debugVisible,
  };
}

describe('renderers', () => {
  it('scope radius scales with viewport height', () => {
    expect(scopeRadius(1080)).toBeCloseTo(1080 * 0.32);
  });

  it('drawWorld/drawScope/drawDebugOverlay run without throwing', () => {
    const ctx = stubCtx();
    expect(() => drawWorld(ctx, makeFrame())).not.toThrow();
    expect(() => drawScope(ctx, makeFrame())).not.toThrow();
    expect(() => drawDebugOverlay(ctx, makeFrame(true), DEFAULT_CONFIG)).not.toThrow();
    expect(() => drawDebugOverlay(ctx, makeFrame(false), DEFAULT_CONFIG)).not.toThrow();
  });

  it('CanvasRenderer.render clears and draws a full frame', () => {
    const ctx = stubCtx();
    const renderer = new CanvasRenderer(
      ctx,
      () => ({ canvasWidth: 1920, canvasHeight: 1080, scale: 1, offsetX: 0, offsetY: 0 }),
      DEFAULT_CONFIG,
    );
    expect(() => renderer.render(makeFrame(true))).not.toThrow();
    expect(ctx.setTransform).toHaveBeenCalled();
  });

  it('draws menu, round-complete, and paused overlays without throwing', () => {
    const ctx = stubCtx();
    const renderer = new CanvasRenderer(
      ctx,
      () => ({ canvasWidth: 1920, canvasHeight: 1080, scale: 1, offsetX: 0, offsetY: 0 }),
      DEFAULT_CONFIG,
    );
    const base = makeFrame(false);
    const menu = { ...base, hud: { ...base.hud, mode: 'menu' as const } };
    const done = {
      ...base,
      hud: {
        ...base.hud, mode: 'roundComplete' as const, score: 1234, hits: 7,
        accuracy: 0.7, bestStreak: 4, bestScore: 1234, roundBonus: 200, isNewBest: true,
      },
    };
    const paused = { ...base, hud: { ...base.hud, paused: true } };
    expect(() => renderer.render(menu)).not.toThrow();
    expect(() => renderer.render(done)).not.toThrow();
    expect(() => renderer.render(paused)).not.toThrow();
  });
});
