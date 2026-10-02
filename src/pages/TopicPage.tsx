import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStories } from '@/hooks/useStories';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getCategoryMeta } from '@/data/categories';
import NewsStream from '@/components/news/NewsStream';
import { PageHeader } from '@/components/ui/Section';

export default function TopicPage() {
  const { id = '' } = useParams();
  const meta = getCategoryMeta(id);
  const Icon = meta.icon;
  useDocumentTitle(meta.label);
  const { stories, isLoading, isError, refetch } = useStories();
  const list = useMemo(() => stories.filter((s) => s.lead.category === id), [stories, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Topic" title={meta.label}
        icon={<span className="squircle !h-14 !w-14 !rounded-2xl" style={{ background: meta.color }}><Icon className="h-7 w-7" strokeWidth={2.2} /></span>}
        subtitle={<span className="tnum">{list.length} stories</span>}
      />
      <NewsStream key={id} stories={list} isLoading={isLoading} isError={isError} onRetry={() => refetch()}
        title={`${meta.label} news`} digestTitle={`${meta.label} — top stories`}
        emptyTitle={`No ${meta.label} stories yet`} emptyHint="Newsdesk archives stories as they arrive — check back shortly." />
    </div>
  );
}
