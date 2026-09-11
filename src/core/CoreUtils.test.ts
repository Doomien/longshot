import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVE, loadSave, storeSave } from './Persistence.ts';
import { buildTelemetry } from './Telemetry.ts';

describe('Persistence', () => {
  it('returns defaults with no storage available (node env)', () => {
    expect(loadSave()).toEqual(DEFAULT_SAVE);
  });

  it('never throws on save without storage', () => {
    expect(() => storeSave({ bestScore: 100, bestAccuracy: 0.8, roundsPlayed: 3 })).not.toThrow();
  });
});

describe('Telemetry', () => {
  it('aggregates shots, accuracy, stability, and zoom usage', () => {
    const t = buildTelemetry(
      [
        { stability: 0.9, zoom: 4 },
        { stability: 0.7, zoom: 4 },
        { stability: 0.8, zoom: 2 },
      ],
      2,
    );
    expect(t.shots).toBe(3);
    expect(t.hits).toBe(2);
    expect(t.accuracy).toBeCloseTo(2 / 3);
    expect(t.averageStabilityAtFire).toBeCloseTo(0.8);
    expect(t.zoomUsage['4x']).toBeCloseTo(2 / 3);
    expect(t.zoomUsage['2x']).toBeCloseTo(1 / 3);
  });

  it('handles an empty round without NaN', () => {
    const t = buildTelemetry([], 0);
    expect(t.accuracy).toBe(0);
    expect(t.averageStabilityAtFire).toBe(0);
    expect(t.zoomUsage).toEqual({});
  });
});
