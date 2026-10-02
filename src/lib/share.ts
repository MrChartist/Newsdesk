import type { Story } from './stories';
import type { NewsItem } from '@/types/news';
import { timeAgo } from './utils';

const BRAND = '@MrChartist';

/** Telegram-ready single post: short paragraphs, no emoji clutter. */
export function formatPost(item: NewsItem): string {
  return `${item.title}\n\n${item.source.name} · ${timeAgo(item.pubDate)}\n${item.link}\n\n${BRAND}`;
}

/** Telegram-ready digest of several stories. */
export function formatDigest(title: string, stories: Story[], limit = 8): string {
  const body = stories
    .slice(0, limit)
    .map((s, i) => `${i + 1}. ${s.lead.title}\n${s.lead.source.name}\n${s.lead.link}`)
    .join('\n\n');
  return `${title}\n\n${body}\n\n${BRAND}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
