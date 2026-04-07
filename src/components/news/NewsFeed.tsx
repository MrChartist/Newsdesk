import React from 'react';
import type { NewsItem } from '@/types/news';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';

interface Props {
  items: NewsItem[];
  isLoading: boolean;
  onSelectArticle?: (item: NewsItem) => void;
}

export default function NewsFeed({ items, isLoading, onSelectArticle }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-muted-foreground font-medium">No articles found matching filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} onSelect={onSelectArticle} />
      ))}
    </div>
  );
}
