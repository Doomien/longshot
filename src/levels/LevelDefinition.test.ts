import { describe, expect, it } from 'vitest';
import {
  BACK_FORTY,
  cloneLevel,
  levelFromJson,
  levelToJson,
} from './LevelDefinition.ts';

describe('level JSON round-trip (data-driven scene groundwork)', () => {
  it('serializes and re-validates the default level', () => {
    const json = levelToJson(BACK_FORTY);
    const back = levelFromJson(json);
    expect(back).toEqual(BACK_FORTY);
  });

  it('cloneLevel isolates dev-tool edits from the shared default', () => {
    const clone = cloneLevel(BACK_FORTY);
    clone.spawnPoints[0]!.x = -999;
    clone.background = null;
    expect(BACK_FORTY.spawnPoints[0]!.x).not.toBe(-999);
    expect(BACK_FORTY.background).not.toBeNull();
  });

  it('rejects malformed level JSON with messages', () => {
    expect(() => levelFromJson('nope')).toThrow();
    expect(() => levelFromJson('{}')).toThrow(/string id/);
    expect(() => levelFromJson(JSON.stringify({ ...BACK_FORTY, spawnPoints: [] }))).toThrow(
      /non-empty spawnPoints/,
    );
    expect(() =>
      levelFromJson(JSON.stringify({ ...BACK_FORTY, worldWidth: -5 })),
    ).toThrow(/positive worldWidth/);
  });
});
