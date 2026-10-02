import { useState, useCallback } from 'react';

/** useState that survives reloads via localStorage (never throws in private mode). */
export function usePersistentState<T extends string | number | boolean>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = useCallback((next: T) => {
    setValue(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  }, [key]);
  return [value, set] as const;
}
