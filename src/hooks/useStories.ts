import { useMemo } from 'react';
import { useNewsFeed } from './useNewsFeed';
import { buildStories, type Story } from '@/lib/stories';

/** The news archive, clustered into stories. Shared (memoised per fetch) across the app. */
export function useStories() {
  const q = useNewsFeed();
  const stories = useMemo<Story[]>(() => (q.data ? buildStories(q.data.items) : []), [q.data]);
  return { ...q, stories };
}
