import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blurbOf } from '@/lib/blurb';
import type { NewsItem } from '@/types/news';
import type { Story } from '@/lib/stories';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadArticles } from '@/hooks/useReadArticles';
import { useHoverPrefetch } from '@/hooks/useArticleSummary';
import FeedSourceBadge from './FeedSourceBadge';
import CategoryBadge from './CategoryBadge';
import TimeAgo from './TimeAgo';
import Highlight from './Highlight';
import Coverage from './Coverage';
import CompanyMentionTag from '../company/CompanyMentionTag';

export interface StoryProps {
  story: Story;
  query?: string;
  selected?: boolean;
  domId?: string;
  onOpen: (story: Story) => void;
}

export function BookmarkButton({ item, className }: { item: NewsItem; className?: string }) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(item.link);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      title={saved ? 'Remove from saved' : 'Save for later'}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      aria-pressed={saved}
      className={cn(
        'glass flex h-9 w-9 items-center justify-center rounded-full transition-all',
        saved ? 'text-ios-orange opacity-100' : 'text-foreground/80 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100',
        className,
      )}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  );
}

export function useStoryRead(story: Story) {
  const { isRead, markRead } = useReadArticles();
  return { read: isRead(story.lead.link), open: (cb: (s: Story) => void) => { markRead(story.lead.link); cb(story); } };
}

/** Image-led card. */
export default function NewsCard({ story, query, selected, domId, onOpen }: StoryProps) {
  const item = story.lead;
  const isNew = Date.now() - story.time < 5 * 60 * 1000;
  const { read, open } = useStoryRead(story);
  const go = () => open(onOpen);
  const prefetch = useHoverPrefetch(story);
  const blurb = blurbOf(item);

  return (
    <article
      id={domId}
      role="link"
      tabIndex={0}
      {...prefetch}
      onClick={go}
      onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
      className={cn(
        'card card-interactive group relative flex cursor-pointer flex-col overflow-hidden',
        isNew && 'row-new', selected && 'ring-2 ring-primary/60',
      )}
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
          <BookmarkButton item={item} className="absolute right-3 top-3" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <FeedSourceBadge source={item.source} />
          <span className="text-muted-foreground/50">·</span>
          <TimeAgo date={new Date(story.time).toISOString()} />
          {!item.image && <BookmarkButton item={item} className="ml-auto !h-8 !w-8 !shadow-none" />}
        </div>

        <h3 className={cn('line-clamp-3 font-display text-[1.0625rem] font-bold leading-snug tracking-tight', read ? 'text-foreground/55' : 'text-foreground')}>
          <Highlight text={item.title} query={query} />
        </h3>

        {blurb && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            <Highlight text={blurb} query={query} />
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <CategoryBadge category={item.category} />
          {story.companies.slice(0, 3).map((symbol) => <CompanyMentionTag key={symbol} symbol={symbol} />)}
          <Coverage story={story} className="ml-auto" />
        </div>
      </div>
    </article>
  );
}
