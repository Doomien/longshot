// Session telemetry for playtesting (proposal section 46): logged to console
// on round complete. Pure builder over the per-shot log — testable, and a
// future backend uploader would consume this same shape.

export interface ShotSample {
  stability: number;
  zoom: number;
}

export interface SessionTelemetry {
  shots: number;
  hits: number;
  accuracy: number;
  averageStabilityAtFire: number;
  zoomUsage: Record<string, number>;
}

export function buildTelemetry(samples: readonly ShotSample[], hits: number): SessionTelemetry {
  const shots = samples.length;
  const stabilitySum = samples.reduce((sum, s) => sum + s.stability, 0);
  const zoomCounts = new Map<number, number>();
  for (const s of samples) zoomCounts.set(s.zoom, (zoomCounts.get(s.zoom) ?? 0) + 1);
  const zoomUsage: Record<string, number> = {};
  for (const [zoom, count] of zoomCounts) {
    zoomUsage[`${zoom}x`] = shots > 0 ? count / shots : 0;
  }
  return {
    shots,
    hits,
    accuracy: shots > 0 ? hits / shots : 0,
    averageStabilityAtFire: shots > 0 ? stabilitySum / shots : 0,
    zoomUsage,
  };
}
