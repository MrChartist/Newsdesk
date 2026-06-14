import { useMemo, useState } from 'react';
import { Search, X, Star, LineChart, ArrowDownWideNarrow } from 'lucide-react';
import { useStocks } from '@/hooks/useStockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import StockTable from '@/components/market/StockTable';
import { cn, formatMarketCap } from '@/lib/utils';

const selectClass =
  'appearance-none rounded-xl bg-surface ring-1 ring-white/5 text-sm pl-3 pr-8 py-2.5 ' +
  'text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer';

export default function MarketsPage() {
  const { data, isLoading } = useStocks();
  const { symbols: watched, count: watchedCount } = useWatchlist();
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [watchOnly, setWatchOnly] = useState(false);

  const allStocks = useMemo(() => (data ? Object.values(data.stocks) : []), [data]);
  const sectors = useMemo(
    () => Array.from(new Set(allStocks.map((s) => s.sector).filter(Boolean))).sort() as string[],
    [allStocks],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allStocks.filter((s) => {
      if (watchOnly && !watched.includes(s.symbol)) return false;
      if (sector && s.sector !== sector) return false;
      if (q && !(
        s.symbol.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.sector?.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [allStocks, query, sector, watchOnly, watched]);

  const advancers = filtered.filter((s) => (s.change ?? 0) > 0).length;
  const decliners = filtered.filter((s) => (s.change ?? 0) < 0).length;
  const totalCap = filtered.reduce((a, s) => a + (s.marketCap || 0), 0);

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-primary/15 text-primary">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Market Screener</h1>
            <p className="text-sm text-muted-foreground">Live NSE universe via TradingView — click any column to sort.</p>
          </div>
        </div>

        {/* Breadth summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat label="Stocks" value={filtered.length.toString()} />
          <Stat label="Advancing" value={advancers.toString()} valueClass="text-profit" />
          <Stat label="Declining" value={decliners.toString()} valueClass="text-loss" />
          <Stat label="Total Mkt Cap" value={formatMarketCap(totalCap)} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, sector…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface ring-1 ring-white/5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <select value={sector} onChange={(e) => setSector(e.target.value)} className={selectClass} aria-label="Filter by sector">
              <option value="">All sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ArrowDownWideNarrow className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={() => setWatchOnly((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all whitespace-nowrap',
              watchOnly ? 'bg-amber-400/15 ring-amber-400/40 text-amber-400' : 'bg-surface ring-white/5 text-muted-foreground hover:text-foreground',
            )}
          >
            <Star className={cn('w-4 h-4', watchOnly && 'fill-current')} />
            <span className="hidden sm:inline">Watchlist</span>
            {watchedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono-data">{watchedCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="surface-card p-12 text-center text-muted-foreground animate-pulse">Loading market data…</div>
      ) : (
        <StockTable stocks={filtered} showSector={!sector} />
      )}
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('font-mono-data font-bold text-lg mt-0.5', valueClass)}>{value}</p>
    </div>
  );
}
