import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { NAV_ITEMS, SEARCH_ITEM, isActive } from './nav';

/** iOS 26 floating tab bar: a glass capsule of tabs plus a separate round Search button. */
export default function TabBar() {
  const { pathname } = useLocation();
  const { count } = useBookmarks();
  const searchActive = pathname.startsWith('/search');

  return (
    <nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center gap-2.5 px-4 lg:hidden" style={{ paddingBottom: 'calc(var(--safe-b) + 10px)' }}>
      <div className="glass pointer-events-auto flex flex-1 max-w-sm items-stretch gap-0.5 rounded-full p-1.5 shadow-float !bg-[var(--mat-glass-strong)]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.path} aria-current={active ? 'page' : undefined}
              className={cn('relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-colors', active ? 'text-primary' : 'text-muted-foreground')}>
              {active && (
                <motion.span layoutId="tab-capsule" className="absolute inset-0 rounded-full bg-[var(--mat-fill-3)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                {item.badge === 'saved' && count > 0 && (
                  <span className="absolute -right-2.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ios-orange px-1 text-[9px] font-bold leading-none text-white">{count}</span>
                )}
              </span>
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <Link to="/search" aria-label="Search"
        className={cn('glass pointer-events-auto flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full shadow-float !bg-[var(--mat-glass-strong)]', searchActive ? 'text-primary' : 'text-foreground')}>
        <SEARCH_ITEM.icon className="h-[22px] w-[22px]" strokeWidth={searchActive ? 2.6 : 2.1} />
      </Link>
    </nav>
  );
}
