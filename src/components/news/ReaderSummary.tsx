import { useState } from 'react';
import { ExternalLink, ListChecks, Hash, FileText, AlertCircle } from 'lucide-react';
import type { NewsItem, ArticleSummary } from '@/types/news';
import { cn } from '@/lib/utils';

interface Props {
  item: NewsItem;
  data?: ArticleSummary;
  loading: boolean;
  onOriginal: () => void;
}

const PREVIEW_PARAGRAPHS = 5;

/** Reader mode: key points, key figures and clean article text — extracted, not generated. */
export default function ReaderSummary({ item, data, loading, onOriginal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = data?.paragraphs ?? [];
  const shown = expanded ? paragraphs : paragraphs.slice(0, PREVIEW_PARAGRAPHS * 2);
  const hasMore = paragraphs.length > shown.length;
  const image = data?.image || item.image;
  const unreadable = data && data.status !== 'ok';
  // Google News links are redirects, so name the publisher rather than the redirector
  const host = !data || /(^|\.)google\.com$/.test(data.host) ? item.source.name : data.host;
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const blurbRestatesTitle = !item.description || norm(item.description).startsWith(norm(item.title));

  return (
    <div className="h-full overflow-y-auto bg-card">
      <article className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="eyebrow mb-3 flex flex-wrap items-center gap-x-2">
          <span>{host}</span>
          {data && data.status === 'ok' && <><span aria-hidden>·</span><span className="tnum">{data.readingMinutes} min read</span></>}
        </p>
        <h2 className="font-display text-[1.75rem] font-extrabold leading-[1.15] tracking-tight sm:text-[2.125rem]">{item.title}</h2>

        {image && (
          <img src={image} alt="" className="mt-6 max-h-[320px] w-full rounded-[var(--r-lg)] object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}

        {/* Key points */}
        <section aria-label="Key points" className="mt-7 rounded-[var(--r-lg)] bg-[var(--mat-fill-1)] p-5 sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-extrabold">
            <ListChecks className="h-[18px] w-[18px] text-primary" /> Key points
          </h3>
          {loading && (
            <div className="space-y-3" aria-busy>
              {[92, 100, 78].map((w) => <div key={w} className="skeleton h-4" style={{ width: `${w}%` }} />)}
            </div>
          )}
          {!loading && data && data.summary.length > 0 && (
            <ol className="space-y-3">
              {data.summary.map((s, i) => (
                <li key={i} className="flex gap-3 text-[1.0156rem] leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-extrabold text-primary tnum">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {!loading && (!data || data.summary.length === 0) && (
            <p className="text-sm text-muted-foreground">{blurbRestatesTitle ? 'Key points aren’t available for this story. Open the original to read it.' : item.description}</p>
          )}
        </section>

        {/* Key figures */}
        {data && data.figures.length > 0 && (
          <section aria-label="Key figures" className="mt-5">
            <h3 className="eyebrow mb-2 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Key figures</h3>
            <div className="flex flex-wrap gap-2">
              {data.figures.map((f) => <span key={f} className="chip !px-3 !py-1.5 text-[0.8125rem] tnum">{f}</span>)}
            </div>
          </section>
        )}

        {unreadable && (
          <div className="mt-5 flex gap-3 rounded-[var(--r-md)] bg-ios-orange/12 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-ios-orange" />
            <div>
              <p className="font-semibold">
                {data.status === 'blocked' ? `${host} doesn’t allow automatic reading.` : 'Very little text was found on this page.'}
              </p>
              <p className="mt-0.5 text-muted-foreground">Only the headline feed’s own description is available here. Open the original for the full story.</p>
            </div>
          </div>
        )}

        {/* Clean text */}
        {paragraphs.length > 0 && (
          <section aria-label="Full text" className="mt-9">
            <h3 className="eyebrow mb-4 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Full text</h3>
            <div className="space-y-4">
              {shown.map((p, i) => p.heading
                ? <h4 key={i} className="pt-2 font-display text-lg font-extrabold tracking-tight">{p.text}</h4>
                : <p key={i} className={cn('text-[1.0625rem] leading-[1.75] text-foreground/90')}>{p.text}</p>)}
            </div>
            {hasMore && <button onClick={() => setExpanded(true)} className="btn btn-plain mt-6">Show the rest ({paragraphs.length - shown.length} more)</button>}
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--mat-separator)] pt-6">
          <button onClick={onOriginal} className="btn btn-primary">View original page</button>
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-plain">Open on {item.source.name} <ExternalLink className="h-4 w-4" /></a>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Key points are the highest-ranked sentences of the article, picked by a word-frequency and sentence-similarity ranking.
          Nothing is generated or rewritten, so every line is the publisher’s own wording.
        </p>
      </article>
    </div>
  );
}
