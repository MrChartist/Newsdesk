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

const GRID = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';

export function EmptyState({
  icon: Icon, title, hint, tone = 'neutral', action,
}: { icon: typeof Inbox; title: string; hint?: string; tone?: 'neutral' | 'error'; action?: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 py-16 text-center">
      <div
        className="mb-2 flex h-14 w-14 items-center justify-center rounded-[18px]"
        style={{
          background: tone === 'error' ? 'hsl(var(--ios-red) / 0.14)' : 'var(--mat-fill-2)',
          color: tone === 'error' ? 'hsl(var(--ios-red))' : 'hsl(var(--muted-foreground))',
        }}
      >
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-display text-lg font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default function NewsFeed({
  items, isLoading = false, onSelectArticle, isError, onRetry,
  emptyTitle = 'No articles found',
  emptyHint = 'Try a different category, source, or search term.',
}: Props) {
  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 9 }).map((_, i) => <NewsCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        tone="error"
        title="Couldn’t load the feed"
        hint="The Newsdesk backend isn’t reachable right now. Make sure the server is running on port 3001."
        action={onRetry && (
          <button onClick={onRetry} className="btn btn-primary"><RefreshCw className="h-4 w-4" /> Try again</button>
        )}
      />
    );
  }

  if (items.length === 0) return <EmptyState icon={Inbox} title={emptyTitle} hint={emptyHint} />;

  return (
    <div className={GRID}>
      {items.map((item) => <NewsCard key={item.id} item={item} onSelect={onSelectArticle} />)}
    </div>
  );
}
