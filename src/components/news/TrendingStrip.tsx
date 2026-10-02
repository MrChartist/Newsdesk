import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Story } from '@/lib/stories';
import CompanyMentionTag from '../company/CompanyMentionTag';

/** Companies most mentioned across stories in the last 24 hours. */
export default function TrendingStrip({ stories }: { stories: Story[] }) {
  const top = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    const m = new Map<string, number>();
    for (const s of stories) if (s.time >= cutoff) for (const c of s.companies) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [stories]);

  if (top.length < 3) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow flex shrink-0 items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> In the news</span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none edge-fade">
        {top.map(([symbol, n]) => <CompanyMentionTag key={symbol} symbol={symbol} count={n} className="shrink-0" />)}
      </div>
    </div>
  );
}
