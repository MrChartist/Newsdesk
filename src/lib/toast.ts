import { useSyncExternalStore } from 'react';

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Show a short confirmation, optionally with an Undo-style action. */
export function toast(message: string, action?: Toast['action'], ms = 4200) {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, message, action }];
  emit();
  window.setTimeout(() => dismissToast(id), action ? ms + 1500 : ms);
}

export function useToasts() {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => toasts,
    () => [] as Toast[],
  );
}
