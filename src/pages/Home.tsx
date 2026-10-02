import { useMemo, useState } from 'react';
import { useStories } from '@/hooks/useStories';
import { useFeedSources } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NewsStream from '@/components/news/NewsStream';
import LeadStory from '@/components/news/LeadStory';
import TrendingStrip from '@/components/news/TrendingStrip';
import ArticleModal from '@/components/news/ArticleModal';
import { PageHeader, SectionHeader } from '@/components/ui/Section';
import { formatDateIN, greeting } from '@/lib/utils';
import { coverage, type Story } from '@/lib/stories';

/** Rank by how widely a story is covered, whether it has an image, and how fresh it is. */
function pickTop(stories: Story[]) {
  const now = Date.now();
  const scored = stories
    .filter((s) => now - s.time < 18 * 3600_000)
    .map((s) => ({ s, score: coverage(s) * 2 + (s.lead.image ? 1.5 : 0) - ((now - s.time) / 3600_000) * 0.2 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
  const lead = scored.find((s) => s.lead.image) ?? scored[0];
  if (!lead) return { lead: null, rest: [] as Story[] };
  return { lead, rest: scored.filter((s) => s.id !== lead.id).slice(0, 4) };
}

export default function Home() {
  useDocumentTitle();
  const { stories, isLoading, isError, refetch } = useStories();
  const { data: sources } = useFeedSources();
  const [open, setOpen] = useState<Story | null>(null);

  const { lead, rest } = useMemo(() => pickTop(stories), [stories]);
  const exclude = useMemo(() => new Set([lead?.id, ...rest.map((s) => s.id)].filter(Boolean) as string[]), [lead, rest]);
  const today = useMemo(() => stories.filter((s) => Date.now() - s.time < 24 * 3600_000).length, [stories]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={formatDateIN()}
        title={greeting()}
        subtitle={
          stories.length
            ? <><span className="font-semibold text-foreground tnum">{today.toLocaleString('en-IN')}</span> stories in the last 24 hours from {sources?.length ?? '30+'} sources.</>
            : 'Loading the latest from the news desk…'
        }
      />

      <TrendingStrip stories={stories} />

      {lead && (
        <section aria-label="Top stories">
          <SectionHeader title="Top stories" />
          <LeadStory lead={lead} others={rest} onSelect={setOpen} />
        </section>
      )}

      <NewsStream
        stories={stories} isLoading={isLoading} isError={isError} onRetry={() => refetch()}
        title="Latest" showTopics excludeIds={exclude}
      />

      <ArticleModal story={open} onClose={() => setOpen(null)} />
    </div>
  );
}
