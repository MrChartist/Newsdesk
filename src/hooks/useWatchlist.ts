import { useSyncExternalStore, useCallback } from 'react';

// A stock watchlist persisted in localStorage as an ordered list of symbols
// (most-recently-added first). Mirrors useBookmarks: a module-level store +
// listener set keeps every star toggle, the navbar badge and the watchlist
// page in sync, and a `storage` listener syncs across tabs.

const STORAGE_KEY = 'newsdesk:watchlist';

function load(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

const EMPTY: string[] = [];
let store: string[] = load();
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode — keep in-memory only */
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      store = load();
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): string[] {
  return store;
}

export function toggleWatch(symbol: string) {
  store = store.includes(symbol)
    ? store.filter((s) => s !== symbol)
    : [symbol, ...store];
  persist();
  emit();
}

export function useWatchlist() {
  const symbols = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const isWatched = useCallback((symbol: string) => symbols.includes(symbol), [symbols]);

  return {
    symbols,
    count: symbols.length,
    isWatched,
    toggle: toggleWatch,
  };
}
