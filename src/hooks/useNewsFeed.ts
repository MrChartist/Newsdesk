import { useQuery } from '@tanstack/react-query';
import type { NewsFeedResponse, NewsItem } from '@/types/news';

async function fetchNews(): Promise<NewsFeedResponse> {
  const res = await fetch('/api/feeds');
  if (!res.ok) throw new Error('Failed to fetch news');
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

export function useFilteredNews(
  items: NewsItem[] | undefined,
  filters: {
    search?: string;
    category?: string;
    source?: string;
    company?: string;
  }
) {
  if (!items) return [];

  return items.filter(item => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.category && item.category !== filters.category) return false;
    if (filters.source && item.source.id !== filters.source) return false;
    if (filters.company && !item.companies.includes(filters.company)) return false;
    return true;
  });
}
