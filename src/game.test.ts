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

  get aimScreen(): Vec2 {
    return { ...this.aim };
  }

  /** Point the mouse so the proportional map lands on a world point. */
  aimAtWorld(p: Vec2): void {
    this.aim = {
      x: (p.x / DEFAULT_CONFIG.world.width) * LOGICAL_WIDTH,
      y: (p.y / DEFAULT_CONFIG.world.height) * LOGICAL_HEIGHT,
    };
  }

  pressFire(): void {
    this.fires += 1;
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
});
