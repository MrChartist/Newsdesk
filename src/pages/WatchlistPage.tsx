import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, LineChart } from 'lucide-react';
import { useStocks } from '@/hooks/useStockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import StockTable from '@/components/market/StockTable';
import NewsFeed, { EmptyState } from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import { PageHeader, SectionHeader } from '@/components/ui/Section';
import type { NewsItem } from '@/types/news';

export default function WatchlistPage() {
  useDocumentTitle('Watchlist');
  const { symbols, count } = useWatchlist();
  const { data: stockData, isLoading } = useStocks();
  const { data: newsData } = useNewsFeed();
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const watchedStocks = useMemo(
    () => (stockData ? symbols.map((s) => stockData.stocks[s]).filter(Boolean) : []),
    [stockData, symbols],
  );

  const watchedNews = useMemo(() => {
    if (!newsData?.items || symbols.length === 0) return [];
    const set = new Set(symbols);
    return newsData.items
      .filter((item) => item.companies.some((c) => set.has(c)))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [newsData, symbols]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your stocks"
        title="Watchlist"
        subtitle={count > 0 ? `${count} stock${count === 1 ? '' : 's'} tracked on this device.` : 'Star a stock anywhere to track it here.'}
      />

      {count === 0 ? (
        <div className="card">
          <EmptyState
            icon={Star}
            title="Your watchlist is empty"
            hint="Tap the star on any stock in the screener, a sector or a company page. It stays on this device."
            action={<Link to="/markets" className="btn btn-primary"><LineChart className="h-4 w-4" /> Browse the screener</Link>}
          />
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="card space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
          ) : (
            <StockTable stocks={watchedStocks} showSector initialSort="change" />
          )}

          <section>
            <SectionHeader title="Watchlist news" count={watchedNews.length} />
            <NewsFeed
              items={watchedNews}
              onSelectArticle={setSelectedArticle}
              emptyTitle="No news for your watchlist yet"
              emptyHint="Stories mentioning your tracked stocks will surface here."
            />
          </section>
        </>
      )}

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
