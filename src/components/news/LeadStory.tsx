import { cn } from '@/lib/utils';
import type { Story } from '@/lib/stories';
import { coverage } from '@/lib/stories';
import { useReadArticles } from '@/hooks/useReadArticles';
import FeedSourceBadge from './FeedSourceBadge';
import CategoryBadge from './CategoryBadge';
import TimeAgo from './TimeAgo';
import Coverage from './Coverage';
import { BookmarkButton } from './NewsCard';

interface Props {
  lead: Story;
  others: Story[];
  onSelect: (story: Story) => void;
}

/** "Top stories" — one big lead with image and a stack of runner-up headlines. */
export default function LeadStory({ lead, others, onSelect }: Props) {
  const { isRead, markRead } = useReadArticles();
  const open = (s: Story) => { markRead(s.lead.link); onSelect(s); };
  const item = lead.lead;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <article
        role="link" tabIndex={0}
        onClick={() => open(lead)} onKeyDown={(e) => e.key === 'Enter' && open(lead)}
        className="card-interactive group relative isolate flex min-h-[300px] cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--r-xl)] shadow-2 lg:col-span-3 lg:min-h-[380px]"
        style={{ background: 'linear-gradient(145deg, #3a2a22 0%, #1b1513 100%)' }}
      >
        {item.image && (
          <img src={item.image} alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
        <BookmarkButton item={item} className="absolute right-4 top-4" />

        <div className="space-y-3 p-6 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} className="!bg-white/20 !text-white backdrop-blur-md" />
            <FeedSourceBadge source={item.source} className="!text-white/90" />
            <TimeAgo date={new Date(lead.time).toISOString()} className="!text-white/70" />
            {coverage(lead) >= 3 && <Coverage story={lead} light />}
          </div>
          <h2 className="line-clamp-4 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-tight sm:text-[1.875rem]">{item.title}</h2>
          {item.description && item.description.trim() !== item.title.trim() && (
            <p className="line-clamp-2 max-w-2xl text-sm text-white/75 sm:text-[0.9375rem]">{item.description}</p>
          )}
        </div>
      </article>

      <div className="card flex flex-col p-2 lg:col-span-2">
        <h3 className="eyebrow px-3.5 pb-1 pt-3">Also making news</h3>
        <ul className="flex flex-1 flex-col">
          {others.map((s, i) => {
            const read = isRead(s.lead.link);
            return (
              <li key={s.id} className={cn('flex-1', i > 0 && 'border-t border-[var(--mat-separator)]')}>
                <button onClick={() => open(s)} className="flex h-full w-full flex-col justify-center gap-1 rounded-[var(--r-sm)] px-3.5 py-3 text-left transition-colors hover:bg-[var(--mat-fill-1)]">
                  <span className="flex items-center gap-2">
                    <FeedSourceBadge source={s.lead.source} />
                    <TimeAgo date={new Date(s.time).toISOString()} />
                    <Coverage story={s} className="ml-auto" />
                  </span>
                  <span className={cn('line-clamp-2 font-display text-[0.9375rem] font-bold leading-snug', read && 'text-foreground/55')}>{s.lead.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
