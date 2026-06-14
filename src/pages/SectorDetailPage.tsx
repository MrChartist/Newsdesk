import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { useSectorDetail } from '@/hooks/useStockData';
import { getSectorMeta } from '@/data/sectors';
import { cn, formatMarketCap, formatChange } from '@/lib/utils';
import StockTable from '@/components/market/StockTable';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import type { NewsItem } from '@/types/news';
import type { StockData } from '@/types/stock';

export default function SectorDetailPage() {
  const { name } = useParams();
  const sectorName = name ? decodeURIComponent(name) : '';
  const { data, isLoading, isError, refetch } = useSectorDetail(sectorName);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const meta = getSectorMeta(sectorName);
  const Icon = meta.icon;

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Loading {sectorName}…</div>;
  }
  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground space-y-4">
        <p>No data found for sector “{sectorName}”.</p>
        <Link to="/sectors" className="text-primary hover:underline">← Back to sectors</Link>
      </div>
    );
  }

  const up = data.avgChange >= 0;
  const total = data.advancers + data.decliners || 1;
  const advPct = (data.advancers / total) * 100;

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <Link to="/sectors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> All sectors
      </Link>

      {/* Header */}
      <div className="surface-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top left, ${meta.color} 0%, transparent 60%)` }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{data.sector}</h1>
              <p className="text-sm text-muted-foreground">{data.count} stocks · {formatMarketCap(data.marketCap)} market cap</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-2 font-mono-data text-3xl font-bold', up ? 'text-profit' : 'text-loss')}>
            {up ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
            {up ? '+' : ''}{data.avgChange.toFixed(2)}%
          </div>
        </div>

        {/* Breadth + sentiment */}
        <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span className="text-profit">{data.advancers} advancing</span>
              <span className="text-loss">{data.decliners} declining</span>
            </div>
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-loss/40">
              <div className="bg-profit h-full" style={{ width: `${advPct}%` }} />
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Bullish signals</p>
            <p className="font-mono-data font-bold text-lg text-profit">{data.bullishPct.toFixed(0)}%</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Day's range</p>
            <p className="font-mono-data text-sm mt-1">
              {data.topStock && <span className="text-profit">{data.topStock.symbol} {formatChange(data.topStock.change)}</span>}
              {data.bottomStock && <span className="text-loss ml-2">{data.bottomStock.symbol} {formatChange(data.bottomStock.change)}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Leaders & laggards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderCard title="Leaders" icon={TrendingUp} accent="text-profit" stocks={data.leaders} />
        <LeaderCard title="Laggards" icon={TrendingDown} accent="text-loss" stocks={data.laggards} />
      </div>

      {/* Constituents */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Constituents</h2>
        <StockTable stocks={data.constituents} />
      </div>

      {/* Sector news */}
      <div className="pt-4">
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          {data.sector} News
          <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">{data.news.count}</span>
        </h2>
        <NewsFeed
          items={data.news.items}
          isError={isError}
          onRetry={() => refetch()}
          onSelectArticle={setSelectedArticle}
          emptyTitle="No sector news yet"
          emptyHint="Stories mentioning these companies will appear here as they're archived."
        />
      </div>

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}

function LeaderCard({
  title, icon: Icon, accent, stocks,
}: { title: string; icon: typeof TrendingUp; accent: string; stocks: StockData[] }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('w-4 h-4', accent)} />
        <h3 className="text-sm font-semibold font-display">{title}</h3>
      </div>
      <div className="space-y-1">
        {stocks.map((s) => {
          const su = (s.change ?? 0) >= 0;
          return (
            <Link
              key={s.symbol}
              to={`/company/${s.symbol}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="font-mono-data text-xs font-semibold w-24 shrink-0 truncate">{s.symbol}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate min-w-0">{s.name}</span>
              <span className={cn('font-mono-data text-xs font-semibold w-16 text-right shrink-0', su ? 'text-profit' : 'text-loss')}>
                {formatChange(s.change)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
