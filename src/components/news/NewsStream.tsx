import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Inbox, Search, X, LayoutGrid, Rows3, ArrowUp, CheckCheck, Copy, MoreHorizontal, PartyPopper } from 'lucide-react';
import { usePopover } from '@/hooks/usePopover';
import { cn } from '@/lib/utils';
import { type Story, BUCKET_ORDER, timeBucket, coverage } from '@/lib/stories';
import { formatDigest, copyText } from '@/lib/share';
import { useDebounce } from '@/hooks/useDebounce';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useFeedSources } from '@/hooks/useNewsFeed';
import { useReadArticles } from '@/hooks/useReadArticles';
import { toggleBookmarkWithToast } from '@/hooks/useBookmarks';
import { toast } from '@/lib/toast';
import { FilterMenu, ActiveFilters, RANGES, type RangeId, type SortId } from './FilterMenu';
import { getCategoryMeta } from '@/data/categories';
import EmptyState from '../ui/EmptyState';
import { SectionHeader } from '../ui/Section';
import NewsCard from './NewsCard';
import NewsRow from './NewsRow';
import NewsCardSkeleton from './NewsCardSkeleton';
import ArticleModal from './ArticleModal';

const PAGE_SIZE = 24;
const GRID = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';

interface Props {
  stories: Story[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Heading above the controls */
  title?: string;
  /** Start with this filter text */
  initialQuery?: string;
  /** Externally controlled search text — hides the built-in filter field */
  searchQuery?: string;
  /** Show topic tabs derived from the stories */
  showTopics?: boolean;
  /** Story ids already shown elsewhere on the page; hidden from the list */
  excludeIds?: Set<string>;
  /** Stories shown elsewhere on the page that "Mark all read" should include */
  alsoMark?: Story[];
  /** Hold back newly arrived stories behind a "N new stories" pill */
  live?: boolean;
  /** Enables "Copy digest" with this heading */
  digestTitle?: string;
  emptyTitle?: string;
  emptyHint?: string;
}

export default function NewsStream({
  stories, isLoading, isError, onRetry, title = 'Latest', initialQuery = '', searchQuery, showTopics, excludeIds, alsoMark,
  live = true, digestTitle, emptyTitle = 'No stories found', emptyHint = 'Try a different filter or search term.',
}: Props) {
  const { data: sources } = useFeedSources();
  const { isRead, markManyRead, markManyReadWithUndo } = useReadArticles();

  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState('');
  const [range, setRange] = useState<RangeId>('any');
  const [topic, setTopic] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sort, setSort] = useState<SortId>('newest');
  const [view, setView] = usePersistentState<'cards' | 'list'>('newsdesk:view', 'list');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(-1);
  const [openId, setOpenId] = useState<string | null>(null);
  const debounced = useDebounce(searchQuery ?? query, 200);
  const sentinel = useRef<HTMLDivElement>(null);

  // ── Hold back new arrivals so the list never jumps under the reader ──
  const [snapshot, setSnapshot] = useState<Story[]>(stories);
  useEffect(() => { if (!live || (snapshot.length === 0 && stories.length > 0)) setSnapshot(stories); }, [stories, live]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = live ? snapshot : stories;
  const fresh = useMemo(() => {
    if (!live || !snapshot.length) return 0;
    const ids = new Set(snapshot.map((s) => s.id));
    return stories.filter((s) => !ids.has(s.id)).length;
  }, [stories, snapshot, live]);

  const topics = useMemo(() => {
    const m = new Map<string, number>();
    shown.forEach((s) => m.set(s.lead.category, (m.get(s.lead.category) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id);
  }, [shown]);

  const filtering = Boolean(debounced.trim() || source || topic || unreadOnly || range !== 'any');

  // Frozen when "Unread" is switched on, so a story doesn't vanish the moment you open it
  const unreadIds = useMemo(
    () => (unreadOnly ? new Set(shown.filter((s) => !isRead(s.lead.link)).map((s) => s.id)) : null),
    [unreadOnly, shown], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const cutoff = Date.now() - RANGES.find((r) => r.id === range)!.ms;
    const out = shown.filter((s) => {
      if (!q && excludeIds?.has(s.id)) return false; // already shown above, unless the user is searching
      if (topic && s.lead.category !== topic) return false;
      if (source && !s.items.some((i) => i.source.id === source)) return false;
      if (s.time < cutoff) return false;
      if (unreadIds && !unreadIds.has(s.id)) return false;
      if (q) {
        const hay = s.items.map((i) => `${i.title} ${i.description} ${i.companies.join(' ')}`).join(' ').toLowerCase();
        if (!q.split(/\s+/).every((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay))) return false;
      }
      return true;
    });
    if (sort === 'covered') out.sort((a, b) => coverage(b) - coverage(a) || b.time - a.time);
    else out.sort((a, b) => b.time - a.time);
    return out;
  }, [shown, debounced, source, topic, range, unreadIds, sort, excludeIds]);

  useEffect(() => { setPage(1); setSelected(-1); }, [debounced, source, topic, range, unreadOnly, sort]);

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((e) => e[0].isIntersecting && setPage((p) => p + 1), { rootMargin: '700px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible.length]);

  // ── Groups (by recency bucket) ──
  const groups = useMemo(() => {
    if (sort !== 'newest') return [{ label: null as string | null, items: visible.map((s, i) => ({ s, i })) }];
    const map = new Map<string, { s: Story; i: number }[]>();
    visible.forEach((s, i) => {
      const b = timeBucket(s.time);
      (map.get(b) ?? map.set(b, []).get(b)!).push({ s, i });
    });
    return BUCKET_ORDER.filter((b) => map.has(b)).map((b) => ({ label: b as string | null, items: map.get(b)! }));
  }, [visible, sort]);

  // ── Reader navigation ──
  const openIndex = openId ? visible.findIndex((s) => s.id === openId) : -1;
  const openStory = openIndex >= 0 ? visible[openIndex] : (openId ? shown.find((s) => s.id === openId) ?? null : null);
  const openAt = useCallback((i: number) => {
    const s = visible[i];
    if (!s) return;
    markManyRead([s.lead.link]);
    setSelected(i);
    setOpenId(s.id);
  }, [visible, markManyRead]);
  const onOpen = useCallback((s: Story) => {
    setOpenId(s.id);
    const i = visible.findIndex((v) => v.id === s.id);
    if (i >= 0) setSelected(i);
  }, [visible]);

  // ── Keyboard: j/k move, o/Enter open, s save, m mark read ──
  useEffect(() => {
    if (openId) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      const move = (d: number) => {
        e.preventDefault();
        setSelected((cur) => {
          const next = Math.max(0, Math.min(visible.length - 1, cur + d));
          document.getElementById(`story-${next}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return next;
        });
      };
      if (e.key === 'j') move(1);
      else if (e.key === 'k') move(-1);
      else if (selected >= 0 && (e.key === 'o' || (e.key === 'Enter' && !['ARTICLE', 'BUTTON', 'A'].includes(el.tagName)))) { e.preventDefault(); openAt(selected); }
      else if (e.key === 's' && selected >= 0) toggleBookmarkWithToast(visible[selected].lead);
      else if (e.key === 'm' && selected >= 0) { markManyRead([visible[selected].lead.link]); toast('Marked as read'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, visible, selected, openAt, markManyRead]);

  const toMark = useMemo(() => [...filtered, ...(alsoMark ?? [])], [filtered, alsoMark]);
  const unreadCount = useMemo(() => toMark.filter((s) => !isRead(s.lead.link)).length, [toMark, isRead]);

  const copyDigest = async () => {
    toast((await copyText(formatDigest(digestTitle ?? title, filtered))) ? 'Digest copied for Telegram' : 'Couldn’t copy — allow clipboard access');
  };

  const applyFresh = () => { setSnapshot(stories); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Render ──
  const body = (() => {
    if (isLoading) return <div className={GRID}>{Array.from({ length: 9 }).map((_, i) => <NewsCardSkeleton key={i} />)}</div>;
    if (isError) {
      return (
        <EmptyState icon={AlertTriangle} tone="error" title="Couldn’t load the news"
          hint="The Newsdesk backend isn’t reachable. Make sure the server is running on port 3001."
          action={onRetry && <button onClick={onRetry} className="btn btn-primary"><RefreshCw className="h-4 w-4" /> Try again</button>} />
      );
    }
    if (!filtered.length && unreadOnly && !debounced.trim()) {
      return <EmptyState icon={PartyPopper} title="You’re all caught up" hint="Nothing unread here. Turn off “Unread” to see everything again." action={<button className="btn btn-plain" onClick={() => setUnreadOnly(false)}>Show all stories</button>} />;
    }
    if (!filtered.length) {
      return (
        <EmptyState icon={Inbox} title={emptyTitle} hint={emptyHint}
          action={filtering && (
            <button className="btn btn-plain" onClick={() => { setQuery(''); setSource(''); setTopic(null); setRange('any'); setUnreadOnly(false); }}>
              Clear filters
            </button>
          )} />
      );
    }
    return (
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.label ?? 'all'}>
            {g.label && (
              <h3 className="sticky top-[calc(var(--toolbar-h)+var(--safe-t))] z-10 -mx-1 mb-3 px-1 py-1.5">
                <span className="glass-thick inline-block rounded-full px-3 py-1 text-xs font-bold text-muted-foreground shadow-1">{g.label}</span>
              </h3>
            )}
            {view === 'cards' ? (
              <div className={GRID}>
                {g.items.map(({ s, i }) => (
                  <NewsCard key={s.id} story={s} query={debounced} selected={i === selected} domId={`story-${i}`} onOpen={onOpen} />
                ))}
              </div>
            ) : (
              <div className="card divide-y divide-[var(--mat-separator)] overflow-hidden">
                {g.items.map(({ s, i }) => (
                  <NewsRow key={s.id} story={s} query={debounced} selected={i === selected} domId={`story-${i}`} onOpen={onOpen} />
                ))}
              </div>
            )}
          </div>
        ))}
        {hasMore && (
          <div ref={sentinel} className="flex justify-center pt-2">
            <button onClick={() => setPage((p) => p + 1)} className="btn btn-plain">
              Show more · {filtered.length - visible.length} remaining
            </button>
          </div>
        )}
      </div>
    );
  })();

  return (
    <section aria-label={title} className="relative space-y-4">
      <SectionHeader title={title} count={isLoading ? undefined : filtered.length} />

      {showTopics && topics.length > 1 && (
        <div className="-mx-4 overflow-x-auto px-4 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
          <div className="segmented" role="tablist" aria-label="Topics">
            {[null, ...topics].map((id) => {
              const active = topic === id;
              const meta = id ? getCategoryMeta(id) : null;
              const Icon = meta?.icon;
              return (
                <button key={id ?? 'all'} role="tab" aria-selected={active} onClick={() => setTopic(id)} className="segmented-item">
                  {active && (
                    <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-card shadow-1"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  {Icon && <Icon className="relative h-3.5 w-3.5" style={active ? { color: meta!.color } : undefined} />}
                  <span className="relative">{id ? meta!.label : 'All'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {searchQuery === undefined && (
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter these stories" aria-label="Filter stories"
              className="field !pl-10 !pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Clear filter">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="segmented" role="radiogroup" aria-label="Show">
          {([[false, 'All'], [true, 'Unread']] as const).map(([val, text]) => (
            <button key={text} role="radio" aria-checked={unreadOnly === val} onClick={() => setUnreadOnly(val)}
              className={cn('segmented-item', unreadOnly === val && 'bg-card shadow-1')}>{text}</button>
          ))}
        </div>

        <FilterMenu sources={sources ?? []} source={source} onSource={setSource} range={range} onRange={setRange} sort={sort} onSort={setSort} />

        <div className="segmented" role="group" aria-label="Layout">
          {([['list', Rows3, 'List'], ['cards', LayoutGrid, 'Cards']] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => setView(id)} aria-pressed={view === id} title={label} aria-label={label}
              className={cn('segmented-item !px-2.5', view === id && 'bg-card shadow-1')}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <MoreMenu
          canMark={unreadCount > 0}
          canCopy={Boolean(digestTitle) && filtered.length > 0}
          onMark={() => markManyReadWithUndo(toMark.map((s) => s.lead.link))}
          onCopy={copyDigest}
        />
      </div>

      <ActiveFilters sourceName={sources?.find((x) => x.id === source)?.name} range={range} sort={sort}
        onClearSource={() => setSource('')} onClearRange={() => setRange('any')} onClearSort={() => setSort('newest')} />

      <AnimatePresence>
        {fresh > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={applyFresh}
            className="btn btn-primary fixed left-1/2 top-[calc(var(--toolbar-h)+var(--safe-t)+12px)] z-40 -translate-x-1/2 shadow-float lg:ml-[calc(var(--sidebar-w)/2+0.75rem)]"
          >
            <ArrowUp className="h-4 w-4" /> {fresh} new {fresh === 1 ? 'story' : 'stories'}
          </motion.button>
        )}
      </AnimatePresence>

      {body}

      <ArticleModal
        story={openStory}
        onClose={() => setOpenId(null)}
        onPrev={openIndex > 0 ? () => openAt(openIndex - 1) : undefined}
        onNext={openIndex >= 0 && openIndex < visible.length - 1 ? () => openAt(openIndex + 1) : undefined}
      />
    </section>
  );
}

/** Rare actions live here so the main row stays calm. */
function MoreMenu({ canMark, canCopy, onMark, onCopy }: { canMark: boolean; canCopy: boolean; onMark: () => void; onCopy: () => void }) {
  const { open, setOpen, ref } = usePopover();
  if (!canMark && !canCopy) return null;
  const item = 'flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--mat-fill-2)]';
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" aria-label="More actions" title="More" className="icon-btn !h-10 !w-10 bg-[var(--mat-fill-2)] text-foreground">
        <MoreHorizontal className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-30 w-60 animate-fade-in rounded-[var(--r-md)] bg-popover p-1.5 shadow-float ring-1 ring-[var(--mat-hairline)]">
          {canMark && <button role="menuitem" className={item} onClick={() => { setOpen(false); onMark(); }}><CheckCheck className="h-4 w-4 text-muted-foreground" /> Mark all as read</button>}
          {canCopy && <button role="menuitem" className={item} onClick={() => { setOpen(false); onCopy(); }}><Copy className="h-4 w-4 text-muted-foreground" /> Copy as Telegram digest</button>}
        </div>
      )}
    </div>
  );
}
