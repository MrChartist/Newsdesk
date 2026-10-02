import { useState, useCallback } from 'react';

const KEY = 'newsdesk:recent-searches';
const MAX = 8;

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(load);
  const persist = (next: string[]) => {
    setRecent(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const add = useCallback((q: string) => {
    const t = q.trim();
    if (t.length < 2) return;
    persist([t, ...load().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
  }, []);
  const remove = useCallback((q: string) => persist(load().filter((x) => x !== q)), []);
  const clear = useCallback(() => persist([]), []);
  return { recent, add, remove, clear };
}
