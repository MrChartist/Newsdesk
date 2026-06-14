import { useSyncExternalStore, useCallback } from 'react';
import type { NewsItem } from '@/types/news';

// Saved articles are persisted in localStorage keyed by article link. We store
// the full NewsItem so the "Saved" view keeps working even after the source
// article is pruned from the backend archive. A module-level store + listener
// set keeps every NewsCard / modal / Home view in sync via useSyncExternalStore.

const STORAGE_KEY = 'newsdesk:bookmarks';

type BookmarkMap = Record<string, NewsItem>;

function load(): BookmarkMap {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookmarkMap) : {};
  } catch {
    return {};
  }
}

const EMPTY: BookmarkMap = {};
let store: BookmarkMap = load();
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
  // Sync across tabs/windows
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

function getSnapshot(): BookmarkMap {
  return store;
}

export function toggleBookmark(item: NewsItem) {
  const next = { ...store };
  if (next[item.link]) {
    delete next[item.link];
  } else {
    next[item.link] = item;
  }
  store = next;
  persist();
  emit();
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const isBookmarked = useCallback(
    (link: string) => Boolean(bookmarks[link]),
    [bookmarks],
  );

  return {
    bookmarks,
    items: Object.values(bookmarks),
    count: Object.keys(bookmarks).length,
    isBookmarked,
    toggle: toggleBookmark,
  };
}
