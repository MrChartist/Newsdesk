import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ArticleSummary, NewsItem } from '@/types/news';
import type { Story } from '@/lib/stories';

/** Every distinct feed blurb in the story (used when the publisher blocks reading). */
function blurbs(story: Story): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of story.items) {
    const d = i.description?.trim();
    if (d && d !== i.title.trim() && !seen.has(d)) { seen.add(d); out.push(d); }
  }
  return out.join(' ').slice(0, 900);
}

async function fetchSummary(item: NewsItem, desc: string): Promise<ArticleSummary> {
  const qs = new URLSearchParams({ url: item.link, title: item.title, desc });
  const res = await fetch(`/api/summary?${qs}`);
  if (!res.ok) throw new Error(`summary ${res.status}`);
  return res.json();
}

const key = (link: string) => ['summary', link] as const;

export function useArticleSummary(story: Story | null, item: NewsItem | null) {
  return useQuery({
    queryKey: key(item?.link ?? ''),
    queryFn: () => fetchSummary(item!, story ? blurbs(story) : item!.description),
    enabled: !!item,
    staleTime: 30 * 60_000,
    retry: false,
  });
}

/** Start loading a story's summary shortly after the pointer rests on it, so opening feels instant. */
export function useHoverPrefetch(story: Story) {
  const qc = useQueryClient();
  const timer = useRef<number>();
  const start = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      qc.prefetchQuery({
        queryKey: key(story.lead.link),
        queryFn: () => fetchSummary(story.lead, blurbs(story)),
        staleTime: 30 * 60_000,
      });
    }, 250);
  }, [qc, story]);
  const cancel = useCallback(() => window.clearTimeout(timer.current), []);
  return { onPointerEnter: start, onFocus: start, onPointerLeave: cancel, onBlur: cancel };
}
