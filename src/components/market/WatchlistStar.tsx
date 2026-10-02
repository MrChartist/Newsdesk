import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';

interface Props {
  symbol: string;
  className?: string;
  size?: number;
}

export default function WatchlistStar({ symbol, className, size = 18 }: Props) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(symbol);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(symbol); }}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      aria-pressed={watched}
      className={cn(
        'shrink-0 rounded-full p-1.5 transition-all active:scale-90',
        watched ? 'text-ios-yellow' : 'text-muted-foreground/70 hover:text-ios-yellow',
        className,
      )}
    >
      <Star style={{ width: size, height: size }} className={cn(watched && 'fill-current')} />
    </button>
  );
}
