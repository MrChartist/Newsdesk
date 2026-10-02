import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Inbox, Search, X, LayoutGrid, Rows3, ArrowUp, CheckCheck, Copy, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Story, BUCKET_ORDER, timeBucket, coverage } from '@/lib/stories';
import { formatDigest, copyText } from '@/lib/share';
import { useDebounce } from '@/hooks/useDebounce';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useFeedSources } from '@/hooks/useNewsFeed';
import { useReadArticles } from '@/hooks/useReadArticles';
import { toggleBookmark } from '@/hooks/useBookmarks';
import { getCategoryMeta } from '@/data/categories';
import EmptyState from '../ui/EmptyState';
import { SectionHeader } from '../ui/Section';
import NewsCard from './NewsCard';
import NewsRow from './NewsRow';
import NewsCardSkeleton from './NewsCardSkeleton';
import ArticleModal from './ArticleModal';

const PAGE_SIZE = 24;
const GRID = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';
const RANGES = [
  { id: 'any', label: 'Any time', ms: Infinity },
  { id: '1h', label: 'Past hour', ms: 3600_000 },
  { id: '6h', label: 'Past 6 hours', ms: 6 * 3600_000 },
  { id: '24h', label: 'Past 24 hours', ms: 24 * 3600_000 },
  { id: '7d', label: 'Past 7 days', ms: 7 * 86400_000 },
] as const;

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
  /** Story ids already shown elsewhere on the page; hidden while unfiltered */
  excludeIds?: Set<string>;
  /** Hold back newly arrived stories behind a "N new stories" pill */
  live?: boolean;
  /** Enables "Copy digest" with this heading */
  digestTitle?: string;
  emptyTitle?: string;
  emptyHint?: string;
}

export default function NewsStream({
  stories, isLoading, isError, onRetry, title = 'Latest', initialQuery = '', searchQuery, showTopics, excludeIds,
  live = true, digestTitle, emptyTitle = 'No stories found', emptyHint = 'Try a different filter or search term.',
}: Props) {
  const { data: sources } = useFeedSources();
  const { isRead, markManyRead } = useReadArticles();

  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState('');
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('any');
  const [topic, setTopic] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sort, setSort] = useState<'newest' | 'covered'>('newest');
  const [view, setView] = usePersistentState<'cards' | 'list'>('newsdesk:view', 'cards');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(-1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id]) => id);
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
      else if (e.key === 's' && selected >= 0) toggleBookmark(visible[selected].lead);
      else if (e.key === 'm' && selected >= 0) markManyRead([visible[selected].lead.link]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, visible, selected, openAt, markManyRead]);

  const unreadCount = useMemo(() => filtered.filter((s) => !isRead(s.lead.link)).length, [filtered, isRead]);

  const copyDigest = async () => {
    if (await copyText(formatDigest(digestTitle ?? title, filtered))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      <SectionHeader title={title} count={isLoading ? undefined : filtered.length}>
        {digestTitle && filtered.length > 0 && (
          <button onClick={copyDigest} className="btn btn-plain !min-h-9 !px-3 !text-[0.8125rem]" title="Copy the top stories as a Telegram-ready post">
            {copied ? <Check className="h-4 w-4 text-profit" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy digest'}</span>
          </button>
        )}
        {unreadCount > 0 && (
          <button onClick={() => markManyRead(filtered.map((s) => s.lead.link))} className="btn btn-plain !min-h-9 !px-3 !text-[0.8125rem]">
            <CheckCheck className="h-4 w-4" /><span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
      </SectionHeader>

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
        {searchQuery === undefined && <div className="relative min-w-[200px] flex-1">
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
        </div>}
        <select value={source} onChange={(e) => setSource(e.target.value)} className="field !w-auto" aria-label="Source">
          <option value="">All sources</option>
          {(sources ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="field !w-auto" aria-label="Time range">
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field !w-auto" aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="covered">Most covered</option>
        </select>
        <button onClick={() => setUnreadOnly((v) => !v)} aria-pressed={unreadOnly} className={cn('btn', unreadOnly ? 'btn-primary' : 'btn-plain')}>
          <Circle className={cn('h-3 w-3', unreadOnly && 'fill-current')} /> Unread
        </button>
        <div className="segmented" role="group" aria-label="Layout">
          {([['cards', LayoutGrid, 'Cards'], ['list', Rows3, 'List']] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => setView(id)} aria-pressed={view === id} title={label} aria-label={label}
              className={cn('segmented-item !px-2.5', view === id && 'bg-card shadow-1')}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

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


