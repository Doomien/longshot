import { describe, expect, it } from 'vitest';
import { Camera } from './Camera.ts';
import { ScopeController } from './ScopeController.ts';
import { smoothingFactor } from '../utils/math.ts';

const WORLD_W = 4096;
const WORLD_H = 2304;
const VIEW_W = 1920;
const VIEW_H = 1080;

function makeCamera(x = WORLD_W / 2, y = WORLD_H / 2, zoom = 2): Camera {
  return new Camera(WORLD_W, WORLD_H, VIEW_W, VIEW_H, x, y, zoom);
}

describe('Camera coordinate conversion', () => {
  it('screen center maps to camera position', () => {
    const cam = makeCamera(1000, 800, 2);
    const world = cam.screenToWorld(VIEW_W / 2, VIEW_H / 2);
    expect(world.x).toBeCloseTo(1000);
    expect(world.y).toBeCloseTo(800);
  });

  it('round-trips world -> screen -> world', () => {
    const cam = makeCamera(2000, 1200, 4);
    const screen = cam.worldToScreen(2100, 1150);
    const back = cam.screenToWorld(screen.x, screen.y);
    expect(back.x).toBeCloseTo(2100);
    expect(back.y).toBeCloseTo(1150);
  });

  it('higher zoom shrinks the visible world area', () => {
    const near = makeCamera(WORLD_W / 2, WORLD_H / 2, 4);
    const far = makeCamera(WORLD_W / 2, WORLD_H / 2, 1);
    expect(near.visibleWorldSize().width).toBeLessThan(far.visibleWorldSize().width);
    expect(near.visibleWorldSize().width).toBeCloseTo(VIEW_W / 4);
  });

  it('clamps the view inside world bounds', () => {
    const cam = makeCamera(-5000, -5000, 2);
    const vis = cam.visibleWorldSize();
    expect(cam.position.x).toBeCloseTo(vis.width / 2);
    expect(cam.position.y).toBeCloseTo(vis.height / 2);
  });

  it('centers when the zoomed view is larger than the world', () => {
    const cam = makeCamera(0, 0, 0.1);
    expect(cam.position.x).toBeCloseTo(WORLD_W / 2);
    expect(cam.position.y).toBeCloseTo(WORLD_H / 2);
  });
});

describe('ScopeController', () => {
  it('starts at the default zoom and steps through fixed levels', () => {
    const scope = new ScopeController([1, 2, 4], 2);
    expect(scope.zoom).toBe(2);
    expect(scope.zoomIn()).toBe(true);
    expect(scope.zoom).toBe(4);
    expect(scope.zoomIn()).toBe(false);
    expect(scope.zoomOut()).toBe(true);
    expect(scope.zoom).toBe(2);
  });
});

describe('smoothingFactor', () => {
  it('is frame-rate independent: two half-steps equal one full step', () => {
    const rate = 6;
    const full = smoothingFactor(rate, 1 / 60);
    const half = smoothingFactor(rate, 1 / 120);
    const remaining = (1 - half) * (1 - half);
    expect(1 - remaining).toBeCloseTo(full, 10);
  });
});
