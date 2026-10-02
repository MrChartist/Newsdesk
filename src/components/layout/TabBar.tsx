import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { TAB_ITEMS, isActive } from './nav';

/** iOS 26 floating glass tab bar — a capsule inset from the screen edge. */
export default function TabBar() {
  const { pathname, search } = useLocation();
  const { count } = useWatchlist();

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(var(--safe-b) + 10px)' }}
    >
      <div className="glass !bg-[var(--mat-glass-strong)] pointer-events-auto flex w-full max-w-md items-stretch gap-0.5 rounded-full p-1.5 shadow-float">
        {TAB_ITEMS.map((item) => {
          const active = isActive(item, pathname, search);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="tab-capsule"
                  className="absolute inset-0 rounded-full bg-[var(--mat-fill-3)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
                {item.badge === 'watchlist' && count > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-ios-red text-white text-[9px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </span>
              <span className="relative">{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
