import { describe, expect, it } from 'vitest';
import { Game } from './game.ts';
import type { IGameLoop } from './core/GameLoop.ts';
import type { IInputSource } from './input/InputManager.ts';
import type { IRenderer, RenderFrame } from './rendering/Renderer.ts';
import type { Vec2 } from './core/types.ts';
import { mulberry32 } from './utils/random.ts';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './core/ResizeHandler.ts';
import { DEFAULT_CONFIG } from './core/Config.ts';

// Core-loop spine test (proposal section 74): drives the full pipeline
// spawn -> aim -> fire -> hit/miss -> score -> round complete -> restart
// through the public Game seams with scripted input and seeded RNG.

class StubInput implements IInputSource {
  private aim: Vec2 = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 };
  private fires = 0;
  private deletes = 0;
  private levelKey = -1;
  private held = false;

  get aimScreen(): Vec2 {
    return { ...this.aim };
  }

  get mouseDown(): boolean {
    return this.held;
  }

  setMouseDown(v: boolean): void {
    this.held = v;
  }

  /** Point the mouse so the proportional map lands on a world point. */
  aimAtWorld(p: Vec2): void {
    this.aim = {
      x: (p.x / DEFAULT_CONFIG.world.width) * LOGICAL_WIDTH,
      y: (p.y / DEFAULT_CONFIG.world.height) * LOGICAL_HEIGHT,
    };
  }

  /** Place the raw cursor (for camera-mapped editor picking). */
  setAimDirect(p: Vec2): void {
    this.aim = { ...p };
  }

  pressFire(): void {
    this.fires += 1;
  }

  pressDelete(): void {
    this.deletes += 1;
  }

  pressLevel(index: number): void {
    this.levelKey = index;
  }

  consumeZoomIn(): boolean {
    return false;
  }
  consumeZoomOut(): boolean {
    return false;
  }
  consumeDebugToggle(): boolean {
    return false;
  }
  consumePanelToggle(): boolean {
    return false;
  }
  consumeFirePressed(): boolean {
    if (this.fires > 0) {
      this.fires -= 1;
      return true;
    }
    return false;
  }
  consumeDeletePressed(): boolean {
    if (this.deletes > 0) {
      this.deletes -= 1;
      return true;
    }
    return false;
  }
  consumeLevelHotkey(): number | null {
    if (this.levelKey < 0) return null;
    const k = this.levelKey;
    this.levelKey = -1;
    return k;
  }
  consumeRestartPressed(): boolean {
    return false;
  }
  consumeMuteToggle(): boolean {
    return false;
  }
}

class StubRenderer implements IRenderer {
  frames: RenderFrame[] = [];
  render(frame: RenderFrame): void {
    this.frames.push(frame);
  }
  get last(): RenderFrame {
    return this.frames[this.frames.length - 1]!;
  }
}

const stubLoop: IGameLoop = {
  start(): void {},
  stop(): void {},
  fps: 60,
};

function makeGame(): { game: Game; input: StubInput; renderer: StubRenderer } {
  const input = new StubInput();
  const renderer = new StubRenderer();
  const game = new Game(
    {} as HTMLCanvasElement,
    {} as CanvasRenderingContext2D,
    { input, renderer, loop: stubLoop },
  );
  return { game, input, renderer };
}

/** Run the sim until aim settles on the desired point. */
function settle(game: Game, input: StubInput, target: Vec2, steps = 150): void {
  input.aimAtWorld(target);
  for (let i = 0; i < steps; i++) game.update(1 / 60, i / 60);
}

describe('core loop spine', () => {
  it('starts at the menu and enters play on first click', () => {
    const { game, input } = makeGame();
    expect(game.state.mode).toBe('menu');
    input.pressFire();
    game.update(1 / 60, 0);
    expect(game.state.mode).toBe('playing');
    expect(game.state.shotsRemaining).toBe(10);
  });

  it('completes a full 10-shot round with hits, scoring, and bonuses', () => {
    const { game, input, renderer } = makeGame();
    game.restartRound(20260911);
    expect(game.targets.all).toHaveLength(8);

    // Hit every live target with a settled, seeded shot.
    const live = [...game.targets.all];
    live.forEach((t, i) => {
      settle(game, input, t.position);
      game.fireShot(mulberry32(1000 + i));
      expect(t.hit).toBe(true);
    });
    expect(game.state.hits).toBe(8);

    // Two deliberate misses to exhaust the round.
    settle(game, input, { x: 100, y: 100 });
    game.fireShot(mulberry32(1));
    game.fireShot(mulberry32(2));

    expect(game.state.shotsRemaining).toBe(0);
    expect(game.state.mode).toBe('roundComplete');
    expect(game.state.score).toBeGreaterThan(0);
    expect(game.state.bestStreak).toBeGreaterThanOrEqual(1);

    game.render();
    const hud = renderer.last.hud;
    expect(hud.score).toBe(game.state.score);
    expect(hud.accuracy).toBeCloseTo(0.8);
    expect(hud.roundBonus).toBe(400); // 8/10 accuracy tier

    // Restart restores a fresh playable round.
    game.restartRound(7);
    expect(game.state.mode).toBe('playing');
    expect(game.state.shotsRemaining).toBe(10);
    expect(game.state.score).toBe(0);
    expect(game.targets.remaining).toBe(8);
  });

  it('fires through the update loop from a queued click', () => {
    const { game, input } = makeGame();
    game.restartRound(5);
    const before = game.state.shotsFired;
    settle(game, input, game.targets.all[0]!.position);
    input.pressFire();
    game.update(1 / 60, 99);
    expect(game.state.shotsFired).toBe(before + 1);
  });

  it('self-heals playing-with-zero-shots into round complete', () => {
    const { game } = makeGame();
    game.restartRound(5);
    game.state.shotsRemaining = 0;
    game.update(1 / 60, 0);
    expect(game.state.mode).toBe('roundComplete');
  });

  it('scene editing drags a target and writes back its spawn point', () => {
    const { game, input } = makeGame();
    game.restartRound(5);
    const target = game.targets.all[0]!;
    // Settle the camera over the target first (grab uses camera-mapped mouse).
    settle(game, input, target.position);
    game.setEditing(true);
    // Put the cursor exactly on the target through the settled camera.
    const cam = game.camera.position;
    input.setAimDirect({
      x: LOGICAL_WIDTH / 2 + (target.position.x - cam.x) * 2,
      y: LOGICAL_HEIGHT / 2 + (target.position.y - cam.y) * 2,
    });
    const before = { ...target.position };
    input.setMouseDown(true);
    game.update(1 / 60, 99);
    input.aimAtWorld({ x: before.x + 400, y: before.y });
    // Give the camera time to pan: the cursor's world point (which the
    // target follows) converges past the start once the view catches up.
    for (let i = 0; i < 60; i++) game.update(1 / 60, 100 + i / 60);
    expect(target.position.x).toBeGreaterThan(before.x);
    // Spawn point follows the drag so restarts/exports keep it.
    const sp = JSON.parse(game.exportSceneJson()) as {
      spawnPoints: Array<{ x: number; y: number }>;
    };
    expect(
      sp.spawnPoints.some((p) => Math.abs(p.x - target.position.x) < 2),
    ).toBe(true);
    input.setMouseDown(false);
    game.update(1 / 60, 101);
    game.setEditing(false);
  });

  it('scene editing deletes under the cursor and exports live scene JSON', () => {
    const { game, input } = makeGame();
    game.restartRound(5);
    const target = game.targets.all[0]!;
    settle(game, input, target.position);
    game.setEditing(true);
    const cam = game.camera.position;
    input.setAimDirect({
      x: LOGICAL_WIDTH / 2 + (target.position.x - cam.x) * 2,
      y: LOGICAL_HEIGHT / 2 + (target.position.y - cam.y) * 2,
    });
    input.pressDelete();
    game.update(1 / 60, 200);
    expect(target.active).toBe(false);
    // Shots are swallowed while editing (no accidental fire).
    const fired = game.state.shotsFired;
    input.pressFire();
    game.update(1 / 60, 1);
    expect(game.state.shotsFired).toBe(fired);

    const json = game.exportSceneJson();
    const parsed = JSON.parse(json) as { spawnPoints: unknown[] };
    expect(parsed.spawnPoints).toHaveLength(
      game.targets.all.filter((t) => t.active).length,
    );
    game.setEditing(false);
  });

  it('spawn-at-reticle adds a target backed by a new spawn point', () => {
    const { game } = makeGame();
    game.restartRound(5);
    const before = game.targets.all.length;
    game.spawnTargetAtReticle('beerCan');
    expect(game.targets.all).toHaveLength(before + 1);
    const added = game.targets.all[before]!;
    expect(added.type).toBe('beerCan');
    expect(added.spawnIndex).toBeGreaterThanOrEqual(0);
  });

  it('switches levels directly and via hotkey with a fresh round', () => {
    const { game, input, renderer } = makeGame();
    game.restartRound(5);
    expect(game.levelName).toBe('The Back Forty');
    expect(game.switchLevel(0)).toBe(false); // already there
    expect(game.switchLevel(9)).toBe(false); // out of range
    expect(game.switchLevel(1)).toBe(true);
    expect(game.levelName).toBe('The Portrait');
    expect(game.targets.level.background).toBe('/assets/backgrounds/portrait.png');
    expect(game.targets.remaining).toBe(8);
    expect(game.state.mode).toBe('playing');
    game.render();
    expect(renderer.last.hud.levelName).toBe('The Portrait');

    input.pressLevel(0);
    game.update(1 / 60, 300);
    expect(game.levelName).toBe('The Back Forty');
    expect(game.state.shotsRemaining).toBe(10);
  });
});
