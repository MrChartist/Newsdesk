import { Link } from 'react-router-dom';
import { useCompanies } from '@/hooks/useNewsFeed';
import { cn } from '@/lib/utils';

/** $SYMBOL chip → that company's news. */
export default function CompanyMentionTag({ symbol, className, count }: { symbol: string; className?: string; count?: number }) {
  const { nameOf } = useCompanies();
  return (
    <Link
      to={`/company/${symbol}`}
      onClick={(e) => e.stopPropagation()}
      title={`News about ${nameOf(symbol)}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-[var(--mat-fill-2)] px-2.5 py-1 text-[11px] font-bold leading-none transition-colors hover:bg-primary/15 hover:text-primary',
        className,
      )}
    >
      ${symbol}
      {count != null && <span className="font-semibold text-muted-foreground tnum">{count}</span>}
    </Link>
  );
}
