import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, BarChart3, Building2 } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useCompanies } from '@/hooks/useNewsFeed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCompanyQuote } from '@/hooks/useStockData';
import NewsStream from '@/components/news/NewsStream';
import CompanyMentionTag from '@/components/company/CompanyMentionTag';
import { PageHeader } from '@/components/ui/Section';

export default function CompanyPage() {
  const { symbol = '' } = useParams();
  const sym = symbol.toUpperCase();
  const { nameOf } = useCompanies();

  // Load preloaded instrument details
  const { data: companyData } = useCompanyQuote(sym);
  const instrument = companyData?.instrument;
  const name = instrument?.name || nameOf(sym);

  useDocumentTitle(`${name} (${sym})`);
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
        eyebrow={`${sym} · NSE`}
        title={name}
        subtitle={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
            {instrument?.sector && (
              <span className="font-semibold text-foreground/80">{instrument.sector}</span>
            )}
            {instrument?.industry && (
              <>
                <span aria-hidden>·</span>
                <span>{instrument.industry}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="tnum">
              {list.length} {list.length === 1 ? 'story' : 'stories'} archived
            </span>
          </div>
        }
      />

      {/* Instrument Overview Card */}
      <div className="glass rounded-[var(--r-lg)] p-5 border border-[var(--mat-separator)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="eyebrow">NSE Instrument Intelligence</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              {name}
            </span>
            <span className="text-xs font-bold text-muted-foreground bg-[var(--mat-fill-2)] px-2.5 py-1 rounded-full">
              {sym}
            </span>
          </div>
        </div>

        {/* TradingView Chart Link */}
        <a
          href={`https://in.tradingview.com/chart/?symbol=NSE:${sym}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-plain shrink-0 inline-flex items-center gap-2 self-start sm:self-auto text-xs font-semibold hover:border-primary/40"
        >
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Technical chart</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
        </a>
      </div>

      {related.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="eyebrow shrink-0">Often alongside</span>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none edge-fade">
            {related.map(([c, n]) => <CompanyMentionTag key={c} symbol={c} count={n} className="shrink-0" />)}
          </div>
        </div>
      )}

      <NewsStream
        key={sym}
        stories={list}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        title={`${name} news`}
        digestTitle={`${name} — latest news`}
        emptyTitle={`No recent news for ${name}`}
        emptyHint="Stories mentioning this company will appear here as they’re archived."
      />
    </div>
  );
}
