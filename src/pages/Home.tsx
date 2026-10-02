import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNewsFeed, useFeedSources } from '@/hooks/useNewsFeed';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import MarketTicker from '@/components/market/MarketTicker';
import MarketPulse from '@/components/market/MarketPulse';
import TopMovers from '@/components/market/TopMovers';
import SectorHeatmap from '@/components/market/SectorHeatmap';
import NewsFeed from '@/components/news/NewsFeed';
import LeadStory from '@/components/news/LeadStory';
import FeedControls, { type SortMode } from '@/components/news/FeedControls';
import ArticleModal from '@/components/news/ArticleModal';
import MarketStatus from '@/components/layout/MarketStatus';
import { PageHeader, SectionHeader } from '@/components/ui/Section';
import { CATEGORIES } from '@/data/categories';
import { cn, formatDateIN, greeting } from '@/lib/utils';
import type { NewsItem } from '@/types/news';

// Categories shown in the curated default view
const DEFAULT_CATEGORIES = [
  'Markets', 'Stocks', 'Corporate', 'Business', 'Economy', 'Money', 'IPO', 'Tech', 'AI',
  'Geopolitics', 'MiddleEast', 'Defense', 'World',
];

const PAGE_SIZE = 24;
const DAY = 24 * 3600 * 1000;

export default function Home() {
  const { data: newsData, isLoading, isError, refetch } = useNewsFeed();
  const { data: feedSources } = useFeedSources();
  const { items: savedItems, count: savedCount } = useBookmarks();
  const [params, setParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [savedOnly, setSavedOnly] = useState(params.get('saved') === '1');
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const debouncedSearch = useDebounce(search, 200);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useDocumentTitle(savedOnly ? 'Saved' : undefined);

  // Deep links from the sidebar ("Saved") and command palette (headline search)
  useEffect(() => {
    setSavedOnly(params.get('saved') === '1');
    const q = params.get('q');
    if (q !== null) setSearch(q);
  }, [params]);

  const isFiltering = Boolean(debouncedSearch.trim() || source || savedOnly);
  const showHero = !isFiltering && !activeCategory && sort === 'newest';

  const filteredItems = useMemo(() => {
    const base = savedOnly ? savedItems : (newsData?.items ?? []);
    const q = debouncedSearch.trim().toLowerCase();

    const result = base.filter((item) => {
      if (activeCategory) {
        if (item.category !== activeCategory) return false;
      } else if (!isFiltering && !DEFAULT_CATEGORIES.includes(item.category)) {
        return false;
      }
      if (source && item.source.id !== source) return false;
      if (q) {
        const hay = `${item.title} ${item.description} ${item.companies.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sort === 'source') {
        const cmp = a.source.name.localeCompare(b.source.name);
        if (cmp !== 0) return cmp;
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      }
      const diff = new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime();
      return sort === 'oldest' ? diff : -diff;
    });
    return result;
  }, [newsData?.items, savedItems, savedOnly, activeCategory, isFiltering, source, debouncedSearch, sort]);

  // Lead + runner-ups come off the top of the curated, newest-first list
  const { lead, runnerUps, feedItems } = useMemo(() => {
    if (!showHero) return { lead: null, runnerUps: [] as NewsItem[], feedItems: filteredItems };
    const lead = filteredItems.find((i) => i.image) ?? filteredItems[0] ?? null;
    if (!lead) return { lead: null, runnerUps: [] as NewsItem[], feedItems: filteredItems };
    const runnerUps = filteredItems.filter((i) => i.id !== lead.id).slice(0, 4);
    const taken = new Set([lead.id, ...runnerUps.map((i) => i.id)]);
    return { lead, runnerUps, feedItems: filteredItems.filter((i) => !taken.has(i.id)) };
  }, [filteredItems, showHero]);

  useEffect(() => { setPage(1); }, [activeCategory, source, sort, savedOnly, debouncedSearch]);

  const visibleItems = useMemo(() => feedItems.slice(0, page * PAGE_SIZE), [feedItems, page]);
  const hasMore = visibleItems.length < feedItems.length;

  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '600px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  const toggleSaved = () => {
    const next = new URLSearchParams(params);
    if (savedOnly) next.delete('saved'); else next.set('saved', '1');
    setParams(next, { replace: true });
    setActiveCategory(null);
  };

  const pickCategory = (id: string | null) => {
    setActiveCategory(id);
    if (id && savedOnly) {
      const next = new URLSearchParams(params);
      next.delete('saved');
      setParams(next, { replace: true });
    }
  };

  const clearSearch = (v: string) => {
    setSearch(v);
    if (!v && params.has('q')) {
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    }
  };

  const tabs = [{ id: null as string | null, label: 'All' }, ...CATEGORIES.filter((c) => DEFAULT_CATEGORIES.includes(c.id))];

  const last24h = useMemo(
    () => (newsData?.items ?? []).filter((i) => Date.now() - new Date(i.pubDate).getTime() < DAY).length,
    [newsData?.items],
  );

  const heading = savedOnly
    ? 'Saved articles'
    : activeCategory
      ? CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory
      : debouncedSearch.trim()
        ? `Results for “${debouncedSearch.trim()}”`
        : 'Latest';

  return (
    <div className="space-y-8">
      {!isFiltering && !activeCategory && (
        <>
          <PageHeader
            eyebrow={formatDateIN()}
            title={greeting()}
            subtitle={
              newsData
                ? <><span className="tnum font-semibold text-foreground">{last24h.toLocaleString('en-IN')}</span> stories in the last 24 hours from {feedSources?.length ?? '30+'} sources.</>
                : 'Loading the latest from the market desk…'
            }
            actions={<MarketStatus className="md:hidden" />}
          />

          <MarketTicker />

          {lead && (
            <section aria-label="Top stories">
              <SectionHeader title="Top stories" />
              <LeadStory lead={lead} others={runnerUps} onSelect={setSelectedArticle} />
            </section>
          )}

          <section aria-label="Market overview" className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <MarketPulse />
              <TopMovers className="lg:col-span-2" />
            </div>
            <SectorHeatmap />
          </section>
        </>
      )}

      <section aria-label="News feed" className="space-y-4">
        <SectionHeader title={heading} count={filteredItems.length} />

        <div className="-mx-4 overflow-x-auto px-4 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
          <div className="segmented" role="tablist" aria-label="Topics">
            {tabs.map((tab) => {
              const active = !savedOnly && activeCategory === tab.id;
              const meta = tab.id ? CATEGORIES.find((c) => c.id === tab.id) : null;
              const Icon = meta?.icon;
              return (
                <button
                  key={tab.id ?? 'all'}
                  role="tab"
                  aria-selected={active}
                  onClick={() => pickCategory(tab.id)}
                  className="segmented-item"
                >
                  {active && (
                    <motion.span
                      layoutId="topic-pill"
                      className="absolute inset-0 rounded-full bg-card shadow-1"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  {Icon && <Icon className="relative h-3.5 w-3.5" style={active ? { color: meta?.color } : undefined} />}
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <FeedControls
          search={search}
          onSearchChange={clearSearch}
          sources={feedSources ?? []}
          source={source}
          onSourceChange={setSource}
          sort={sort}
          onSortChange={setSort}
          savedOnly={savedOnly}
          onToggleSaved={toggleSaved}
          savedCount={savedCount}
        />

        <NewsFeed
          items={visibleItems}
          isLoading={isLoading && !savedOnly}
          isError={isError && !savedOnly}
          onRetry={() => refetch()}
          onSelectArticle={setSelectedArticle}
          emptyTitle={savedOnly ? 'No saved articles yet' : 'No articles found'}
          emptyHint={savedOnly ? 'Tap the bookmark on any story to keep it here.' : 'Try a different topic, source or search term.'}
        />

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center pt-6">
            <button onClick={loadMore} className={cn('btn btn-plain')}>
              Show more · {feedItems.length - visibleItems.length} remaining
            </button>
          </div>
        )}
      </section>

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
