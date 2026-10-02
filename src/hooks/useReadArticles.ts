import { useSyncExternalStore, useCallback } from 'react';

// Tracks which articles the reader has opened so the feed can dim them and
// show an unread dot on the rest. Capped so localStorage never grows unbounded.

const KEY = 'newsdesk:read';
const MAX = 1500;

function load(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

let store: string[] = typeof localStorage === 'undefined' ? [] : load();
let lookup = new Set(store);
const listeners = new Set<() => void>();
const EMPTY: string[] = [];

function emit() { listeners.forEach((fn) => fn()); }

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { store = load(); lookup = new Set(store); emit(); }
  };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

export function markRead(link: string) {
  if (lookup.has(link)) return;
  store = [link, ...store].slice(0, MAX);
  lookup = new Set(store);
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* ignore */ }
  emit();
}

export function useReadArticles() {
  const snapshot = useSyncExternalStore(subscribe, () => store, () => EMPTY);
  const isRead = useCallback((link: string) => lookup.has(link), [snapshot]); // eslint-disable-line react-hooks/exhaustive-deps
  return { isRead, markRead, count: snapshot.length };
}
