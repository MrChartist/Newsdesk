import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, TrendingUp, TrendingDown, Maximize2, ShieldAlert } from 'lucide-react';
import { cn, formatPrice, formatChange, formatMarketCap, formatVolume, getRecommendationLabel } from '@/lib/utils';
import NewsFeed from '@/components/news/NewsFeed';
import type { StockData, NewsFeedResponse } from '@/types/stock';

async function fetchCompanyData(symbol: string) {
  const res = await fetch(`/api/company/${symbol}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export default function CompanyPage() {
  const { symbol } = useParams();
  
  const { data, isLoading } = useQuery({
    queryKey: ['company', symbol],
    queryFn: () => fetchCompanyData(symbol!),
    enabled: !!symbol,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Loading {symbol} data...</div>;
  }

  if (!data?.stock) {
    return <div className="text-center py-20 text-muted-foreground">No data found for {symbol}</div>;
  }

  const { stock, news, name } = data;
  const isProfit = stock.change >= 0;
  const rec = getRecommendationLabel(stock.recommendAll);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header Profile */}
      <div className="surface-card p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">{symbol}</h1>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs text-muted-foreground font-medium">
              {stock.sector}
            </span>
          </div>
          <p className="text-muted-foreground text-lg">{name || stock.name}</p>
        </div>

        <div className="flex flex-col md:items-end">
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-4xl font-bold">{formatPrice(stock.price)}</span>
            <div className={cn("flex flex-col font-mono-data", isProfit ? "text-profit" : "text-loss")}>
              <span className="flex items-center text-lg font-bold">
                {isProfit ? <TrendingUp className="w-5 h-5 mr-1"/> : <TrendingDown className="w-5 h-5 mr-1"/>}
                {formatChange(stock.change)}
              </span>
              <span className="text-sm opacity-80">{isProfit ? '+' : ''}₹{stock.changeAbs?.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Live from NSE via TradingView</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Market Cap</span>
          <span className="text-xl font-mono-data font-semibold">{formatMarketCap(stock.marketCap)}</span>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Volume</span>
          <span className="text-xl font-mono-data font-semibold">{formatVolume(stock.volume)}</span>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">Technicals</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-xl font-display font-bold", rec.color)}>{rec.label}</span>
          </div>
        </div>
        <div className="surface-card p-4 flex flex-col justify-between">
          <span className="text-sm text-muted-foreground">52W Range</span>
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs font-mono-data text-muted-foreground mb-1">
              <span>{formatPrice(stock.low52W)}</span>
              <span>{formatPrice(stock.high52W)}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
              {/* Very basic range plot */}
              {stock.price && stock.low52W && stock.high52W && (
                <div 
                  className="absolute top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_8px_var(--primary)]" 
                  style={{ left: `${Math.max(0, Math.min(100, ((stock.price - stock.low52W) / (stock.high52W - stock.low52W)) * 100))}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cross link to Funda Scanner */}
      <a 
        href={`http://localhost:5180/company/${symbol}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-semibold">Deep Dive Fundamental Analysis</span>
          <span className="text-sm opacity-80">— Switch to Funda Scanner terminal</span>
        </div>
        <ExternalLink className="w-5 h-5" />
      </a>

      {/* News Feed */}
      <div className="pt-8">
        <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
          Company Intelligence <span className="text-sm text-muted-foreground font-normal px-2 py-0.5 rounded-full bg-white/5">{news?.count || 0} articles</span>
        </h2>
        <NewsFeed items={news?.items || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
