import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, BarChart3 } from 'lucide-react';
import { cn, formatPrice, formatChange, formatMarketCap, formatVolume, rangePosition, offHigh } from '@/lib/utils';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import WatchlistStar from '@/components/market/WatchlistStar';
import { SectionHeader, ChangePill, RangeBar } from '@/components/ui/Section';
import { useStocks } from '@/hooks/useStockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
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
  useDocumentTitle(symbol);
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
    return (
      <div className="space-y-5">
        <div className="card skeleton !rounded-[var(--r-xl)] h-44" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="card skeleton !rounded-[var(--r-lg)] h-24" />)}</div>
      </div>
    );
  }

  if (!data?.stock) {
    return (
      <div className="space-y-3 py-20 text-center text-muted-foreground">
        <p>No data found for {symbol}.</p>
        <Link to="/markets" className="font-semibold text-primary">Open the screener</Link>
      </div>
    );
  }

  const { stock, news, name } = data;
  const isProfit = (stock.change ?? 0) >= 0;
  const sectorMeta = getSectorMeta(stock.sector);
  const pos = rangePosition(stock.price, stock.low52W, stock.high52W);
  const fromHigh = offHigh(stock.price, stock.high52W);
  const fromLow = stock.price != null && stock.low52W ? ((stock.price - stock.low52W) / stock.low52W) * 100 : null;

  return (
    <div className="space-y-8">
      <section className="card relative overflow-hidden rounded-[var(--r-xl)] p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(80% 140% at 100% 0%, hsl(var(--ios-${isProfit ? 'green' : 'red'}) / 0.14), transparent 65%)` }}
        />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="large-title">{symbol}</h1>
              <WatchlistStar symbol={symbol!} size={24} />
              {stock.sector && (
                <Link
                  to={`/sector/${encodeURIComponent(stock.sector)}`}
                  className="chip !px-3 !py-1.5 text-[0.75rem]"
                  style={{ background: `${sectorMeta.color}26`, color: `color-mix(in srgb, ${sectorMeta.color} 70%, hsl(var(--foreground)))` }}
                >
                  {stock.sector}
                </Link>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{name || stock.name}</p>
            {stock.industry && <p className="mt-0.5 text-xs text-muted-foreground/80">{stock.industry}</p>}
          </div>

          <div className="md:text-right">
            <div className="flex items-center gap-3 md:justify-end">
              <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-tight tnum">{formatPrice(stock.price)}</span>
            </div>
            <div className={cn('mt-2 flex items-center gap-2 md:justify-end', isProfit ? 'text-profit' : 'text-loss')}>
              <ChangePill value={stock.change} className="!text-sm" />
              <span className="text-sm font-semibold tnum">{isProfit ? '+' : ''}₹{stock.changeAbs?.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Live from NSE via TradingView</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Market cap" value={formatMarketCap(stock.marketCap)} />
        <Tile label="Volume" value={formatVolume(stock.volume)} />
        <Tile label="Off 52W high" value={fromHigh != null ? formatChange(fromHigh) : '—'} tone={fromHigh != null && fromHigh > -5 ? 'profit' : undefined} />
        <Tile label="Above 52W low" value={fromLow != null ? formatChange(fromLow) : '—'} />
      </section>

      <section className="grid gap-3 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[0.8125rem] font-medium text-muted-foreground">52-week range</span>
            {pos != null && <span className="text-xs font-semibold tnum text-muted-foreground">{pos.toFixed(0)}% of range</span>}
          </div>
          <RangeBar position={pos} className="!h-2" />
          <div className="mt-2.5 flex justify-between text-sm font-semibold tnum">
            <span>{formatPrice(stock.low52W)}</span>
            <span>{formatPrice(stock.high52W)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:col-span-3">
          <Perf label="1 week" value={stock.perfWeek} />
          <Perf label="1 month" value={stock.perfMonth} />
          <Perf label="3 months" value={stock.perf3Month} />
        </div>
      </section>

      {peers.length > 0 && (
        <section>
          <SectionHeader title={`Peers · ${stock.sector}`} to={`/sector/${encodeURIComponent(stock.sector)}`} toLabel="View sector" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {peers.map((p: StockData) => (
              <Link key={p.symbol} to={`/company/${p.symbol}`} className="card card-interactive !rounded-[var(--r-md)] px-3.5 py-3">
                <p className="truncate text-xs font-bold">{p.symbol}</p>
                <p className="mt-0.5 text-sm font-semibold tnum">{formatPrice(p.price)}</p>
                <p className={cn('text-xs font-bold tnum', (p.change ?? 0) >= 0 ? 'text-profit' : 'text-loss')}>{formatChange(p.change)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <a
        href={`https://www.tradingview.com/symbols/NSE-${symbol}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="card card-interactive flex items-center gap-3.5 !rounded-[var(--r-lg)] p-4"
      >
        <span className="squircle !h-10 !w-10 !rounded-[11px]" style={{ background: '#0A84FF' }}><BarChart3 className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Open interactive chart</span>
          <span className="block truncate text-sm text-muted-foreground">Full price history on TradingView</span>
        </span>
        <ExternalLink className="h-5 w-5 text-muted-foreground" />
      </a>

      <section>
        <SectionHeader title="Company news" count={news?.count || 0} />
        <NewsFeed
          items={news?.items || []}
          onSelectArticle={setSelectedArticle}
          emptyTitle={`No recent news for ${symbol}`}
          emptyHint="News mentioning this company will appear here as it’s archived."
        />
      </section>

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'profit' | 'loss' }) {
  return (
    <div className="card p-4">
      <span className="text-[0.8125rem] font-medium text-muted-foreground">{label}</span>
      <p className={cn('mt-1 font-display text-xl font-extrabold tracking-tight tnum', tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss')}>{value}</p>
    </div>
  );
}

function Perf({ label, value, className }: { label: string; value: number | null; className?: string }) {
  const up = (value ?? 0) >= 0;
  return (
    <div className={cn('card p-4', className)}>
      <span className="text-[0.8125rem] font-medium text-muted-foreground">{label}</span>
      <p className={cn('mt-1 font-display text-xl font-extrabold tracking-tight tnum', value == null ? 'text-muted-foreground' : up ? 'text-profit' : 'text-loss')}>
        {formatChange(value)}
      </p>
    </div>
  );
}
