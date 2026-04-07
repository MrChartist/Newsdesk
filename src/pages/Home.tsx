import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNewsFeed, useFilteredNews } from '@/hooks/useNewsFeed';
import HeroStats from '@/components/stats/HeroStats';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';

// Default categories to show in the "All" view
const DEFAULT_CATEGORIES = [
  'Markets', 'Stocks', 'Corporate', 'Business', 'Economy', 'Money', 'IPO', 'Tech', 'AI',
  'Geopolitics', 'MiddleEast', 'Defense', 'World'
];

export default function Home() {
  const { data: newsData, isLoading } = useNewsFeed();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Filter to default categories, or specific category if selected
  const filteredItems = useMemo(() => {
    if (!newsData?.items) return [];
    let items = newsData.items;

    if (activeCategory) {
      // Specific category selected
      items = items.filter(i => i.category === activeCategory);
    } else {
      // Default: show financial + major geopolitical news
      items = items.filter(i => DEFAULT_CATEGORIES.includes(i.category));
    }

    // Sort by newest first
    return [...items].sort((a, b) =>
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }, [newsData?.items, activeCategory]);

  // Category tabs — mix of financial and geopolitical
  const filterTabs = [
    { id: null, label: 'All Intelligence' },
    ...CATEGORIES.filter(c =>
      DEFAULT_CATEGORIES.includes(c.id)
    ),
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Quick Stats */}
      <HeroStats />

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {filterTabs.map((tab) => {
          const active = tab.id === null ? activeCategory === null : activeCategory === tab.id;
          const meta = tab.id ? CATEGORIES.find(c => c.id === tab.id) : null;
          const Icon = meta?.icon;

          return (
            <button
              key={tab.id ?? 'all'}
              onClick={() => setActiveCategory(tab.id ?? null)}
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
            {activeCategory ? (
              <>
                {CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory}
                <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">
                  {filteredItems.length}
                </span>
              </>
            ) : (
              <>
                Market Intelligence
                <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">
                  {filteredItems.length}
                </span>
              </>
            )}
          </h2>
        </div>

        <NewsFeed
          items={filteredItems}
          isLoading={isLoading}
          onSelectArticle={setSelectedArticle}
        />
      </div>

      <ArticleModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
