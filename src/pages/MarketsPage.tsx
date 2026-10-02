import { useMemo, useState } from 'react';
import { Search, X, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStocks } from '@/hooks/useStockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import StockTable from '@/components/market/StockTable';
import { PageHeader, Stat } from '@/components/ui/Section';
import { cn, formatMarketCap, rangePosition } from '@/lib/utils';
import type { StockData } from '@/types/stock';

type Preset = 'all' | 'gainers' | 'losers' | 'high52' | 'low52';

const PRESETS: { id: Preset; label: string; test: (s: StockData) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'gainers', label: 'Gainers', test: (s) => (s.change ?? 0) > 0 },
  { id: 'losers', label: 'Losers', test: (s) => (s.change ?? 0) < 0 },
  { id: 'high52', label: 'Near 52W high', test: (s) => (rangePosition(s.price, s.low52W, s.high52W) ?? -1) >= 95 },
  { id: 'low52', label: 'Near 52W low', test: (s) => { const p = rangePosition(s.price, s.low52W, s.high52W); return p != null && p <= 5; } },
];

export default function MarketsPage() {
  useDocumentTitle('Screener');
  const { data, isLoading } = useStocks();
  const { symbols: watched, count: watchedCount } = useWatchlist();
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [watchOnly, setWatchOnly] = useState(false);
  const [preset, setPreset] = useState<Preset>('all');

  const allStocks = useMemo(() => (data ? Object.values(data.stocks) : []), [data]);
  const sectors = useMemo(
    () => Array.from(new Set(allStocks.map((s) => s.sector).filter(Boolean))).sort() as string[],
    [allStocks],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const presetTest = PRESETS.find((p) => p.id === preset)!.test;
    return allStocks.filter((s) => {
      if (watchOnly && !watched.includes(s.symbol)) return false;
      if (sector && s.sector !== sector) return false;
      if (!presetTest(s)) return false;
      if (q && !(s.symbol.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q) || s.sector?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [allStocks, query, sector, watchOnly, watched, preset]);

  const advancers = filtered.filter((s) => (s.change ?? 0) > 0).length;
  const decliners = filtered.filter((s) => (s.change ?? 0) < 0).length;
  const totalCap = filtered.reduce((a, s) => a + (s.marketCap || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="NSE universe"
        title="Screener"
        subtitle="Every tracked stock, live from TradingView. Tap a column to sort, a row to open the company."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Stocks" value={filtered.length.toLocaleString('en-IN')} />
        <Stat label="Advancing" value={advancers.toLocaleString('en-IN')} tone="profit" />
        <Stat label="Declining" value={decliners.toLocaleString('en-IN')} tone="loss" />
        <Stat label="Total market cap" value={formatMarketCap(totalCap)} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <div className="segmented" role="tablist" aria-label="Quick filters">
          {PRESETS.map((p) => (
            <button key={p.id} role="tab" aria-selected={preset === p.id} onClick={() => setPreset(p.id)} className="segmented-item">
              {preset === p.id && (
                <motion.span layoutId="preset-pill" className="absolute inset-0 rounded-full bg-card shadow-1" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by symbol, company or sector"
            aria-label="Filter stocks"
            className="field !pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Clear filter">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="field !w-auto min-w-0 flex-1 sm:flex-none" aria-label="Filter by sector">
            <option value="">All sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setWatchOnly((v) => !v)} aria-pressed={watchOnly} className={cn('btn shrink-0', watchOnly ? 'btn-primary' : 'btn-plain')}>
            <Star className={cn('h-4 w-4', watchOnly && 'fill-current')} />
            <span className="hidden sm:inline">Watchlist</span>
            {watchedCount > 0 && <span className="tnum text-xs opacity-80">{watchedCount}</span>}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card space-y-3 p-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      ) : (
        <StockTable stocks={filtered} showSector={!sector} />
      )}
    </div>
  );
}
