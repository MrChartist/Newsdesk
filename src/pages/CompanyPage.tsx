import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { cn, formatPrice, formatChange, formatMarketCap, formatVolume, getRecommendationLabel } from '@/lib/utils';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import WatchlistStar from '@/components/market/WatchlistStar';
import { useStocks } from '@/hooks/useStockData';
import { getSectorMeta } from '@/data/sectors';
import type { NewsItem } from '@/types/news';
import type { StockData } from '@/types/stock';

async function fetchCompanyData(symbol: string) {
  const res = await fetch(`/api/company/${symbol}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export default function CompanyPage() {
  const { symbol } = useParams();
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['company', symbol],
    queryFn: () => fetchCompanyData(symbol!),
    enabled: !!symbol,
    refetchInterval: 60000,
  });

  const { data: allStocks } = useStocks();

  const peers = useMemo(() => {
    if (!allStocks || !data?.stock?.sector) return [];
    return Object.values(allStocks.stocks)
      .filter((s) => s.sector === data.stock.sector && s.symbol !== symbol)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, 6);
  }, [allStocks, data?.stock?.sector, symbol]);

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Loading {symbol} data...</div>;
  }

  if (!data?.stock) {
    return <div className="text-center py-20 text-muted-foreground">No data found for {symbol}</div>;
  }

  const { stock, news, name } = data;
  const isProfit = stock.change >= 0;
  const rec = getRecommendationLabel(stock.recommendAll);
  const sectorMeta = getSectorMeta(stock.sector);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header Profile */}
      <div className="surface-card p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">{symbol}</h1>
            <WatchlistStar symbol={symbol!} size={22} />
            {stock.sector && (
              <Link
                to={`/sector/${encodeURIComponent(stock.sector)}`}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: `${sectorMeta.color}22`, color: sectorMeta.color }}
              >
                {stock.sector}
              </Link>
            )}
          </div>
          <p className="text-muted-foreground text-lg">{name || stock.name}</p>
          {stock.industry && <p className="text-xs text-muted-foreground/70 mt-1">{stock.industry}</p>}
        </div>

        <div className="flex flex-col md:items-end">
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-4xl font-bold">{formatPrice(stock.price)}</span>
            <div className={cn("flex flex-col font-mono-data", isProfit ? "text-profit" : "text-loss")}>
              <span className="flex items-center text-lg font-bold">
                {isProfit ? <TrendingUp className="w-5 h-5 mr-1"/> : <TrendingDown className="w-5 h-5 mr-1"/>}
                {formatChange(stock.change)}
              </span>
              <span className="text-sm opacity-80">{isProfit ? '+' : ''}₹{stock.changeAbs?.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Live from NSE via TradingView</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Market Cap</span>
          <span className="text-xl font-mono-data font-semibold">{formatMarketCap(stock.marketCap)}</span>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Volume</span>
          <span className="text-xl font-mono-data font-semibold">{formatVolume(stock.volume)}</span>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Technical Rating</span>
          <span className={cn("text-xl font-display font-bold", rec.color)}>{rec.label}</span>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">52W Range</span>
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs font-mono-data text-muted-foreground mb-1">
              <span>{formatPrice(stock.low52W)}</span>
              <span>{formatPrice(stock.high52W)}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
              {stock.price && stock.low52W && stock.high52W && (
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_8px_var(--primary)]"
                  style={{ left: `${Math.max(0, Math.min(100, ((stock.price - stock.low52W) / (stock.high52W - stock.low52W)) * 100))}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance + momentum */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <PerfStat label="1 Week" value={stock.perfWeek} />
        <PerfStat label="1 Month" value={stock.perfMonth} />
        <PerfStat label="3 Months" value={stock.perf3Month} />
        <div className="surface-card p-4">
          <span className="text-sm text-muted-foreground">RSI (14)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn('text-xl font-mono-data font-semibold', stock.rsi == null ? '' : stock.rsi > 70 ? 'text-loss' : stock.rsi < 30 ? 'text-profit' : '')}>
              {stock.rsi != null ? stock.rsi.toFixed(1) : '—'}
            </span>
            {stock.rsi != null && (
              <span className="text-[11px] text-muted-foreground">
                {stock.rsi > 70 ? 'Overbought' : stock.rsi < 30 ? 'Oversold' : 'Neutral'}
              </span>
            )}
          </div>
        </div>
        <div className="surface-card p-4">
          <span className="text-sm text-muted-foreground">ADX (trend)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono-data font-semibold">{stock.adx != null ? stock.adx.toFixed(1) : '—'}</span>
            {stock.adx != null && (
              <span className="text-[11px] text-muted-foreground">{stock.adx > 25 ? 'Trending' : 'Range-bound'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sector peers */}
      {peers.length > 0 && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-display font-semibold">Sector Peers — {stock.sector}</h2>
            <Link to={`/sector/${encodeURIComponent(stock.sector)}`} className="text-xs text-primary hover:underline">
              View sector →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {peers.map((p: StockData) => {
              const pu = (p.change ?? 0) >= 0;
              return (
                <Link
                  key={p.symbol}
                  to={`/company/${p.symbol}`}
                  className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-3 py-2.5 hover:ring-white/15 transition-all"
                >
                  <p className="font-mono-data text-xs font-semibold truncate">{p.symbol}</p>
                  <p className="font-mono-data text-sm mt-0.5">{formatPrice(p.price)}</p>
                  <p className={cn('font-mono-data text-[11px]', pu ? 'text-profit' : 'text-loss')}>{formatChange(p.change)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* TradingView chart link */}
      <a
        href={`https://www.tradingview.com/symbols/NSE-${symbol}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5" />
          <span className="font-semibold">Open interactive chart</span>
          <span className="text-sm opacity-80">— Full technicals & price history on TradingView</span>
        </div>
        <ExternalLink className="w-5 h-5" />
      </a>

      {/* News Feed */}
      <div className="pt-4">
        <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
          Company Intelligence
          <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">{news?.count || 0} articles</span>
        </h2>
        <NewsFeed
          items={news?.items || []}
          isLoading={isLoading}
          onSelectArticle={setSelectedArticle}
          emptyTitle={`No recent news for ${symbol}`}
          emptyHint="News mentioning this company will appear here as it's archived."
        />
      </div>

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}

function PerfStat({ label, value }: { label: string; value: number | null }) {
  const up = (value ?? 0) >= 0;
  return (
    <div className="surface-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className={cn('text-xl font-mono-data font-semibold mt-1', value == null ? 'text-muted-foreground' : up ? 'text-profit' : 'text-loss')}>
        {formatChange(value)}
      </p>
    </div>
  );
}
