import '../style.css';
import { Game } from './game.ts';

// Entry point: DOM wiring only. All sim/render construction lives in Game so
// a future engine entry (e.g. Phaser scene bootstrap) can reuse it.

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('#game canvas element not found');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Canvas 2D context unavailable');
}

const game = new Game(canvas, ctx);
game.start();
