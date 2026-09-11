// localStorage persistence for best score / accuracy / rounds played.
// All access guarded: private-mode browsers and non-DOM environments
// (tests, SSR) get defaults and silent no-op saves — never throw.

export interface SaveData {
  bestScore: number;
  bestAccuracy: number;
  roundsPlayed: number;
}

const SAVE_KEY = 'longshot-save-v1';

export const DEFAULT_SAVE: SaveData = {
  bestScore: 0,
  bestAccuracy: 0,
  roundsPlayed: 0,
};

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadSave(): SaveData {
  const store = storage();
  if (!store) return { ...DEFAULT_SAVE };
  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      bestScore: Math.max(0, Number(parsed.bestScore) || 0),
      bestAccuracy: Math.min(1, Math.max(0, Number(parsed.bestAccuracy) || 0)),
      roundsPlayed: Math.max(0, Math.floor(Number(parsed.roundsPlayed) || 0)),
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function storeSave(data: SaveData): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Quota / privacy mode — bests simply don't persist this session.
  }
}
