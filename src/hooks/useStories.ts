import { useMemo } from 'react';
import { useNewsFeed } from './useNewsFeed';
import { useMutedSources } from './useMutedSources';
import { buildStories, type Story } from '@/lib/stories';

/** The news archive, minus muted sources, clustered into stories. Shared across the app. */
export function useStories() {
  const q = useNewsFeed();
  const { muted } = useMutedSources();
  const stories = useMemo<Story[]>(() => {
    if (!q.data) return [];
    const items = muted.length ? q.data.items.filter((i) => !muted.includes(i.source.id)) : q.data.items;
    return buildStories(items);
  }, [q.data, muted]);
  return { ...q, stories };
}
