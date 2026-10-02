import { cn, formatChange } from '@/lib/utils';
import { useIndices } from '@/hooks/useStockData';
import type { IndexData } from '@/types/stock';

/** Index tiles — like the iOS Stocks widgets. */
export default function MarketTicker() {
  const { data: indices, isLoading } = useIndices();
  const list = indices ? (Object.values(indices) as IndexData[]) : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="card skeleton !rounded-[var(--r-lg)] h-[88px]" />)}
      </div>
    );
  }
  if (!list.length) return null;

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] sm:overflow-visible sm:px-0">
      {list.map((idx) => {
        const up = idx.change >= 0;
        return (
          <div key={idx.symbol} className="card relative min-w-[200px] shrink-0 overflow-hidden p-4 sm:min-w-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(120% 90% at 100% 0%, hsl(var(--ios-${up ? 'green' : 'red'}) / 0.13), transparent 60%)` }}
            />
            <p className="relative text-[0.8125rem] font-semibold text-muted-foreground">{idx.name || idx.symbol}</p>
            <p className="relative mt-1 font-display text-[1.5rem] font-extrabold tracking-tight tnum">
              {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className={cn('relative mt-0.5 text-sm font-bold tnum', up ? 'text-profit' : 'text-loss')}>
              {formatChange(idx.change)}
              <span className="ml-1.5 font-medium opacity-75">
                {idx.changeAbs >= 0 ? '+' : ''}{idx.changeAbs?.toFixed(2)}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
