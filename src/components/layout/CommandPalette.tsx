import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, CornerDownLeft, Newspaper, Sun, Layers, TrendingUp, TrendingDown, Hash } from 'lucide-react';
import { useStocks } from '@/hooks/useStockData';
import { useSectors } from '@/hooks/useStockData';
import { setTheme } from '@/hooks/useTheme';
import { CATEGORIES } from '@/data/categories';
import { NAV_ITEMS } from './nav';
import { cn, formatChange, formatPrice } from '@/lib/utils';

const EVENT = 'newsdesk:palette';
export const openCommandPalette = () => window.dispatchEvent(new Event(EVENT));

const itemClass =
  'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[0.9375rem] cursor-pointer select-none ' +
  'aria-selected:bg-[var(--mat-fill-3)] transition-colors';

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="px-1.5 pb-1 [&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5"
    >
      {children}
    </Command.Group>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: stockData } = useStocks();
  const { data: sectors } = useSectors();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(EVENT, onOpen); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const q = query.trim().toLowerCase();

  const stocks = useMemo(() => {
    if (!q || !stockData?.stocks) return [];
    const all = Object.values(stockData.stocks);
    const score = (s: (typeof all)[number]) =>
      s.symbol.toLowerCase() === q ? 0 : s.symbol.toLowerCase().startsWith(q) ? 1 :
      s.name?.toLowerCase().startsWith(q) ? 2 : s.symbol.toLowerCase().includes(q) ? 3 :
      s.name?.toLowerCase().includes(q) ? 4 : s.sector?.toLowerCase().includes(q) ? 5 : 99;
    return all.map((s) => [score(s), s] as const).filter(([n]) => n < 99)
      .sort((a, b) => a[0] - b[0] || (b[1].marketCap || 0) - (a[1].marketCap || 0))
      .slice(0, 7).map(([, s]) => s);
  }, [q, stockData]);

  const pages = NAV_ITEMS.filter((n) => !q || n.label.toLowerCase().includes(q));
  const topics = q ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 5) : [];
  const sectorHits = q ? (sectors ?? []).filter((s) => s.sector.toLowerCase().includes(q)).slice(0, 4) : [];

  const go = (to: string) => { setOpen(false); navigate(to); };
  const nothing = q && !stocks.length && !pages.length && !topics.length && !sectorHits.length;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      shouldFilter={false}
      loop
      overlayClassName="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[3px] animate-fade-in"
      contentClassName={cn(
        'glass-thick fixed z-[101] left-1/2 -translate-x-1/2 top-[max(1rem,10vh)] w-[min(40rem,calc(100vw-1.5rem))]',
        'rounded-[var(--r-xl)] shadow-float overflow-hidden animate-fade-up',
      )}
    >
      <div className="flex items-center gap-3 px-5 border-b border-[var(--mat-separator)]">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search stocks, news, sectors, topics…"
          className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-muted-foreground"
        />
        <kbd className="kbd shrink-0">esc</kbd>
      </div>

      <Command.List className="max-h-[min(26rem,60vh)] overflow-y-auto py-2">
        {nothing && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No matches for “{query}”.</p>
        )}

        {stocks.length > 0 && (
          <Group heading="Stocks">
            {stocks.map((s) => {
              const up = (s.change ?? 0) >= 0;
              return (
                <Command.Item key={s.symbol} value={`stock-${s.symbol}`} onSelect={() => go(`/company/${s.symbol}`)} className={itemClass}>
                  <span className="squircle" style={{ background: up ? '#30D158' : '#FF453A' }}>
                    {up ? <TrendingUp className="w-[15px] h-[15px]" /> : <TrendingDown className="w-[15px] h-[15px]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold truncate">{s.symbol}</span>
                    <span className="block text-xs text-muted-foreground truncate">{s.name}</span>
                  </span>
                  <span className="text-right shrink-0 tnum">
                    <span className="block text-sm">{formatPrice(s.price)}</span>
                    <span className={cn('block text-xs font-semibold', up ? 'text-profit' : 'text-loss')}>{formatChange(s.change)}</span>
                  </span>
                </Command.Item>
              );
            })}
          </Group>
        )}

        {q && (
          <Group heading="News">
            <Command.Item value="search-news" onSelect={() => go(`/?q=${encodeURIComponent(query.trim())}`)} className={itemClass}>
              <span className="squircle" style={{ background: '#0A84FF' }}><Newspaper className="w-[15px] h-[15px]" /></span>
              <span className="flex-1 truncate">Search headlines for “{query.trim()}”</span>
              <CornerDownLeft className="w-4 h-4 text-muted-foreground" />
            </Command.Item>
          </Group>
        )}

        {sectorHits.length > 0 && (
          <Group heading="Sectors">
            {sectorHits.map((s) => (
              <Command.Item key={s.sector} value={`sector-${s.sector}`} onSelect={() => go(`/sector/${encodeURIComponent(s.sector)}`)} className={itemClass}>
                <span className="squircle" style={{ background: '#BF5AF2' }}><Layers className="w-[15px] h-[15px]" /></span>
                <span className="flex-1 truncate">{s.sector}</span>
                <span className={cn('text-xs font-semibold tnum', s.avgChange >= 0 ? 'text-profit' : 'text-loss')}>{formatChange(s.avgChange)}</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {topics.length > 0 && (
          <Group heading="Topics">
            {topics.map((c) => (
              <Command.Item key={c.id} value={`topic-${c.id}`} onSelect={() => go(`/category/${c.id}`)} className={itemClass}>
                <span className="squircle" style={{ background: c.color }}><Hash className="w-[15px] h-[15px]" /></span>
                <span className="flex-1">{c.label}</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {pages.length > 0 && (
          <Group heading="Go to">
            {pages.map((n) => {
              const Icon = n.icon;
              return (
                <Command.Item key={n.label} value={`page-${n.label}`} onSelect={() => go(n.path)} className={itemClass}>
                  <span className="squircle" style={{ background: n.tint }}><Icon className="w-[15px] h-[15px]" strokeWidth={2.4} /></span>
                  <span className="flex-1">{n.label}</span>
                </Command.Item>
              );
            })}
          </Group>
        )}

        {!q && (
          <Group heading="Appearance">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <Command.Item key={t} value={`theme-${t}`} onSelect={() => { setTheme(t); setOpen(false); }} className={itemClass}>
                <span className="squircle" style={{ background: '#8E8E93' }}><Sun className="w-[15px] h-[15px]" /></span>
                <span className="flex-1 capitalize">{t === 'system' ? 'Match system' : `${t} mode`}</span>
              </Command.Item>
            ))}
          </Group>
        )}
      </Command.List>

      <div className="flex items-center gap-4 border-t border-[var(--mat-separator)] px-5 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> navigate</span>
        <span className="inline-flex items-center gap-1.5"><kbd className="kbd">↵</kbd> open</span>
        <span className="ml-auto hidden sm:inline">Prices via TradingView · News via 30+ sources</span>
      </div>
    </Command.Dialog>
  );
}
