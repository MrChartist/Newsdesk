import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { cn, formatPrice, formatChange } from '@/lib/utils';
import { useStocks } from '@/hooks/useStockData';
import type { StockData } from '@/types/stock';

interface Props {
  onSelect: (symbol: string) => void;
  className?: string;
}

export default function CompanySearch({ onSelect, className }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { data } = useStocks();

  const results = useMemo(() => {
    if (!query || !data?.stocks) return [];
    const q = query.toLowerCase();
    return Object.values(data.stocks)
      .filter((s: StockData) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.sector?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query, data]);

  const handleSelect = useCallback((symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setOpen(false);
  }, [onSelect]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stocks... (TCS, Reliance, HDFC)"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-surface ring-1 ring-white/5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 glass rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto"
          >
            {results.map((stock: StockData) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-sm font-semibold">{stock.symbol}</span>
                    {stock.sector && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground truncate">{stock.sector}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-data text-sm">{formatPrice(stock.price)}</p>
                  <p className={cn('font-mono-data text-xs', stock.change && stock.change >= 0 ? 'text-profit' : 'text-loss')}>
                    {stock.change && stock.change >= 0 ? <TrendingUp className="inline w-3 h-3 mr-0.5" /> : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
                    {formatChange(stock.change)}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
