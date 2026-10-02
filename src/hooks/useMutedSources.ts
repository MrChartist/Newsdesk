import { useSyncExternalStore, useCallback } from 'react';

// Sources the reader never wants to see (e.g. a very chatty aggregator). Stored per device.
const KEY = 'newsdesk:muted-sources';

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

let store: string[] = typeof localStorage === 'undefined' ? [] : load();
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { store = load(); emit(); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

export function setMuted(id: string, muted: boolean) {
  store = muted ? [...new Set([...store, id])] : store.filter((x) => x !== id);
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* ignore */ }
  emit();
}

export function useMutedSources() {
  const muted = useSyncExternalStore(subscribe, () => store, () => EMPTY);
  const isMuted = useCallback((id: string) => muted.includes(id), [muted]);
  return { muted, isMuted, count: muted.length, setMuted };
}
