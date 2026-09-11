import type { TargetSpawnPoint, TargetType } from '../targets/TargetDefinitions.ts';

// Data-driven level: authored spawn points (plausible perches), not random
// placement. Coordinates match the procedural placeholder landmarks in
// WorldRenderer (barn, truck, fence row, barrels) for the vertical slice;
// final art (Phase 6) re-authors these against the illustration.

export interface LevelDefinition {
  id: string;
  name: string;
  /** Committed art under public/ (served at root); null = procedural only. */
  background: string | null;
  worldWidth: number;
  worldHeight: number;
  spawnPoints: TargetSpawnPoint[];
  startingCamera: { x: number; y: number };
}

const CAN_BOTTLE: TargetType[] = ['beerCan', 'glassBottle', 'tinCan'];
const ANY_SMALL: TargetType[] = ['beerCan', 'glassBottle', 'metalPlate', 'tinCan'];
const PLATE: TargetType[] = ['metalPlate', 'clayTarget'];

export const BACK_FORTY: LevelDefinition = {
  id: 'back-forty-01',
  name: 'The Back Forty',
  background: '/assets/backgrounds/back-forty.svg',
  worldWidth: 4096,
  worldHeight: 2304,
  startingCamera: { x: 2048, y: 1152 },
  spawnPoints: [
    // Barn area (left).
    { x: 820, y: 1330, distance: 140, allowedTypes: CAN_BOTTLE, scale: 1.2 },
    { x: 1010, y: 1420, distance: 160, allowedTypes: PLATE },
    // Fence row (mid).
    { x: 1400, y: 1520, distance: 200, allowedTypes: CAN_BOTTLE },
    { x: 1900, y: 1520, distance: 220, allowedTypes: ANY_SMALL },
    // Center marker (the slice's first can).
    { x: 2048, y: 1612, distance: 240, allowedTypes: ['beerCan'] },
    { x: 2400, y: 1520, distance: 260, allowedTypes: ANY_SMALL },
    // Truck area (right-mid).
    { x: 2700, y: 1660, distance: 280, allowedTypes: CAN_BOTTLE, scale: 0.9 },
    { x: 2900, y: 1560, distance: 300, allowedTypes: PLATE },
    // Barrels (right).
    { x: 3190, y: 1750, distance: 320, allowedTypes: CAN_BOTTLE, scale: 0.85 },
    { x: 3360, y: 1750, distance: 340, allowedTypes: ['glassBottle'] },
    // Far ridge pots (small/hard).
    { x: 1200, y: 1150, distance: 420, allowedTypes: ['clayTarget'], scale: 0.8 },
    { x: 3100, y: 1100, distance: 480, allowedTypes: ['clayTarget', 'glassBottle'], scale: 0.75 },
  ],
};
