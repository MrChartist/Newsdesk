import { motion } from 'framer-motion';
import { useStocks } from '@/hooks/useStockData';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockData } from '@/types/stock';

export default function MarketPulse() {
  const { data, isLoading } = useStocks();

  if (isLoading || !data) {
    return (
      <div className="surface-card p-4 h-[120px] flex items-center justify-center animate-pulse">
        <Activity className="w-6 h-6 text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Analyzing market sentiment...</span>
      </div>
    );
  }

  let buy = 0;
  let sell = 0;
  let neutral = 0;
  let total = 0;

  Object.values(data.stocks).forEach((s: StockData) => {
    if (s.recommendAll == null) return;
    total++;
    if (s.recommendAll >= 0.1) buy++;
    else if (s.recommendAll <= -0.1) sell++;
    else neutral++;
  });

  if (total === 0) return null;

  const buyPct = (buy / total) * 100;
  const sellPct = (sell / total) * 100;
  const neutralPct = (neutral / total) * 100;

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Market Pulse
        </h3>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5">
          {total} Stocks Analyzed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5 mb-3 gap-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${buyPct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-profit h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${neutralPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          className="bg-warning h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${sellPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="bg-loss h-full"
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs font-mono-data">
        <div className="flex flex-col">
          <span className="text-profit flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Bullish</span>
          <span className="font-semibold">{buyPct.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-warning flex items-center gap-1"><Minus className="w-3 h-3"/> Neutral</span>
          <span className="font-semibold">{neutralPct.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-loss flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Bearish</span>
          <span className="font-semibold">{sellPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
