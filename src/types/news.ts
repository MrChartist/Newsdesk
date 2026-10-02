export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image: string | null;
  category: string;
  companies: string[];
  source: {
    id: string;
    name: string;
    color: string;
  };
}

export interface FeedSource {
  id: string;
  name: string;
  category: string;
  color: string;
}

export interface NewsFeedResponse {
  count: number;
  items: NewsItem[];
}

/** Extractive (non-AI) summary of an article, from /api/summary. */
export interface ArticleSummary {
  /** ok = full text read · thin = little text on the page · blocked = publisher refused, using the feed blurb */
  status: 'ok' | 'thin' | 'blocked';
  title: string;
  image: string | null;
  summary: string[];
  figures: string[];
  paragraphs: { text: string; heading: boolean }[];
  words: number;
  readingMinutes: number;
  host: string;
  url: string;
  reason?: string;
}
