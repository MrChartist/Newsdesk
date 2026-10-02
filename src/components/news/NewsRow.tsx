import { cn } from '@/lib/utils';
import { useHoverPrefetch } from '@/hooks/useArticleSummary';
import { type StoryProps, BookmarkButton, useStoryRead } from './NewsCard';
import FeedSourceBadge from './FeedSourceBadge';
import TimeAgo from './TimeAgo';
import Highlight from './Highlight';
import Coverage from './Coverage';
import { getCategoryMeta } from '@/data/categories';

/** Dense single-row layout for scanning many headlines. */
export default function NewsRow({ story, query, selected, domId, onOpen }: StoryProps) {
  const item = story.lead;
  const { read, open } = useStoryRead(story);
  const go = () => open(onOpen);
  const prefetch = useHoverPrefetch(story);

  return (
    <article
      id={domId}
      role="link"
      tabIndex={0}
      {...prefetch}
      onClick={go}
      onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
      className={cn(
        'group flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--mat-fill-1)]',
        selected && 'bg-[var(--mat-fill-2)] ring-2 ring-inset ring-primary/60',
      )}
    >
      <TimeAgo date={new Date(story.time).toISOString()} className="hidden w-14 shrink-0 text-right sm:block" />
      <div className="min-w-0 flex-1">
        <h3 className={cn('line-clamp-2 font-display text-[1.0625rem] font-bold leading-snug tracking-tight', read ? 'text-foreground/55' : 'text-foreground')}>
          <Highlight text={item.title} query={query} />
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <FeedSourceBadge source={item.source} />
          <TimeAgo date={new Date(story.time).toISOString()} className="sm:hidden" />
          <span aria-hidden className="hidden md:inline">·</span>
          <span className="hidden md:inline">{getCategoryMeta(item.category).label}</span>
          <Coverage story={story} />
        </div>
      </div>
      {item.image && (
        <img src={item.image} alt="" loading="lazy" className="hidden h-16 w-28 shrink-0 rounded-[10px] object-cover sm:block"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      )}
      <BookmarkButton item={item} className="!shadow-none shrink-0" />
    </article>
  );
}
