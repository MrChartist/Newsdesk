import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, CornerDownLeft, Newspaper, Sun, Hash, Building2, Radio, Keyboard, RefreshCw, CheckCheck } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useCompanies, useFeedSources } from '@/hooks/useNewsFeed';
import { setTheme } from '@/hooks/useTheme';
import { setTextSize, TEXT_SIZES } from '@/hooks/useTextSize';
import { markManyReadWithUndo } from '@/hooks/useReadArticles';
import { CATEGORIES } from '@/data/categories';
import { NAV_ITEMS } from './nav';
import { openShortcuts } from './ShortcutsSheet';
import { cn } from '@/lib/utils';

const EVENT = 'newsdesk:palette';
export const openCommandPalette = () => window.dispatchEvent(new Event(EVENT));

const itemClass = 'flex cursor-pointer select-none items-center gap-3 rounded-[12px] px-3 py-2.5 text-[0.9375rem] transition-colors aria-selected:bg-[var(--mat-fill-3)]';

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group heading={heading} className="px-1.5 pb-1 [&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5">
      {children}
    </Command.Group>
  );
}

const Icon = ({ bg, children }: { bg: string; children: React.ReactNode }) => <span className="squircle" style={{ background: bg }}>{children}</span>;

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { stories, data, refetch } = useStories();
  const { names } = useCompanies();
  const companies = useMemo(() => [...names.entries()], [names]);
  const { data: sources } = useFeedSources();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || el?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener(EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(EVENT, onOpen); window.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const q = query.trim().toLowerCase();

  // Companies actually in the news right now, ranked by mentions
  const mentionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stories) for (const c of s.companies) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, [stories]);

  const companyHits = useMemo(() => {
    if (!q) return [];
    return (companies ?? [])
      .filter(([sym, name]) => sym.toLowerCase().includes(q) || name.toLowerCase().includes(q))
      .sort((a, b) => (mentionCounts.get(b[0]) ?? 0) - (mentionCounts.get(a[0]) ?? 0))
      .slice(0, 5);
  }, [q, companies, mentionCounts]);

  const topicHits = q ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 4) : [];
  const sourceHits = q ? (sources ?? []).filter((s) => s.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const pages = NAV_ITEMS.filter((n) => !q || n.label.toLowerCase().includes(q));
  const go = (to: string) => { setOpen(false); navigate(to); };
  const nothing = q && !companyHits.length && !topicHits.length && !sourceHits.length && !pages.length;

  return (
    <Command.Dialog
      open={open} onOpenChange={setOpen} label="Command palette" shouldFilter={false} loop
      overlayClassName="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[3px] animate-fade-in"
      contentClassName={cn('glass-thick fixed left-1/2 top-[max(1rem,10vh)] z-[101] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 animate-fade-up overflow-hidden rounded-[var(--r-xl)] shadow-float')}
    >
      <div className="flex items-center gap-3 border-b border-[var(--mat-separator)] px-5">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <Command.Input value={query} onValueChange={setQuery} placeholder="Search stories, companies, topics, sources…"
          className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-muted-foreground" />
        <kbd className="kbd shrink-0">esc</kbd>
      </div>

      <Command.List className="max-h-[min(26rem,60vh)] overflow-y-auto py-2">
        {nothing && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No matches for “{query}”.</p>}

        {companyHits.length > 0 && (
          <Group heading="Companies">
            {companyHits.map(([sym, name]) => (
              <Command.Item key={sym} value={`co-${sym}`} onSelect={() => go(`/company/${sym}`)} className={itemClass}>
                <Icon bg="#FF9F0A"><Building2 className="h-[15px] w-[15px]" /></Icon>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{name}</span><span className="block text-xs text-muted-foreground">${sym}</span></span>
                <span className="text-xs tnum text-muted-foreground">{mentionCounts.get(sym) ?? 0} stories</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {topicHits.length > 0 && (
          <Group heading="Topics">
            {topicHits.map((c) => (
              <Command.Item key={c.id} value={`topic-${c.id}`} onSelect={() => go(`/topic/${c.id}`)} className={itemClass}>
                <Icon bg={c.color}><Hash className="h-[15px] w-[15px]" /></Icon><span className="flex-1">{c.label}</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {sourceHits.length > 0 && (
          <Group heading="Sources">
            {sourceHits.map((s) => (
              <Command.Item key={s.id} value={`src-${s.id}`} onSelect={() => go(`/source/${s.id}`)} className={itemClass}>
                <Icon bg={s.color}><Radio className="h-[15px] w-[15px]" /></Icon><span className="flex-1">{s.name}</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {q && (
          <Group heading="Stories">
            <Command.Item value="search-news" onSelect={() => go(`/search?q=${encodeURIComponent(query.trim())}`)} className={itemClass}>
              <Icon bg="#0A84FF"><Newspaper className="h-[15px] w-[15px]" /></Icon>
              <span className="flex-1 truncate">Search stories for “{query.trim()}”</span>
              <CornerDownLeft className="h-4 w-4 text-muted-foreground" />
            </Command.Item>
          </Group>
        )}

        {pages.length > 0 && (
          <Group heading="Go to">
            {pages.map((n) => (
              <Command.Item key={n.label} value={`page-${n.label}`} onSelect={() => go(n.path)} className={itemClass}>
                <Icon bg={n.tint}><n.icon className="h-[15px] w-[15px]" strokeWidth={2.4} /></Icon><span className="flex-1">{n.label}</span>
              </Command.Item>
            ))}
          </Group>
        )}

        {!q && (
          <>
            <Group heading="Actions">
              <Command.Item value="refresh" onSelect={() => { refetch(); setOpen(false); }} className={itemClass}>
                <Icon bg="#0A84FF"><RefreshCw className="h-[15px] w-[15px]" /></Icon><span className="flex-1">Refresh news</span>
              </Command.Item>
              <Command.Item value="read-all" onSelect={() => { markManyReadWithUndo((data?.items ?? []).map((i) => i.link)); setOpen(false); }} className={itemClass}>
                <Icon bg="#30D158"><CheckCheck className="h-[15px] w-[15px]" /></Icon><span className="flex-1">Mark everything as read</span>
              </Command.Item>
              <Command.Item value="shortcuts" onSelect={() => { setOpen(false); setTimeout(openShortcuts, 80); }} className={itemClass}>
                <Icon bg="#8E8E93"><Keyboard className="h-[15px] w-[15px]" /></Icon><span className="flex-1">Keyboard shortcuts</span><kbd className="kbd">?</kbd>
              </Command.Item>
            </Group>
            <Group heading="Text size">
              {TEXT_SIZES.map((t) => (
                <Command.Item key={t.id} value={`size-${t.id}`} onSelect={() => { setTextSize(t.id); setOpen(false); }} className={itemClass}>
                  <Icon bg="#8E8E93"><span className="text-[11px] font-extrabold">Aa</span></Icon>
                  <span className="flex-1">{t.label}</span>
                </Command.Item>
              ))}
            </Group>
            <Group heading="Appearance">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Command.Item key={t} value={`theme-${t}`} onSelect={() => { setTheme(t); setOpen(false); }} className={itemClass}>
                  <Icon bg="#8E8E93"><Sun className="h-[15px] w-[15px]" /></Icon>
                  <span className="flex-1 capitalize">{t === 'system' ? 'Match system' : `${t} mode`}</span>
                </Command.Item>
              ))}
            </Group>
          </>
        )}
      </Command.List>

      <div className="flex items-center gap-4 border-t border-[var(--mat-separator)] px-5 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> navigate</span>
        <span className="inline-flex items-center gap-1.5"><kbd className="kbd">↵</kbd> open</span>
        <span className="ml-auto hidden sm:inline">{data ? `${data.count.toLocaleString('en-IN')} stories · ${sources?.length ?? 30}+ sources` : ''}</span>
      </div>
    </Command.Dialog>
  );
}
