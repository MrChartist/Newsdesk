import { cn, formatPrice, formatChange } from '@/lib/utils';
import { useIndices } from '@/hooks/useStockData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { IndexData } from '@/types/stock';

export default function MarketTicker() {
  const { data: indices, isLoading } = useIndices();

  const indexList = indices ? Object.values(indices) as IndexData[] : [];

  return (
    <div className="w-full glass rounded-2xl px-4 py-2.5 overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 shrink-0">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-profit live-dot" />
        </div>

        {isLoading ? (
          <div className="flex gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-20 bg-muted rounded mb-1" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none">
            {indexList.map((idx) => (
              <div key={idx.symbol} className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-muted-foreground">{idx.name || idx.symbol}</span>
                <span className="font-mono-data text-sm font-bold">
                  {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span className={cn(
                  'font-mono-data text-xs flex items-center gap-0.5',
                  idx.change >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {idx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatChange(idx.change)}
                  <span className="text-muted-foreground ml-1">({idx.changeAbs >= 0 ? '+' : ''}{idx.changeAbs?.toFixed(2)})</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
