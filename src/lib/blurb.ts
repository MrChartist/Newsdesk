import type { NewsItem } from '@/types/news';

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * The description worth showing under a headline: many feeds repeat the title at the
 * start of the description (or use it verbatim). Strip that so a card never says it twice.
 */
export function blurbOf(item: NewsItem): string {
  const desc = (item.description ?? '').trim();
  if (!desc) return '';
  const title = item.title.trim();
  if (norm(desc) === norm(title)) return '';

  let out = desc;
  if (norm(desc).startsWith(norm(title))) {
    // remove the leading title text, tolerant of punctuation differences
    const words = title.split(/\s+/).length;
    out = desc.split(/\s+/).slice(words).join(' ').replace(/^[\s:–—|.\-·]+/, '').trim();
  }
  // a remnant that is just a publisher name or a stub isn't worth a line
  if (out.length < 25) return '';
  return out;
}
