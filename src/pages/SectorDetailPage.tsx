import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSectorDetail } from '@/hooks/useStockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getSectorMeta } from '@/data/sectors';
import { cn, formatMarketCap, formatChange, rangePosition } from '@/lib/utils';
import StockTable from '@/components/market/StockTable';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import { SectionHeader, ChangePill } from '@/components/ui/Section';
import type { NewsItem } from '@/types/news';
import type { StockData } from '@/types/stock';

export default function SectorDetailPage() {
  const { name } = useParams();
  const sectorName = name ? decodeURIComponent(name) : '';
  useDocumentTitle(sectorName);
  const { data, isLoading, isError, refetch } = useSectorDetail(sectorName);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const meta = getSectorMeta(sectorName);
  const Icon = meta.icon;

  // Price-action read on the sector: how many constituents sit at the top of their 52-week range
  const nearHigh = useMemo(() => {
    if (!data) return null;
    const ranged = data.constituents.map((s) => rangePosition(s.price, s.low52W, s.high52W)).filter((v): v is number => v != null);
    if (!ranged.length) return null;
    return { count: ranged.filter((p) => p >= 95).length, of: ranged.length };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="card skeleton !rounded-[var(--r-xl)] h-44" />
        <div className="card skeleton !rounded-[var(--r-lg)] h-64" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="space-y-3 py-20 text-center text-muted-foreground">
        <p>No data found for “{sectorName}”.</p>
        <Link to="/sectors" className="font-semibold text-primary">Back to sectors</Link>
      </div>
    );
  }

  const up = data.avgChange >= 0;
  const total = data.advancers + data.decliners || 1;
  const advPct = (data.advancers / total) * 100;

  return (
    <div className="space-y-8">
      <section className="card relative overflow-hidden rounded-[var(--r-xl)] p-6 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ background: `radial-gradient(70% 120% at 0% 0%, ${meta.color}, transparent 70%)` }} />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="squircle !h-14 !w-14 !rounded-2xl" style={{ background: meta.color }}>
              <Icon className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <div>
              <p className="eyebrow">Sector</p>
              <h1 className="large-title">{data.sector}</h1>
              <p className="mt-1 text-sm text-muted-foreground tnum">{data.count} stocks · {formatMarketCap(data.marketCap)} market cap</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-2 font-display text-[2.25rem] font-extrabold tracking-tight tnum', up ? 'text-profit' : 'text-loss')}>
            {up ? <TrendingUp className="h-7 w-7" /> : <TrendingDown className="h-7 w-7" />}
            {up ? '+' : ''}{data.avgChange.toFixed(2)}%
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--r-md)] bg-[var(--mat-fill-1)] p-4">
            <div className="mb-2 flex justify-between text-xs font-semibold tnum">
              <span className="text-profit">{data.advancers} advancing</span>
              <span className="text-loss">{data.decliners} declining</span>
            </div>
            <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
              <div className="h-full rounded-full bg-ios-green" style={{ width: `${advPct}%` }} />
              <div className="h-full flex-1 rounded-full bg-ios-red/80" />
            </div>
          </div>
          <div className="rounded-[var(--r-md)] bg-[var(--mat-fill-1)] p-4">
            <p className="text-xs text-muted-foreground">Near 52-week high</p>
            <p className="mt-0.5 font-display text-xl font-extrabold tnum">
              {nearHigh ? <>{nearHigh.count}<span className="text-sm font-semibold text-muted-foreground"> of {nearHigh.of}</span></> : '—'}
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-[var(--mat-fill-1)] p-4">
            <p className="text-xs text-muted-foreground">Day’s extremes</p>
            <p className="mt-1 text-sm font-bold tnum">
              {data.topStock && <span className="text-profit">{data.topStock.symbol} {formatChange(data.topStock.change)}</span>}
              {data.bottomStock && <span className="ml-3 text-loss">{data.bottomStock.symbol} {formatChange(data.bottomStock.change)}</span>}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderCard title="Leaders" stocks={data.leaders} />
        <LeaderCard title="Laggards" stocks={data.laggards} />
      </div>

      <section>
        <SectionHeader title="Constituents" count={data.constituents.length} />
        <StockTable stocks={data.constituents} />
      </section>

      <section>
        <SectionHeader title={`${data.sector} news`} count={data.news.count} />
        <NewsFeed
          items={data.news.items}
          isError={isError}
          onRetry={() => refetch()}
          onSelectArticle={setSelectedArticle}
          emptyTitle="No sector news yet"
          emptyHint="Stories mentioning these companies will appear here as they’re archived."
        />
      </section>

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}

function LeaderCard({ title, stocks }: { title: string; stocks: StockData[] }) {
  return (
    <div className="card p-2">
      <h3 className="px-3 pb-1 pt-3 font-display text-base font-extrabold">{title}</h3>
      <ul>
        {stocks.map((s) => (
          <li key={s.symbol}>
            <Link to={`/company/${s.symbol}`} className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2.5 transition-colors hover:bg-[var(--mat-fill-1)]">
              <span className="w-24 shrink-0 truncate text-sm font-bold">{s.symbol}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{s.name}</span>
              <ChangePill value={s.change} className="w-[4.6rem] justify-center" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
