import { cn, formatPrice, formatChange, rangePosition } from '@/lib/utils';
import type { StockData } from '@/types/stock';
import { RangeBar } from '../ui/Section';

interface Props {
  stock: StockData;
  compact?: boolean;
  className?: string;
}

export default function StockMiniCard({ stock, compact = false, className }: Props) {
  const up = (stock.change ?? 0) >= 0;
  const pos = rangePosition(stock.price, stock.low52W, stock.high52W);

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-[var(--mat-fill-2)] px-2.5 py-1 text-xs tnum', className)}>
        <span className="font-bold">{stock.symbol}</span>
        <span>{formatPrice(stock.price)}</span>
        <span className={up ? 'text-profit' : 'text-loss'}>{formatChange(stock.change)}</span>
      </span>
    );
  }

  return (
    <div className={cn('w-[230px] px-3.5 py-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-sm font-extrabold">{stock.symbol}</span>
        <span className={cn('text-xs font-bold tnum', up ? 'text-profit' : 'text-loss')}>{formatChange(stock.change)}</span>
      </div>
      <p className="truncate text-xs text-muted-foreground">{stock.name}</p>
      <p className="mt-1.5 text-base font-bold tnum">{formatPrice(stock.price)}</p>
      {pos != null && (
        <div className="mt-2.5">
          <RangeBar position={pos} />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tnum">
            <span>52W low</span><span>52W high</span>
          </div>
        </div>
      )}
    </div>
  );
}
