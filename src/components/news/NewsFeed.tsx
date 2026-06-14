import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';
import type { NewsItem } from '@/types/news';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';

interface Props {
  items: NewsItem[];
  isLoading?: boolean;
  onSelectArticle?: (item: NewsItem) => void;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyHint?: string;
}

export default function NewsFeed({
  items,
  isLoading = false,
  onSelectArticle,
  isError,
  onRetry,
  emptyTitle = 'No articles found',
  emptyHint = 'Try a different category, source, or search term.',
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full py-20 flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-foreground font-semibold">Couldn’t load the feed</p>
        <p className="text-muted-foreground text-sm max-w-sm">
          The intelligence backend isn’t reachable right now. Check that the server is running on port 3001.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center text-center gap-2">
        <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground">
          <Inbox className="w-7 h-7" />
        </div>
        <p className="text-foreground font-medium">{emptyTitle}</p>
        <p className="text-muted-foreground text-sm max-w-sm">{emptyHint}</p>
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
