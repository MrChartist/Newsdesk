import { Link } from 'react-router-dom';
import { cn, formatPrice } from '@/lib/utils';
import { useTopMovers } from '@/hooks/useStockData';
import { ChangePill } from '../ui/Section';
import type { StockData } from '@/types/stock';

function MoverList({ title, stocks }: { title: string; stocks: StockData[] }) {
  return (
    <div className="card p-2">
      <h3 className="px-3 pb-1 pt-3 font-display text-base font-extrabold">{title}</h3>
      <ul>
        {stocks.slice(0, 5).map((s) => (
          <li key={s.symbol}>
            <Link
              to={`/company/${s.symbol}`}
              className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2.5 transition-colors hover:bg-[var(--mat-fill-1)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{s.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.name}</span>
              </span>
              <span className="text-sm tnum">{formatPrice(s.price)}</span>
              <ChangePill value={s.change} className="w-[4.6rem] justify-center" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TopMovers({ className }: { className?: string }) {
  const { data: movers, isLoading } = useTopMovers();

  if (isLoading || !movers) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2', className)}>
        {[0, 1].map((i) => <div key={i} className="card skeleton !rounded-[var(--r-lg)] h-[300px]" />)}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      <MoverList title="Top gainers" stocks={movers.gainers} />
      <MoverList title="Top losers" stocks={movers.losers} />
    </div>
  );
}
