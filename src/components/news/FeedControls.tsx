import { forwardRef } from 'react';
import { Search, X, Bookmark } from 'lucide-react';
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

const FeedControls = forwardRef<HTMLInputElement, Props>(function FeedControls(
  { search, onSearchChange, sources, source, onSourceChange, sort, onSortChange, savedOnly, onToggleSaved, savedCount },
  ref,
) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter headlines, companies, topics"
          aria-label="Filter headlines"
          className="field !pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear filter"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select value={source} onChange={(e) => onSourceChange(e.target.value)} className="field !w-auto min-w-0 flex-1 sm:flex-none" aria-label="Filter by source">
          <option value="">All sources</option>
          {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select value={sort} onChange={(e) => onSortChange(e.target.value as SortMode)} className="field !w-auto min-w-0 flex-1 sm:flex-none" aria-label="Sort articles">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="source">By source</option>
        </select>

        <button
          onClick={onToggleSaved}
          aria-pressed={savedOnly}
          className={cn('btn shrink-0', savedOnly ? 'btn-primary' : 'btn-plain')}
        >
          <Bookmark className={cn('h-4 w-4', savedOnly && 'fill-current')} />
          <span className="hidden sm:inline">Saved</span>
          {savedCount > 0 && <span className="tnum text-xs opacity-80">{savedCount}</span>}
        </button>
      </div>
    </div>
  );
});

export default FeedControls;
