import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useNewsFeed, useFilteredNews } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import { PageHeader } from '@/components/ui/Section';
import { getCategoryMeta, CATEGORIES } from '@/data/categories';
import type { NewsItem } from '@/types/news';

/** /categories → topic index (iOS Settings-style list). /category/:slug → that topic's feed. */
export default function CategoryPage() {
  const { slug } = useParams();
  const meta = getCategoryMeta(slug || 'General');
  const Icon = meta.icon;
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const { data, isLoading, isError, refetch } = useNewsFeed();
  const filteredItems = useFilteredNews(data?.items, { category: slug ?? '__none__' });
  useDocumentTitle(slug ? meta.label : 'Topics');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    data?.items.forEach((i) => m.set(i.category, (m.get(i.category) ?? 0) + 1));
    return m;
  }, [data]);

  const sortedItems = useMemo(
    () => [...filteredItems].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()),
    [filteredItems],
  );

  if (!slug) {
    const visible = CATEGORIES.filter((c) => (counts.get(c.id) ?? 0) > 0 || !data);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Browse" title="Topics" subtitle="Every story is auto-sorted into a topic as it arrives." />
        <ul className="card divide-y divide-[var(--mat-separator)] overflow-hidden">
          {visible.map((c) => {
            const CIcon = c.icon;
            return (
              <li key={c.id}>
                <Link to={`/category/${c.id}`} className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--mat-fill-1)]">
                  <span className="squircle" style={{ background: c.color }}><CIcon className="h-[15px] w-[15px]" strokeWidth={2.4} /></span>
                  <span className="flex-1 font-medium">{c.label}</span>
                  <span className="text-sm tnum text-muted-foreground">{counts.get(c.id) ?? ''}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Topic"
        title={meta.label}
        subtitle={<span className="tnum">{sortedItems.length} articles</span>}
        icon={
          <span className="squircle !h-14 !w-14 !rounded-2xl" style={{ background: meta.color }}>
            <Icon className="h-7 w-7" strokeWidth={2.2} />
          </span>
        }
      />

      <NewsFeed
        items={sortedItems}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onSelectArticle={setSelectedArticle}
        emptyTitle={`No ${meta.label} articles yet`}
        emptyHint="Newsdesk archives stories as they arrive — check back shortly."
      />

      <ArticleModal item={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
