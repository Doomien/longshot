import { describe, expect, it, vi } from 'vitest';
import { coverDrawRect, drawWorld } from './WorldRenderer.ts';
import type { RenderFrame } from './Renderer.ts';

function stubCtx(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() };
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    drawImage: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('coverDrawRect', () => {
  it('fills a wide world from a square image with vertical crop', () => {
    const r = coverDrawRect(1000, 1000, 4096, 2304);
    expect(r.dw).toBeCloseTo(4096);
    expect(r.dh).toBeCloseTo(4096);
    expect(r.dx).toBeCloseTo(0);
    expect(r.dy).toBeCloseTo((2304 - 4096) / 2);
  });

  it('fills from a wider image with horizontal crop', () => {
    const r = coverDrawRect(4096, 1000, 4096, 2304);
    expect(r.dw).toBeCloseTo(4096 * 2.304);
    expect(r.dh).toBeCloseTo(2304);
    expect(r.dy).toBeCloseTo(0);
    expect(r.dx).toBeCloseTo((4096 - 4096 * 2.304) / 2);
  });

  it('is exact for matching aspect ratios', () => {
    expect(coverDrawRect(1920, 1080, 1920, 1080)).toEqual({ dx: 0, dy: 0, dw: 1920, dh: 1080 });
  });
});

describe('drawWorld', () => {
  it('renders the procedural fallback without throwing (no art in node)', () => {
    const frame = {
      camera: { x: 2048, y: 1152, zoom: 2, viewportWidth: 1920, viewportHeight: 1080 },
      worldWidth: 4096,
      worldHeight: 2304,
      background: '/assets/backgrounds/portrait.png',
    } as RenderFrame;
    const ctx = stubCtx();
    expect(() => drawWorld(ctx, frame)).not.toThrow();
    // No Image in node: falls back without attempting drawImage.
    expect(ctx.drawImage).not.toHaveBeenCalled();
  });
});
