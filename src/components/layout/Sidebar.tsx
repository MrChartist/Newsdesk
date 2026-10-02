import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { CATEGORIES } from '@/data/categories';
import { NAV_ITEMS, isActive } from './nav';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';

const SIDEBAR_TOPICS = ['Markets', 'Stocks', 'Corporate', 'Economy', 'IPO', 'Tech', 'AI', 'Geopolitics', 'Defense', 'World'];

/** macOS 26 floating source-list sidebar — Liquid Glass, inset from the window edge. */
export default function Sidebar() {
  const { pathname, search } = useLocation();
  const { count: watchCount } = useWatchlist();
  const { count: savedCount } = useBookmarks();
  const { isFetching, isError, data } = useNewsFeed();

  const badge = (key?: 'watchlist' | 'saved') =>
    key === 'watchlist' ? watchCount : key === 'saved' ? savedCount : 0;

  return (
    <aside
      aria-label="Primary"
      className="glass hidden lg:flex fixed left-3 top-3 bottom-3 z-40 w-[var(--sidebar-w)] flex-col rounded-[var(--r-xl)] overflow-hidden"
    >
      <Link to="/" className="flex items-center gap-3 px-5 pt-5 pb-4">
        <BrandMark size={38} />
        <div className="leading-tight">
          <p className="font-display font-extrabold text-[1.2rem] tracking-tight">Newsdesk</p>
          <p className="brand-serif text-[0.95rem] text-muted-foreground -mt-0.5">by Mr. Chartist</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-5 scrollbar-none">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, pathname, search);
            const n = badge(item.badge);
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className="side-item" aria-current={active ? 'page' : undefined}>
                <span className="squircle" style={{ background: item.tint }}>
                  <Icon className="w-[15px] h-[15px]" strokeWidth={2.4} />
                </span>
                <span className="flex-1">{item.label}</span>
                {n > 0 && <span className="text-xs tnum text-muted-foreground font-semibold">{n}</span>}
              </Link>
            );
          })}
        </div>

        <div>
          <p className="eyebrow px-2.5 pb-1.5">Topics</p>
          <div className="space-y-0.5">
            {SIDEBAR_TOPICS.map((id) => {
              const cat = CATEGORIES.find((c) => c.id === id);
              if (!cat) return null;
              const active = pathname === `/category/${id}`;
              const Icon = cat.icon;
              return (
                <Link key={id} to={`/category/${id}`} className="side-item !py-1.5" aria-current={active ? 'page' : undefined}>
                  <Icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} strokeWidth={2.2} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="px-4 pt-3 pb-4 space-y-3 border-t border-[var(--mat-separator)]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isError ? 'bg-ios-red' : isFetching ? 'bg-ios-orange live-dot' : 'bg-ios-green',
            )}
          />
          <span className="font-medium">
            {isError ? 'Backend offline' : isFetching ? 'Syncing…' : 'Live'}
          </span>
          {data && <span className="ml-auto tnum">{data.count.toLocaleString('en-IN')} stories</span>}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
