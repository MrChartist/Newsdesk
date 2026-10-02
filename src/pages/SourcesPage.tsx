import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStories } from '@/hooks/useStories';
import { useFeedSources } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getCategoryMeta } from '@/data/categories';
import { PageHeader } from '@/components/ui/Section';
import TimeAgo from '@/components/news/TimeAgo';

export default function SourcesPage() {
  useDocumentTitle('Sources');
  const { data: sources } = useFeedSources();
  const { data } = useStories();

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
      <PageHeader eyebrow="Where it comes from" title="Sources" subtitle={`${list.length} feeds monitored. Tap one to read only its stories.`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const st = stats.get(s.id);
          const cat = getCategoryMeta(s.category);
          return (
            <Link key={s.id} to={`/source/${s.id}`} className="card card-interactive flex items-center gap-3.5 p-4">
              <span className="squircle !h-10 !w-10 !rounded-[11px] text-sm font-extrabold" style={{ background: s.color }}>{s.name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-bold">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {cat.label}{st?.latest && <> · latest <TimeAgo date={st.latest} className="!text-xs" /></>}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-display text-lg font-extrabold tnum">{st?.today ?? 0}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">today</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
