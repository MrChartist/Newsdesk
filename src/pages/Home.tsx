import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNewsFeed, useFeedSources } from '@/hooks/useNewsFeed';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookmarks } from '@/hooks/useBookmarks';
import HeroStats from '@/components/stats/HeroStats';
import MarketTicker from '@/components/market/MarketTicker';
import MarketPulse from '@/components/market/MarketPulse';
import TopMovers from '@/components/market/TopMovers';
import SectorHeatmap from '@/components/market/SectorHeatmap';
import NewsFeed from '@/components/news/NewsFeed';
import FeedControls, { type SortMode } from '@/components/news/FeedControls';
import ArticleModal from '@/components/news/ArticleModal';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';

// Default categories to show in the curated "All Intelligence" view
const DEFAULT_CATEGORIES = [
  'Markets', 'Stocks', 'Corporate', 'Business', 'Economy', 'Money', 'IPO', 'Tech', 'AI',
  'Geopolitics', 'MiddleEast', 'Defense', 'World'
];

const PAGE_SIZE = 24;

export default function Home() {
  const { data: newsData, isLoading, isError, refetch } = useNewsFeed();
  const { data: feedSources } = useFeedSources();
  const { items: savedItems, count: savedCount } = useBookmarks();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const debouncedSearch = useDebounce(search, 200);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // "/" focuses the search box (unless already typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isFiltering = Boolean(debouncedSearch.trim() || source || savedOnly);

  const filteredItems = useMemo(() => {
    const base = savedOnly ? savedItems : (newsData?.items ?? []);
    const q = debouncedSearch.trim().toLowerCase();

    const result = base.filter((item) => {
      // Category: explicit pick wins; otherwise curate the home view only when
      // the user isn't actively searching/filtering.
      if (activeCategory) {
        if (item.category !== activeCategory) return false;
      } else if (!isFiltering) {
        if (!DEFAULT_CATEGORIES.includes(item.category)) return false;
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

  // Reset pagination whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [activeCategory, source, sort, savedOnly, debouncedSearch]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, page * PAGE_SIZE),
    [filteredItems, page],
  );
  const hasMore = visibleItems.length < filteredItems.length;

  // Infinite scroll
  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: '600px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  const clearCategory = (id: string | null) => {
    setActiveCategory(id);
    if (id) setSavedOnly(false);
  };

  // Category tabs — mix of financial and geopolitical
  const filterTabs = [
    { id: null, label: 'All Intelligence' },
    ...CATEGORIES.filter((c) => DEFAULT_CATEGORIES.includes(c.id)),
  ];

  const heading = savedOnly
    ? 'Saved Articles'
    : activeCategory
      ? (CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory)
      : debouncedSearch.trim()
        ? `Results for “${debouncedSearch.trim()}”`
        : 'Market Intelligence';

  return (
    <div className="space-y-5 pb-12">
      {/* Quick Stats */}
      <HeroStats />

      {/* Live Index Strip (NIFTY / BANKNIFTY / SENSEX) */}
      <MarketTicker />

      {/* Market Overview — sentiment, movers, sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <MarketPulse />
        <SectorHeatmap />
        <div className="lg:col-span-2">
          <TopMovers />
        </div>
      </div>

      {/* Search / filter / sort controls */}
      <FeedControls
        ref={searchRef}
        search={search}
        onSearchChange={setSearch}
        sources={feedSources ?? []}
        source={source}
        onSourceChange={setSource}
        sort={sort}
        onSortChange={setSort}
        savedOnly={savedOnly}
        onToggleSaved={() => { setSavedOnly((v) => !v); setActiveCategory(null); }}
        savedCount={savedCount}
      />

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {filterTabs.map((tab) => {
          const active = !savedOnly && (tab.id === null ? activeCategory === null : activeCategory === tab.id);
          const meta = tab.id ? CATEGORIES.find((c) => c.id === tab.id) : null;
          const Icon = meta?.icon;

          return (
            <button
              key={tab.id ?? 'all'}
              onClick={() => clearCategory(tab.id ?? null)}
              className={cn(
                "relative px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" style={active ? { color: meta?.color } : {}} />}
              <span>{tab.label ?? tab.id}</span>
              {active && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/10 -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* News Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            {heading}
            <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">
              {filteredItems.length}
            </span>
          </h2>
        </div>

        <NewsFeed
          items={visibleItems}
          isLoading={isLoading && !savedOnly}
          isError={isError && !savedOnly}
          onRetry={() => refetch()}
          onSelectArticle={setSelectedArticle}
          emptyTitle={savedOnly ? 'No saved articles yet' : 'No articles found'}
          emptyHint={
            savedOnly
              ? 'Tap the bookmark icon on any article to save it for later.'
              : 'Try a different category, source, or search term.'
          }
        />

        {/* Infinite-scroll sentinel + manual fallback */}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center pt-8">
            <button
              onClick={loadMore}
              className="px-5 py-2.5 rounded-xl bg-surface ring-1 ring-white/5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Load more ({filteredItems.length - visibleItems.length} remaining)
            </button>
          </div>
        )}
      </div>

      <ArticleModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
