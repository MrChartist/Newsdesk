import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn, compact } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useStories } from '@/hooks/useStories';
import { useReadArticles } from '@/hooks/useReadArticles';
import { getCategoryMeta } from '@/data/categories';
import { NAV_ITEMS, isActive } from './nav';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';
import TextSizeToggle from './TextSizeToggle';

/** macOS 26 floating source-list sidebar — Liquid Glass, inset from the window edge. */
export default function Sidebar() {
  const { pathname } = useLocation();
  const { count: savedCount } = useBookmarks();
  const { stories, isFetching, isError } = useStories();
  const { isRead } = useReadArticles();

  // Top stocks mentioned in active news
  const topStocks = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stories) for (const c of s.companies) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [stories]);

  // Topics ranked by 24h volume, with unread counts
  const topics = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    const m = new Map<string, { total: number; unread: number }>();
    for (const s of stories) {
      if (s.time < cutoff) continue;
      const e = m.get(s.lead.category) ?? { total: 0, unread: 0 };
      e.total++;
      if (!isRead(s.lead.link)) e.unread++;
      m.set(s.lead.category, e);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 8);
  }, [stories, isRead]);

  return (
    <aside aria-label="Primary" className="glass fixed bottom-3 left-3 top-3 z-40 hidden w-[var(--sidebar-w)] flex-col overflow-hidden rounded-[var(--r-xl)] lg:flex">
      <Link to="/" className="flex flex-col gap-2.5 px-5 pb-3.5 pt-5 border-b border-[var(--mat-separator)]/60">
        <div className="flex items-center gap-3">
          <BrandMark size={36} />
          <div className="leading-tight">
            <p className="font-display text-[1.2rem] font-extrabold tracking-tight">Newsdesk</p>
            <p className="brand-serif -mt-0.5 text-[0.85rem] text-muted-foreground font-medium">by Mr. Chartist</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Open Source · Non-Commercial
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-3 pt-1 scrollbar-none">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className="side-item" aria-current={active ? 'page' : undefined}>
                <span className="squircle" style={{ background: item.tint }}><Icon className="h-[15px] w-[15px]" strokeWidth={2.4} /></span>
                <span className="flex-1">{item.label}</span>
                {item.badge === 'saved' && savedCount > 0 && <span className="text-xs font-semibold tnum text-muted-foreground">{savedCount}</span>}
              </Link>
            );
          })}
        </div>

        {topics.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between px-2.5 pb-1.5">
              <p className="eyebrow">Topics · 24h</p>
              <Link to="/topics" className="text-xs font-semibold text-primary">All</Link>
            </div>
            <div className="space-y-0.5">
              {topics.map(([id, { unread }]) => {
                const cat = getCategoryMeta(id);
                const Icon = cat.icon;
                const active = pathname === `/topic/${id}`;
                return (
                  <Link key={id} to={`/topic/${id}`} className="side-item !py-1.5" aria-current={active ? 'page' : undefined}>
                    <Icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} strokeWidth={2.2} />
                    <span className="flex-1 truncate">{cat.label}</span>
                    {unread > 0 && <span className="text-xs font-semibold tnum text-muted-foreground">{compact(unread)}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {topStocks.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between px-2.5 pb-1.5">
              <p className="eyebrow">Stocks in News</p>
              <Link to="/stocks" className="text-xs font-semibold text-primary">All</Link>
            </div>
            <div className="space-y-0.5">
              {topStocks.map(([sym, count]) => {
                const active = pathname === `/company/${sym}`;
                return (
                  <Link key={sym} to={`/company/${sym}`} className="side-item !py-1.5" aria-current={active ? 'page' : undefined}>
                    <span className="font-extrabold text-xs flex-1 truncate">{sym}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground tnum">{count} {count === 1 ? 'story' : 'stories'}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="space-y-3 border-t border-[var(--mat-separator)] px-4 pb-4 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('h-2 w-2 rounded-full', isError ? 'bg-ios-red' : isFetching ? 'bg-ios-orange live-dot' : 'bg-ios-green')} />
          <span className="font-medium">{isError ? 'Backend offline' : isFetching ? 'Syncing…' : 'Live'}</span>
        </div>
        <ThemeToggle />
        <TextSizeToggle />
      </div>
    </aside>
  );
}
