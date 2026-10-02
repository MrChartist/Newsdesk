import { motion } from 'framer-motion';
import { useStocks } from '@/hooks/useStockData';
import { rangePosition } from '@/lib/utils';

/** Market breadth from price action only: advancers vs decliners and 52-week extremes. */
export default function MarketPulse() {
  const { data, isLoading } = useStocks();

  if (isLoading || !data) {
    return (
      <div className="card p-5 space-y-4">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    );
  }

  let up = 0, down = 0, flat = 0, nearHigh = 0, nearLow = 0, withRange = 0;
  for (const s of Object.values(data.stocks)) {
    if (s.change == null) continue;
    if (s.change > 0) up++; else if (s.change < 0) down++; else flat++;
    const pos = rangePosition(s.price, s.low52W, s.high52W);
    if (pos != null) {
      withRange++;
      if (pos >= 95) nearHigh++;
      if (pos <= 5) nearLow++;
    }
  }
  const total = up + down + flat;
  if (total === 0) return null;
  const pct = (n: number) => (n / total) * 100;

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-base font-extrabold">Market breadth</h3>
        <span className="text-xs text-muted-foreground tnum">{total} stocks</span>
      </div>

      <div className="mb-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(up)}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-ios-green" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(flat)}%` }} transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-ios-gray/60" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(down)}%` }} transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-ios-red" />
      </div>

      <div className="flex justify-between text-sm tnum">
        <div><p className="font-extrabold text-profit">{up}</p><p className="text-xs text-muted-foreground">Advancing</p></div>
        <div className="text-center"><p className="font-extrabold text-muted-foreground">{flat}</p><p className="text-xs text-muted-foreground">Unchanged</p></div>
        <div className="text-right"><p className="font-extrabold text-loss">{down}</p><p className="text-xs text-muted-foreground">Declining</p></div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <div className="rounded-[var(--r-sm)] bg-[var(--mat-fill-1)] px-3 py-2.5">
          <p className="text-lg font-extrabold text-profit tnum">{nearHigh}</p>
          <p className="text-[11px] text-muted-foreground">Within 5% of 52W high</p>
        </div>
        <div className="rounded-[var(--r-sm)] bg-[var(--mat-fill-1)] px-3 py-2.5">
          <p className="text-lg font-extrabold text-loss tnum">{nearLow}</p>
          <p className="text-[11px] text-muted-foreground">Within 5% of 52W low</p>
        </div>
      </div>
      {withRange < total && <p className="mt-2 text-[10px] text-muted-foreground">52W data available for {withRange} of {total}.</p>}
    </div>
  );
}
