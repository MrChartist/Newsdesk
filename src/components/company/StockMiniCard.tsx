import { cn, formatPrice, formatChange, getRecommendationLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockData } from '@/types/stock';

interface Props {
  stock: StockData;
  compact?: boolean;
  className?: string;
}

export default function StockMiniCard({ stock, compact = false, className }: Props) {
  const rec = getRecommendationLabel(stock.recommendAll);

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 ring-1 ring-white/5 text-xs font-mono-data', className)}>
        <span className="font-semibold">{stock.symbol}</span>
        <span>{formatPrice(stock.price)}</span>
        <span className={stock.change && stock.change >= 0 ? 'text-profit' : 'text-loss'}>
          {formatChange(stock.change)}
        </span>
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] ring-1 ring-white/5', className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono-data text-sm font-bold">{stock.symbol}</span>
          <span className="font-mono-data text-sm">{formatPrice(stock.price)}</span>
          <span className={cn('font-mono-data text-xs flex items-center gap-0.5', stock.change && stock.change >= 0 ? 'text-profit' : 'text-loss')}>
            {stock.change && stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatChange(stock.change)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {stock.sector && (
            <span className="text-[10px] text-muted-foreground">{stock.sector}</span>
          )}
          <span className={cn('text-[10px] font-semibold', rec.color)}>{rec.label}</span>
          {stock.rsi != null && (
            <span className={cn('text-[10px]', stock.rsi > 70 ? 'text-loss' : stock.rsi < 30 ? 'text-profit' : 'text-muted-foreground')}>
              RSI {stock.rsi.toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
