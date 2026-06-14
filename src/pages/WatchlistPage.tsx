import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Newspaper, LineChart } from 'lucide-react';
import { useStocks } from '@/hooks/useStockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import StockTable from '@/components/market/StockTable';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import type { NewsItem } from '@/types/news';

export default function WatchlistPage() {
  const { symbols, count } = useWatchlist();
  const { data: stockData, isLoading } = useStocks();
  const { data: newsData } = useNewsFeed();
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const watchedStocks = useMemo(() => {
    if (!stockData) return [];
    return symbols.map((s) => stockData.stocks[s]).filter(Boolean);
  }, [stockData, symbols]);

  // News that mentions any watched company
  const watchedNews = useMemo(() => {
    if (!newsData?.items || symbols.length === 0) return [];
    const set = new Set(symbols);
    return newsData.items
      .filter((item) => item.companies.some((c) => set.has(c)))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [newsData, symbols]);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <div className="surface-card p-6 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">My Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {count > 0 ? `${count} stock${count === 1 ? '' : 's'} tracked` : 'Star stocks anywhere to track them here.'}
          </p>
        </div>
      </div>

      {count === 0 ? (
        <div className="surface-card p-16 text-center">
          <Star className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-display font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Tap the ☆ star on any stock in the screener, a sector, or a company page to start tracking it.
          </p>
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors"
          >
            <LineChart className="w-4 h-4" /> Browse the screener
          </Link>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="surface-card p-12 text-center text-muted-foreground animate-pulse">Loading quotes…</div>
          ) : (
            <StockTable stocks={watchedStocks} showSector />
          )}

          <div className="pt-2">
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              Watchlist News
              <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">{watchedNews.length}</span>
            </h2>
            <NewsFeed
              items={watchedNews}
              onSelectArticle={setSelectedArticle}
              emptyTitle="No news for your watchlist yet"
              emptyHint="Stories mentioning your tracked stocks will surface here."
            />
          </div>
        </>
      )}

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
