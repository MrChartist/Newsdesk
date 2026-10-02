import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadArticles } from '@/hooks/useReadArticles';
import FeedSourceBadge from './FeedSourceBadge';
import CategoryBadge from './CategoryBadge';
import TimeAgo from './TimeAgo';
import CompanyMentionTag from '../company/CompanyMentionTag';

interface Props {
  item: NewsItem;
  onSelect?: (item: NewsItem) => void;
}

export function BookmarkButton({ item, className }: { item: NewsItem; className?: string }) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(item.link);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      title={saved ? 'Remove from saved' : 'Save article'}
      aria-label={saved ? 'Remove from saved' : 'Save article'}
      aria-pressed={saved}
      className={cn(
        'glass flex h-9 w-9 items-center justify-center rounded-full transition-all',
        saved ? 'text-ios-orange opacity-100' : 'text-foreground/80 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100',
        className,
      )}
    >
      <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
    </button>
  );
}

export default function NewsCard({ item, onSelect }: Props) {
  const isNew = Date.now() - new Date(item.pubDate).getTime() < 5 * 60 * 1000;
  const { isRead, markRead } = useReadArticles();
  const read = isRead(item.link);

  const open = () => { markRead(item.link); onSelect?.(item); };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open(); }}
      className={cn('card card-interactive group relative flex cursor-pointer flex-col overflow-hidden', isNew && 'row-new')}
    >
      {item.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--mat-fill-1)]">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
          />
          <BookmarkButton item={item} className="absolute top-3 right-3" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <FeedSourceBadge source={item.source} />
          <span className="text-muted-foreground/50">·</span>
          <TimeAgo date={item.pubDate} />
          {!item.image && <BookmarkButton item={item} className="ml-auto !h-8 !w-8 !shadow-none" />}
        </div>

        <h3
          className={cn(
            'font-display font-bold text-[1.0625rem] leading-snug tracking-tight line-clamp-3 transition-colors',
            read ? 'text-foreground/60' : 'text-foreground',
          )}
        >
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <CategoryBadge category={item.category} />
          {item.companies.slice(0, 4).map((symbol) => (
            <CompanyMentionTag key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
    </article>
  );
}
