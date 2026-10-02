import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStories } from '@/hooks/useStories';
import { useCompanies } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NewsStream from '@/components/news/NewsStream';
import CompanyMentionTag from '@/components/company/CompanyMentionTag';
import { PageHeader } from '@/components/ui/Section';

export default function CompanyPage() {
  const { symbol = '' } = useParams();
  const sym = symbol.toUpperCase();
  const { nameOf } = useCompanies();
  const name = nameOf(sym);
  useDocumentTitle(name);
  const { stories, isLoading, isError, refetch } = useStories();

  const list = useMemo(() => stories.filter((s) => s.companies.includes(sym)), [stories, sym]);

  // Companies that show up in the same stories
  const related = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of list) for (const c of s.companies) if (c !== sym) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [list, sym]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`$${sym}`} title={name}
        subtitle={<span className="tnum">{list.length} {list.length === 1 ? 'story' : 'stories'} mention this company</span>}
      />
      {related.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="eyebrow shrink-0">Often alongside</span>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none edge-fade">
            {related.map(([c, n]) => <CompanyMentionTag key={c} symbol={c} count={n} className="shrink-0" />)}
          </div>
        </div>
      )}
      <NewsStream key={sym} stories={list} isLoading={isLoading} isError={isError} onRetry={() => refetch()}
        title={`${name} news`} digestTitle={`${name} — latest news`}
        emptyTitle={`No recent news for ${name}`} emptyHint="Stories mentioning this company will appear here as they’re archived." />
    </div>
  );
}
