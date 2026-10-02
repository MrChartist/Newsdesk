import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NewsFeedResponse, FeedSource } from '@/types/news';

async function fetchNews(): Promise<NewsFeedResponse> {
  const res = await fetch('/api/feeds');
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

async function fetchFeedSources(): Promise<FeedSource[]> {
  const res = await fetch('/api/feeds/sources');
  if (!res.ok) throw new Error('Failed to fetch feed sources');
  return res.json();
}

export function useNewsFeed(refetchInterval = 60000) {
  return useQuery<NewsFeedResponse>({
    queryKey: ['news-feed'],
    queryFn: fetchNews,
    refetchInterval,
    staleTime: 30000,
  });
}

export function useFeedSources() {
  return useQuery<FeedSource[]>({
    queryKey: ['feed-sources'],
    queryFn: fetchFeedSources,
    staleTime: Infinity,
  });
}

export interface CompanyInfo { symbol: string; name: string }

/** Symbol → display name directory for company mentions. */
export function useCompanies() {
  const q = useQuery<CompanyInfo[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies');
      if (!res.ok) throw new Error('Failed to fetch companies');
      return res.json();
    },
    staleTime: Infinity,
  });
  const names = useMemo(() => new Map((q.data ?? []).map((c) => [c.symbol, c.name])), [q.data]);
  return { names, nameOf: (symbol: string) => names.get(symbol) ?? symbol };
}
