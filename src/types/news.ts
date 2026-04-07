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
