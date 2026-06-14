import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';

interface Props {
  symbol: string;
  className?: string;
  size?: number;
}

export default function WatchlistStar({ symbol, className, size = 16 }: Props) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(symbol);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(symbol);
      }}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      className={cn(
        'p-1 rounded-md transition-colors shrink-0',
        watched ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400',
        className,
      )}
    >
      <Star style={{ width: size, height: size }} className={cn(watched && 'fill-current')} />
    </button>
  );
}
