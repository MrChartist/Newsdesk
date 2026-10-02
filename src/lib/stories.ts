import type { NewsItem } from '@/types/news';

/** One real-world event, possibly reported by several publishers. */
export interface Story {
  /** Stable id — link of the earliest item in the cluster. */
  id: string;
  /** Representative item shown on the card (prefers one with an image). */
  lead: NewsItem;
  /** Every item in the cluster, newest first (includes lead). */
  items: NewsItem[];
  /** Distinct publishers other than the lead's. */
  others: NewsItem['source'][];
  /** Newest pubDate in the cluster (ms) — used for ordering and grouping. */
  time: number;
  /** Union of company symbols across the cluster. */
  companies: string[];
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'has', 'have', 'will', 'its', 'into',
  'over', 'after', 'amid', 'says', 'said', 'new', 'how', 'why', 'what', 'who', 'may', 'can', 'not', 'but',
  'than', 'now', 'out', 'all', 'more', 'about', 'under', 'live', 'updates', 'update', 'news',
]);

function tokens(title: string): Set<string> {
  // Drop a trailing " - Publisher" / " | Publisher" so the same story from different feeds lines up
  const cleaned = title.replace(/\s[-–—|]\s[^-–—|]{2,40}$/, '').toLowerCase();
  const out = new Set<string>();
  for (const w of cleaned.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)) {
    if (w.length > 2 && !STOP.has(w)) out.add(w);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

const WINDOW = 36 * 3600 * 1000;
const THRESHOLD = 0.55;

/** Group near-duplicate headlines (same event, different publishers) into stories. */
export function buildStories(items: NewsItem[]): Story[] {
  const sorted = [...items].sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
  const clusters: { items: NewsItem[]; toks: Set<string>; time: number }[] = [];

  for (const item of sorted) {
    const t = +new Date(item.pubDate);
    const toks = tokens(item.title);
    let hit = -1;

    if (toks.size >= 4) {
      for (let i = clusters.length - 1; i >= 0; i--) {
        const c = clusters[i];
        if (c.time - t > WINDOW) continue; // clusters are in newest-first order; older ones are further right
        if (c.toks.size >= 4 && jaccard(toks, c.toks) >= THRESHOLD) { hit = i; break; }
      }
    }

    if (hit >= 0) clusters[hit].items.push(item);
    else clusters.push({ items: [item], toks, time: t });
  }

  return clusters.map(({ items: its, time }) => {
    const lead = its.find((i) => i.image) ?? its[0];
    const seen = new Set([lead.source.id]);
    const others: Story['others'] = [];
    for (const i of its) {
      if (!seen.has(i.source.id)) { seen.add(i.source.id); others.push(i.source); }
    }
    const earliest = its[its.length - 1];
    return {
      id: earliest.link,
      lead,
      items: its,
      others,
      time,
      companies: Array.from(new Set(its.flatMap((i) => i.companies))),
    };
  });
}

/** Number of distinct publishers covering the story. */
export const coverage = (s: Story) => s.others.length + 1;

export type TimeBucket = 'Last hour' | 'Earlier today' | 'Yesterday' | 'This week' | 'Older';
export const BUCKET_ORDER: TimeBucket[] = ['Last hour', 'Earlier today', 'Yesterday', 'This week', 'Older'];

export function timeBucket(ms: number, now = Date.now()): TimeBucket {
  const diff = now - ms;
  if (diff < 3600_000) return 'Last hour';
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  if (ms >= +startToday) return 'Earlier today';
  if (ms >= +startToday - 86400_000) return 'Yesterday';
  if (diff < 7 * 86400_000) return 'This week';
  return 'Older';
}
