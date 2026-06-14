import { forwardRef } from 'react';
import { Search, X, Bookmark, ArrowDownWideNarrow } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedSource } from '@/types/news';

export type SortMode = 'newest' | 'oldest' | 'source';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  sources: FeedSource[];
  source: string;
  onSourceChange: (v: string) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
  savedOnly: boolean;
  onToggleSaved: () => void;
  savedCount: number;
}

const selectClass =
  'appearance-none rounded-xl bg-surface ring-1 ring-white/5 text-sm pl-3 pr-8 py-2.5 ' +
  'text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer';

const FeedControls = forwardRef<HTMLInputElement, Props>(function FeedControls(
  { search, onSearchChange, sources, source, onSourceChange, sort, onSortChange, savedOnly, onToggleSaved, savedCount },
  ref,
) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search headlines, companies, topics…"
          className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-surface ring-1 ring-white/5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
        {search ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono-data text-muted-foreground">
            /
          </kbd>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Source filter */}
        <div className="relative">
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            className={selectClass}
            aria-label="Filter by source"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ArrowDownWideNarrow className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className={selectClass}
            aria-label="Sort articles"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="source">By source</option>
          </select>
          <ArrowDownWideNarrow className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Saved toggle */}
        <button
          onClick={onToggleSaved}
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all whitespace-nowrap',
            savedOnly
              ? 'bg-primary/20 ring-primary/40 text-primary'
              : 'bg-surface ring-white/5 text-muted-foreground hover:text-foreground',
          )}
        >
          <Bookmark className={cn('w-4 h-4', savedOnly && 'fill-current')} />
          <span className="hidden sm:inline">Saved</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono-data">{savedCount}</span>
          )}
        </button>
      </div>
    </div>
  );
});

export default FeedControls;
