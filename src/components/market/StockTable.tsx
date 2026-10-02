import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn, formatPrice, formatMarketCap, formatVolume, rangePosition } from '@/lib/utils';
import type { StockData } from '@/types/stock';
import WatchlistStar from './WatchlistStar';
import { ChangePill, RangeBar } from '../ui/Section';

type SortKey = 'symbol' | 'price' | 'change' | 'perfMonth' | 'range' | 'volume' | 'marketCap';

interface Column {
  key: SortKey;
  label: string;
  align: 'left' | 'right';
  className?: string;
}

const COLUMNS: Column[] = [
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'change', label: 'Today', align: 'right' },
  { key: 'perfMonth', label: '1M', align: 'right', className: 'hidden md:table-cell' },
  { key: 'range', label: '52W range', align: 'right', className: 'hidden lg:table-cell' },
  { key: 'volume', label: 'Volume', align: 'right', className: 'hidden xl:table-cell' },
  { key: 'marketCap', label: 'Mkt cap', align: 'right', className: 'hidden sm:table-cell' },
];

interface Props {
  stocks: StockData[];
  showSector?: boolean;
  initialSort?: SortKey;
  initialDir?: 'asc' | 'desc';
}

const sortValue = (s: StockData, key: SortKey): number =>
  key === 'range'
    ? rangePosition(s.price, s.low52W, s.high52W) ?? -Infinity
    : ((s[key as keyof StockData] as number | null) ?? -Infinity);

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
      const av = sortValue(a, sortKey), bv = sortValue(b, sortKey);
      return dir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [stocks, sortKey, dir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setDir(key === 'symbol' ? 'asc' : 'desc'); }
  };

  if (stocks.length === 0) {
    return <div className="card p-12 text-center text-sm text-muted-foreground">No stocks match the current filters.</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--mat-separator)]">
              <th className="w-11 px-2 py-3" />
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                const Arrow = dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={cn('whitespace-nowrap px-3 py-3 text-[0.8125rem] font-semibold', col.align === 'right' ? 'text-right' : 'text-left', col.className)}
                  >
                    <button
                      onClick={() => onSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors',
                        col.align === 'right' && 'flex-row-reverse',
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {col.label}
                      <Arrow className={cn('h-3 w-3 text-primary', !active && 'invisible')} strokeWidth={3} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock) => (
              <tr
                key={stock.symbol}
                onClick={() => navigate(`/company/${stock.symbol}`)}
                className="cursor-pointer border-b border-[var(--mat-separator)] last:border-0 transition-colors hover:bg-[var(--mat-fill-1)]"
              >
                <td className="px-2 py-2 text-center"><WatchlistStar symbol={stock.symbol} size={16} /></td>
                <td className="px-3 py-2.5">
                  <div className="font-bold">{stock.symbol}</div>
                  <div className="max-w-[150px] truncate text-xs text-muted-foreground md:max-w-[240px]">
                    {showSector && stock.sector ? stock.sector : stock.name}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right tnum">{formatPrice(stock.price)}</td>
                <td className="px-3 py-2.5 text-right"><ChangePill value={stock.change} /></td>
                <td className={cn('hidden px-3 py-2.5 text-right font-semibold tnum md:table-cell', (stock.perfMonth ?? 0) >= 0 ? 'text-profit' : 'text-loss')}>
                  {stock.perfMonth != null ? `${stock.perfMonth >= 0 ? '+' : ''}${stock.perfMonth.toFixed(2)}%` : '—'}
                </td>
                <td className="hidden w-40 px-3 py-2.5 lg:table-cell">
                  <RangeBar position={rangePosition(stock.price, stock.low52W, stock.high52W)} />
                </td>
                <td className="hidden px-3 py-2.5 text-right text-muted-foreground tnum xl:table-cell">{formatVolume(stock.volume)}</td>
                <td className="hidden px-3 py-2.5 text-right tnum sm:table-cell">{formatMarketCap(stock.marketCap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
