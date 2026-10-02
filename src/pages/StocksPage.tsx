import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, Filter, Building2, Briefcase } from 'lucide-react';
import { useStocks } from '@/hooks/useStockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/ui/Section';
import { cn } from '@/lib/utils';
import type { StockData } from '@/types/stock';

export default function StocksPage() {
  useDocumentTitle('Stocks — NSE Universe');

  const { data, isLoading, isError, refetch } = useStocks();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const stocks = data?.stocks || [];

  // Extract distinct sectors from preloaded list
  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const s of stocks) {
      if (s.sector && s.sector !== 'Diversified') set.add(s.sector);
    }
    return ['all', ...Array.from(set).sort()];
  }, [stocks]);

  // Filtered stocks
  const displayedStocks = useMemo(() => {
    let list: StockData[] = stocks;

    if (selectedSector !== 'all') {
      list = list.filter((s) => s.sector === selectedSector);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.sector && s.sector.toLowerCase().includes(q)) ||
          (s.industry && s.industry.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [stocks, selectedSector, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NSE Universe · Equities"
        title="Stocks"
        subtitle={
          isLoading
            ? 'Loading preloaded Indian equities…'
            : `${stocks.length} NSE stocks loaded with company intelligence and archived news.`
        }
      />

      {/* Controls: Search & Sector Filter */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 500+ stocks by ticker (e.g. RELIANCE, TCS), name, or sector…"
            className="w-full rounded-[var(--r-md)] bg-[var(--mat-fill-1)] border border-[var(--mat-separator)] pl-10 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sector pill filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none edge-fade text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Sector:
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={cn(
                'px-2.5 py-1 rounded-full whitespace-nowrap transition-colors',
                selectedSector === sec
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-[var(--mat-fill-1)] text-muted-foreground hover:text-foreground',
              )}
            >
              {sec === 'all' ? 'All Sectors' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass rounded-[var(--r-md)] p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-muted/50 rounded w-1/3" />
              <div className="h-3 bg-muted/30 rounded w-2/3" />
              <div className="h-6 bg-muted/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="glass rounded-[var(--r-md)] p-8 text-center space-y-3">
          <p className="font-semibold text-rose-500">Failed to load instruments</p>
          <button onClick={() => refetch()} className="btn btn-primary text-xs">
            Retry Loading Stocks
          </button>
        </div>
      )}

      {!isLoading && displayedStocks.length === 0 && (
        <div className="glass rounded-[var(--r-md)] p-12 text-center space-y-2">
          <Building2 className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="font-display font-bold text-lg">No stocks found</p>
          <p className="text-sm text-muted-foreground">
            No stock matches your search “{search}”. Try another ticker or reset sector filter.
          </p>
        </div>
      )}

      {!isLoading && displayedStocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedStocks.map((stock) => (
            <Link
              key={stock.symbol}
              to={`/company/${stock.symbol}`}
              className="card-interactive-row glass rounded-[var(--r-md)] p-4 flex flex-col justify-between hover:border-primary/40 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {/* Clean symbol without dollar sign */}
                    <span className="font-display text-base font-extrabold tracking-tight group-hover:text-primary transition-colors">
                      {stock.symbol}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                      {stock.name}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-muted-foreground bg-[var(--mat-fill-2)] px-2 py-0.5 rounded-full">
                    NSE
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {stock.sector && (
                    <span className="text-[11px] font-semibold text-muted-foreground bg-[var(--mat-fill-1)] px-2 py-0.5 rounded-md">
                      {stock.sector}
                    </span>
                  )}
                  {stock.industry && (
                    <span className="text-[10px] text-muted-foreground/80 line-clamp-1">
                      {stock.industry}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--mat-separator)] flex items-center justify-between text-xs font-semibold text-primary">
                <span className="text-muted-foreground font-normal text-[11px]">
                  Company Intelligence
                </span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  News stream <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
