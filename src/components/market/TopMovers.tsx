import { cn, formatPrice, formatChange } from '@/lib/utils';
import { useTopMovers } from '@/hooks/useStockData';
import { TrendingUp, TrendingDown, Flame, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopMovers() {
  const { data: movers, isLoading } = useTopMovers();

  if (isLoading || !movers) {
    return (
      <div className="surface-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Gainers */}
      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-profit" />
          <h3 className="text-sm font-semibold font-display">Top Gainers</h3>
        </div>
        <div className="space-y-1.5">
          {movers.gainers.slice(0, 5).map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="font-mono-data text-xs font-semibold">{stock.symbol}</span>
              </div>
              <span className="font-mono-data text-xs">{formatPrice(stock.price)}</span>
              <span className="font-mono-data text-xs text-profit flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {formatChange(stock.change)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Losers */}
      <div className="surface-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Snowflake className="w-4 h-4 text-loss" />
          <h3 className="text-sm font-semibold font-display">Top Losers</h3>
        </div>
        <div className="space-y-1.5">
          {movers.losers.slice(0, 5).map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="font-mono-data text-xs font-semibold">{stock.symbol}</span>
              </div>
              <span className="font-mono-data text-xs">{formatPrice(stock.price)}</span>
              <span className="font-mono-data text-xs text-loss flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {formatChange(stock.change)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
