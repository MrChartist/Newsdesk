import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedSource } from '@/types/news';
import { useMutedSources } from '@/hooks/useMutedSources';

export const RANGES = [
  { id: 'any', label: 'Any time', ms: Infinity },
  { id: '1h', label: 'Past hour', ms: 3600_000 },
  { id: '6h', label: 'Past 6 hours', ms: 6 * 3600_000 },
  { id: '24h', label: 'Past 24 hours', ms: 24 * 3600_000 },
  { id: '7d', label: 'Past 7 days', ms: 7 * 86400_000 },
] as const;
export type RangeId = (typeof RANGES)[number]['id'];
export type SortId = 'newest' | 'covered';

interface Props {
  sources: FeedSource[];
  source: string; onSource: (v: string) => void;
  range: RangeId; onRange: (v: RangeId) => void;
  sort: SortId; onSort: (v: SortId) => void;
}

const label = 'mb-1.5 block text-xs font-semibold text-muted-foreground';

/** One "Filters" button instead of three always-visible dropdowns. */
export function FilterMenu({ sources, source, onSource, range, onRange, sort, onSort }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { count: mutedCount } = useMutedSources();
  const active = (source ? 1 : 0) + (range !== 'any' ? 1 : 0) + (sort !== 'newest' ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey, true); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog" className={cn('btn', active ? 'btn-tinted' : 'btn-plain')}>
        <SlidersHorizontal className="h-4 w-4" /> Filters
        {active > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground tnum">{active}</span>}
      </button>

      {open && (
        <div role="dialog" aria-label="Filters" className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(20rem,calc(100vw-2rem))] animate-fade-in rounded-[var(--r-lg)] bg-popover p-4 shadow-float ring-1 ring-[var(--mat-hairline)]">
          <div className="space-y-3.5">
            <div>
              <label className={label} htmlFor="f-source">Source</label>
              <select id="f-source" value={source} onChange={(e) => onSource(e.target.value)} className="field">
                <option value="">All sources</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="f-range">Published</label>
              <select id="f-range" value={range} onChange={(e) => onRange(e.target.value as RangeId)} className="field">
                {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <span className={label}>Order by</span>
              <div className="segmented w-full" role="radiogroup" aria-label="Order by">
                {([['newest', 'Newest'], ['covered', 'Most covered']] as const).map(([id, text]) => (
                  <button key={id} role="radio" aria-checked={sort === id} onClick={() => onSort(id)}
                    className={cn('segmented-item flex-1 justify-center', sort === id && 'bg-card shadow-1')}>{text}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--mat-separator)] pt-3 text-xs">
            <Link to="/sources" onClick={() => setOpen(false)} className="font-semibold text-primary">
              {mutedCount ? `${mutedCount} source${mutedCount === 1 ? '' : 's'} muted · Manage` : 'Mute noisy sources'}
            </Link>
            {active > 0 && (
              <button onClick={() => { onSource(''); onRange('any'); onSort('newest'); }} className="font-semibold text-muted-foreground hover:text-foreground">Reset</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Removable chips for whatever filters are on, so nothing is hidden behind a menu. */
export function ActiveFilters({
  sourceName, range, sort, onClearSource, onClearRange, onClearSort,
}: { sourceName?: string; range: RangeId; sort: SortId; onClearSource: () => void; onClearRange: () => void; onClearSort: () => void }) {
  const items = [
    sourceName && { k: 'source', text: sourceName, clear: onClearSource },
    range !== 'any' && { k: 'range', text: RANGES.find((r) => r.id === range)!.label, clear: onClearRange },
    sort !== 'newest' && { k: 'sort', text: 'Most covered first', clear: onClearSort },
  ].filter(Boolean) as { k: string; text: string; clear: () => void }[];
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {items.map((i) => (
        <span key={i.k} className="chip !bg-primary/12 !py-1.5 pl-3 pr-1.5 !text-[0.75rem] !text-primary">
          {i.text}
          <button onClick={i.clear} aria-label={`Remove filter ${i.text}`} className="rounded-full p-0.5 hover:bg-primary/20"><X className="h-3.5 w-3.5" /></button>
        </span>
      ))}
    </div>
  );
}
