import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useStocks } from '@/hooks/useStockData';

export default function HeroStats() {
  const { data: newsData, isFetching: isNewsFetching } = useNewsFeed();
  const { data: stockData, isFetching: isStockFetching, dataUpdatedAt } = useStocks();

  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      if (diff < 10) setLastRefreshed('Just now');
      else if (diff < 60) setLastRefreshed(`${diff}s ago`);
      else setLastRefreshed(`${Math.floor(diff / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const stats = [
    {
      label: 'Live Articles',
      value: newsData?.count || 0,
      icon: Database,
      color: 'text-primary'
    },
    {
      label: 'Stocks Tracked',
      value: stockData?.count || 0,
      icon: Activity,
      color: 'text-emerald-500'
    },
    {
      label: 'Active Feeds',
      value: 25,
      icon: Layers,
      color: 'text-amber-500'
    },
    {
      label: 'Last Synced',
      value: lastRefreshed,
      icon: Clock,
      color: 'text-cyan-500',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface-card p-4 flex items-center gap-4"
          >
            <div className={cn("p-2.5 rounded-full bg-white/5", stat.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className={cn("font-display font-bold text-xl mt-0.5", !stat.isText && "font-mono-data")}>
                {stat.value}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
