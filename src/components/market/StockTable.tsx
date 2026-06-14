import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn, formatPrice, formatChange, formatMarketCap, formatVolume, getRecommendationLabel } from '@/lib/utils';
import type { StockData } from '@/types/stock';
import WatchlistStar from './WatchlistStar';

type SortKey = 'symbol' | 'price' | 'change' | 'perfMonth' | 'volume' | 'marketCap' | 'rsi' | 'recommendAll';

interface Column {
  key: SortKey;
  label: string;
  align: 'left' | 'right';
  className?: string;
}

const COLUMNS: Column[] = [
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'change', label: 'Chg %', align: 'right' },
  { key: 'perfMonth', label: '1M', align: 'right', className: 'hidden md:table-cell' },
  { key: 'volume', label: 'Volume', align: 'right', className: 'hidden lg:table-cell' },
  { key: 'marketCap', label: 'Mkt Cap', align: 'right', className: 'hidden sm:table-cell' },
  { key: 'rsi', label: 'RSI', align: 'right', className: 'hidden xl:table-cell' },
  { key: 'recommendAll', label: 'Signal', align: 'right' },
];

interface Props {
  stocks: StockData[];
  showSector?: boolean;
  initialSort?: SortKey;
  initialDir?: 'asc' | 'desc';
}

export default function StockTable({ stocks, showSector = false, initialSort = 'marketCap', initialDir = 'desc' }: Props) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [dir, setDir] = useState<'asc' | 'desc'>(initialDir);

  const sorted = useMemo(() => {
    const arr = [...stocks];
    arr.sort((a, b) => {
      if (sortKey === 'symbol') {
        const cmp = a.symbol.localeCompare(b.symbol);
        return dir === 'asc' ? cmp : -cmp;
      }
      const av = (a[sortKey] as number | null) ?? -Infinity;
      const bv = (b[sortKey] as number | null) ?? -Infinity;
      return dir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [stocks, sortKey, dir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDir(key === 'symbol' ? 'asc' : 'desc');
    }
  };

  if (stocks.length === 0) {
    return (
      <div className="surface-card p-12 text-center text-muted-foreground text-sm">
        No stocks match the current filters.
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-muted-foreground">
              <th className="w-9 px-2 py-3" />
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                const Arrow = !active ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={cn(
                      'px-3 py-3 font-medium cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      active && 'text-foreground',
                      col.className,
                    )}
                  >
                    <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                      {col.label}
                      <Arrow className="w-3 h-3 opacity-60" />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock) => {
              const rec = getRecommendationLabel(stock.recommendAll);
              const up = (stock.change ?? 0) >= 0;
              return (
                <tr
                  key={stock.symbol}
                  onClick={() => navigate(`/company/${stock.symbol}`)}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-2 py-2.5 text-center">
                    <WatchlistStar symbol={stock.symbol} size={15} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-mono-data font-semibold">{stock.symbol}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[160px] md:max-w-[220px]">
                      {showSector && stock.sector ? stock.sector : stock.name}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-data">{formatPrice(stock.price)}</td>
                  <td className={cn('px-3 py-2.5 text-right font-mono-data font-semibold', up ? 'text-profit' : 'text-loss')}>
                    {formatChange(stock.change)}
                  </td>
                  <td className={cn('px-3 py-2.5 text-right font-mono-data hidden md:table-cell', (stock.perfMonth ?? 0) >= 0 ? 'text-profit' : 'text-loss')}>
                    {formatChange(stock.perfMonth)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-data text-muted-foreground hidden lg:table-cell">
                    {formatVolume(stock.volume)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-data hidden sm:table-cell">{formatMarketCap(stock.marketCap)}</td>
                  <td className={cn('px-3 py-2.5 text-right font-mono-data hidden xl:table-cell', stock.rsi == null ? 'text-muted-foreground' : stock.rsi > 70 ? 'text-loss' : stock.rsi < 30 ? 'text-profit' : 'text-muted-foreground')}>
                    {stock.rsi != null ? stock.rsi.toFixed(0) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn('text-xs font-semibold whitespace-nowrap', rec.color)}>{rec.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
