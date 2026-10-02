import { useSyncExternalStore, useCallback, useEffect } from 'react';

// Theme preference: 'system' follows the OS (macOS / iOS "Auto"), otherwise
// explicit. Persisted in localStorage; index.html applies it before first paint.
export type ThemePref = 'system' | 'light' | 'dark';

const KEY = 'newsdesk-theme';
const listeners = new Set<() => void>();

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'system' ? v : 'dark';
  } catch {
    return 'dark';
  }
}

let pref: ThemePref = typeof localStorage === 'undefined' ? 'dark' : read();

function effective(p: ThemePref): 'light' | 'dark' {
  if (p === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return p;
}

function apply() {
  const eff = effective(pref);
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(eff);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', eff === 'light' ? '#F9F7F4' : '#0F0E0D');
}

export function setTheme(next: ThemePref) {
  pref = next;
  try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
  apply();
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => pref, () => 'dark' as ThemePref);

  // Track OS changes while on "system"
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => { if (pref === 'system') apply(); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const cycle = useCallback(() => {
    setTheme(pref === 'dark' ? 'light' : pref === 'light' ? 'system' : 'dark');
  }, []);

  return { theme, setTheme, cycle };
}
