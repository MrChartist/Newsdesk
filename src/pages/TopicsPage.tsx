import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useReadArticles } from '@/hooks/useReadArticles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getCategoryMeta } from '@/data/categories';
import { PageHeader } from '@/components/ui/Section';

export default function TopicsPage() {
  useDocumentTitle('Topics');
  const { stories, isLoading } = useStories();
  const { isRead } = useReadArticles();

  const rows = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    const m = new Map<string, { total: number; today: number; unread: number }>();
    for (const s of stories) {
      const e = m.get(s.lead.category) ?? { total: 0, today: 0, unread: 0 };
      e.total++;
      if (s.time >= cutoff) { e.today++; if (!isRead(s.lead.link)) e.unread++; }
      m.set(s.lead.category, e);
    }
    return [...m.entries()].sort((a, b) => b[1].today - a[1].today || b[1].total - a[1].total);
  }, [stories, isRead]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Browse" title="Topics" subtitle="Every story is sorted into a topic the moment it arrives." />
      {isLoading ? (
        <div className="card space-y-3 p-5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
      ) : (
        <ul className="card divide-y divide-[var(--mat-separator)] overflow-hidden">
          {rows.map(([id, n]) => {
            const c = getCategoryMeta(id);
            const Icon = c.icon;
            return (
              <li key={id}>
                <Link to={`/topic/${id}`} className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--mat-fill-1)]">
                  <span className="squircle" style={{ background: c.color }}><Icon className="h-[15px] w-[15px]" strokeWidth={2.4} /></span>
                  <span className="flex-1">
                    <span className="block font-semibold">{c.label}</span>
                    <span className="block text-xs text-muted-foreground tnum">{n.today} today · {n.total} total</span>
                  </span>
                  {n.unread > 0 && <span className="chip !bg-primary/15 !text-primary tnum">{n.unread} unread</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
