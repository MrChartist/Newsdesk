import { Link, useLocation } from 'react-router-dom';
import { Home, LineChart, Layers, Star, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';

const ITEMS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Markets', path: '/markets', icon: LineChart },
  { name: 'Sectors', path: '/sectors', icon: Layers },
  { name: 'Watch', path: '/watchlist', icon: Star, watchlist: true },
  { name: 'Topics', path: '/categories', icon: LayoutGrid },
];

export default function MobileNav() {
  const location = useLocation();
  const { count } = useWatchlist();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-background/90 backdrop-blur-lg">
      <div className="flex items-stretch justify-around">
        {ITEMS.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {item.watchlist && count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-amber-400 text-black text-[8px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
