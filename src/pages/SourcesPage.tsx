import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { useMutedSources } from '@/hooks/useMutedSources';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useFeedSources, useNewsFeed } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getCategoryMeta } from '@/data/categories';
import { PageHeader } from '@/components/ui/Section';
import TimeAgo from '@/components/news/TimeAgo';

export default function SourcesPage() {
  useDocumentTitle('Sources');
  const { data: sources } = useFeedSources();
  const { data } = useNewsFeed();
  const { isMuted, count: mutedCount, setMuted } = useMutedSources();

  const stats = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    const m = new Map<string, { today: number; total: number; latest: string | null }>();
    for (const i of data?.items ?? []) {
      const e = m.get(i.source.id) ?? { today: 0, total: 0, latest: null };
      e.total++;
      if (+new Date(i.pubDate) >= cutoff) e.today++;
      if (!e.latest || i.pubDate > e.latest) e.latest = i.pubDate;
      m.set(i.source.id, e);
    }
    return m;
  }, [data]);

  const list = useMemo(
    () => [...(sources ?? [])].sort((a, b) => (stats.get(b.id)?.today ?? 0) - (stats.get(a.id)?.today ?? 0)),
    [sources, stats],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Where it comes from" title="Sources" subtitle={`${list.length} feeds monitored${mutedCount ? `, ${mutedCount} muted` : ''}. Open one to read only its stories, or mute a noisy one to hide it everywhere.`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const st = stats.get(s.id);
          const cat = getCategoryMeta(s.category);
          const muted = isMuted(s.id);
          return (
            <div key={s.id} className={cn('card flex items-center gap-1 p-1.5 transition-opacity', muted && 'opacity-60')}>
              <Link to={`/source/${s.id}`} className="card-interactive-row flex min-w-0 flex-1 items-center gap-3.5 rounded-[var(--r-md)] p-2.5 transition-colors hover:bg-[var(--mat-fill-1)]">
                <span className="squircle !h-10 !w-10 !rounded-[11px] text-sm font-extrabold" style={{ background: s.color }}>{s.name.slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-bold">{s.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {muted ? 'Muted — hidden from all lists' : <>{cat.label}{st?.latest && <> · latest <TimeAgo date={st.latest} className="!text-xs" /></>}</>}
                  </span>
                </span>
                {!muted && (
                  <span className="text-right">
                    <span className="block font-display text-lg font-extrabold tnum">{st?.today ?? 0}</span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">today</span>
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  setMuted(s.id, !muted);
                  toast(muted ? `${s.name} unmuted` : `${s.name} muted`, { label: 'Undo', run: () => setMuted(s.id, muted) });
                }}
                aria-pressed={muted}
                aria-label={muted ? `Unmute ${s.name}` : `Mute ${s.name}`}
                title={muted ? 'Unmute' : 'Mute this source'}
                className={cn('icon-btn mr-1 shrink-0', muted && '!bg-ios-orange/15 !text-ios-orange')}
              >
                {muted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
