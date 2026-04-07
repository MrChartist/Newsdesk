import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useStocks } from '@/hooks/useStockData';
import { Flame, Activity, Zap } from 'lucide-react';
import type { NewsItem } from '@/types/news';

export default function TickerBar() {
  const { data: newsData } = useNewsFeed();
  const { data: moversData } = useStocks(); // can use useTopMovers instead, but it's okay

  // Get breaking news (last 5 hr)
  const breakingNews = newsData?.items?.filter(
    (n: NewsItem) => (Date.now() - new Date(n.pubDate).getTime()) < 5 * 3600 * 1000
  ).slice(0, 5) || [];

  return (
    <div className="w-full h-10 border-b border-border/50 bg-background/95 backdrop-blur z-40 flex items-center overflow-hidden">
      <div className="flex items-center h-full px-4 bg-primary text-primary-foreground shrink-0 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
        <Zap className="w-4 h-4 mr-2 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest">Live Updates</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-white/5">
        <div className="flex whitespace-nowrap ticker-animate absolute left-0 items-center h-full min-w-full">
          {breakingNews.map((news: NewsItem, idx: number) => (
            <div key={news.id} className="flex items-center text-sm font-medium mr-12 shrink-0">
              <span className="text-muted-foreground mr-2">{new Date(news.pubDate).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="text-foreground hover:text-primary cursor-pointer transition-colors" onClick={() => window.open(news.link, '_blank')}>
                {news.title}
              </span>
              <span className="ml-3 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-white/10 text-muted-foreground">
                {news.source.name}
              </span>
            </div>
          ))}
          
          {/* Duplicate for seamless loop */}
          {breakingNews.map((news: NewsItem, idx: number) => (
            <div key={news.id + '-dup'} className="flex items-center text-sm font-medium mr-12 shrink-0">
              <span className="text-muted-foreground mr-2">{new Date(news.pubDate).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="text-foreground hover:text-primary cursor-pointer transition-colors" onClick={() => window.open(news.link, '_blank')}>
                {news.title}
              </span>
              <span className="ml-3 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-white/10 text-muted-foreground">
                {news.source.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
