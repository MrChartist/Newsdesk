import { useSyncExternalStore, useCallback } from 'react';

// Interface-wide text size. Everything is sized in rem, so changing the root font size
// scales the whole app (lists, cards, reader) — the simplest, most reliable way to make it easier to read.
export type TextSize = 'default' | 'large' | 'xl';
export const TEXT_SIZES: { id: TextSize; label: string; pct: number }[] = [
  { id: 'default', label: 'Default', pct: 100 },
  { id: 'large', label: 'Large', pct: 112.5 },
  { id: 'xl', label: 'Largest', pct: 125 },
];

const KEY = 'newsdesk-text-size';
const listeners = new Set<() => void>();

function read(): TextSize {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'large' || v === 'xl' ? v : 'default';
  } catch { return 'default'; }
}

let size: TextSize = typeof localStorage === 'undefined' ? 'default' : read();

function apply() {
  const pct = TEXT_SIZES.find((s) => s.id === size)!.pct;
  document.documentElement.style.fontSize = pct === 100 ? '' : `${pct}%`;
}

export function setTextSize(next: TextSize) {
  size = next;
  try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
  apply();
  listeners.forEach((fn) => fn());
}

export function useTextSize() {
  const current = useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => size,
    () => 'default' as TextSize,
  );
  const cycle = useCallback(() => {
    const i = TEXT_SIZES.findIndex((s) => s.id === size);
    setTextSize(TEXT_SIZES[(i + 1) % TEXT_SIZES.length].id);
  }, []);
  return { size: current, setSize: setTextSize, cycle };
}
