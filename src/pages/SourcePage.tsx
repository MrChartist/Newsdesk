import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStories } from '@/hooks/useStories';
import { useFeedSources } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NewsStream from '@/components/news/NewsStream';
import { PageHeader } from '@/components/ui/Section';

export default function SourcePage() {
  const { id = '' } = useParams();
  const { data: sources } = useFeedSources();
  const source = sources?.find((s) => s.id === id);
  useDocumentTitle(source?.name);
  const { stories, isLoading, isError, refetch } = useStories();
  const list = useMemo(() => stories.filter((s) => s.items.some((i) => i.source.id === id)), [stories, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Source" title={source?.name ?? id}
        icon={source && <span className="squircle !h-14 !w-14 !rounded-2xl text-xl font-extrabold" style={{ background: source.color }}>{source.name.slice(0, 1)}</span>}
        subtitle={<span className="tnum">{list.length} stories</span>}
      />
      <NewsStream key={id} stories={list} isLoading={isLoading} isError={isError} onRetry={() => refetch()}
        title={`From ${source?.name ?? id}`} emptyTitle="No stories from this source yet" />
    </div>
  );
}
