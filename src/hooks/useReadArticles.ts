import { useSyncExternalStore, useCallback } from 'react';
import { toast } from '@/lib/toast';

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

export function markManyRead(links: string[]) {
  const fresh = links.filter((l) => !lookup.has(l));
  if (!fresh.length) return;
  store = [...fresh, ...store].slice(0, MAX);
  lookup = new Set(store);
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* ignore */ }
  emit();
}

export function unmarkMany(links: string[]) {
  const drop = new Set(links);
  store = store.filter((l) => !drop.has(l));
  lookup = new Set(store);
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* ignore */ }
  emit();
}

/** Mark many as read and offer Undo. Returns how many actually changed. */
export function markManyReadWithUndo(links: string[]) {
  const fresh = links.filter((l) => !lookup.has(l));
  if (!fresh.length) return 0;
  markManyRead(fresh);
  toast(`Marked ${fresh.length.toLocaleString('en-IN')} ${fresh.length === 1 ? 'story' : 'stories'} as read`, { label: 'Undo', run: () => unmarkMany(fresh) });
  return fresh.length;
}

export function useReadArticles() {
  const snapshot = useSyncExternalStore(subscribe, () => store, () => EMPTY);
  const isRead = useCallback((link: string) => lookup.has(link), [snapshot]); // eslint-disable-line react-hooks/exhaustive-deps
  return { isRead, markRead, markManyRead, markManyReadWithUndo, count: snapshot.length };
}
