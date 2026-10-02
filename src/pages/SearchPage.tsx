import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useStories } from '@/hooks/useStories';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NewsStream from '@/components/news/NewsStream';
import TrendingStrip from '@/components/news/TrendingStrip';
import { PageHeader } from '@/components/ui/Section';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const ref = useRef<HTMLInputElement>(null);
  const { stories, isLoading, isError, refetch } = useStories();
  useDocumentTitle(q ? `“${q}”` : 'Search');
  const { recent, add, remove, clear } = useRecentSearches();
  useEffect(() => { ref.current?.focus(); }, []);
  // remember a search once the user has paused on it
  useEffect(() => { const t = setTimeout(() => add(q), 1200); return () => clearTimeout(t); }, [q, add]);

  const set = (v: string) => setParams(v ? { q: v } : {}, { replace: true });
  const hasQuery = q.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Search" title="Find a story" subtitle="Headlines, summaries and company mentions across every source." />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref} type="search" value={q} onChange={(e) => set(e.target.value)} aria-label="Search stories"
          placeholder="Try “RBI”, “Reliance”, “crude oil”…"
          className="field !rounded-[var(--r-md)] !py-3.5 !pl-12 !pr-11 !text-[1.0625rem] [&::-webkit-search-cancel-button]:hidden"
        />
        {q && <button onClick={() => set('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:text-foreground" aria-label="Clear"><X className="h-4 w-4" /></button>}
      </div>

      {hasQuery ? (
        <NewsStream key="results" stories={stories} isLoading={isLoading} isError={isError} onRetry={() => refetch()}
          title="Results" searchQuery={q} live={false} digestTitle={`Stories on “${q}”`}
          emptyTitle={`Nothing found for “${q}”`} emptyHint="Check the spelling or try a broader term." />
      ) : (
        <div className="space-y-6">
          {recent.length > 0 && (
            <section aria-label="Recent searches">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="eyebrow flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Recent</h2>
                <button onClick={clear} className="text-xs font-semibold text-primary">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <span key={r} className="chip !py-1.5 pl-3 pr-1 !text-[0.8125rem]">
                    <button onClick={() => set(r)}>{r}</button>
                    <button onClick={() => remove(r)} aria-label={`Remove ${r}`} className="rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </section>
          )}
          <TrendingStrip stories={stories} />
        </div>
      )}
    </div>
  );
}
