import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';
import { useSectors } from '@/hooks/useStockData';
import { getSectorMeta } from '@/data/sectors';
import { cn, formatMarketCap } from '@/lib/utils';

export default function SectorsPage() {
  const { data: sectors, isLoading } = useSectors();

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      <div className="surface-card p-6 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/15 text-primary">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Sector Rotation</h1>
          <p className="text-sm text-muted-foreground">Where capital is flowing across the NSE — tap a sector to drill in.</p>
        </div>
      </div>

      {isLoading || !sectors ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="surface-card h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector, i) => {
            const meta = getSectorMeta(sector.sector);
            const Icon = meta.icon;
            const up = sector.avgChange >= 0;
            const total = sector.advancers + sector.decliners || 1;
            const advPct = (sector.advancers / total) * 100;

            return (
              <motion.div
                key={sector.sector}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Link
                  to={`/sector/${encodeURIComponent(sector.sector)}`}
                  className="surface-card p-5 block hover:ring-white/15 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-semibold text-sm leading-tight group-hover:text-primary transition-colors truncate">
                        {sector.sector}
                      </h3>
                    </div>
                    <span className={cn('font-mono-data text-lg font-bold flex items-center gap-1 shrink-0', up ? 'text-profit' : 'text-loss')}>
                      {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {up ? '+' : ''}{sector.avgChange.toFixed(2)}%
                    </span>
                  </div>

                  {/* Breadth bar */}
                  <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-loss/40 mb-2">
                    <div className="bg-profit h-full" style={{ width: `${advPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="text-profit">{sector.advancers} up</span>
                    <span>{sector.count} stocks</span>
                    <span className="text-loss">{sector.decliners} down</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px]">
                    <span className="text-muted-foreground">Mkt Cap <span className="text-foreground font-mono-data">{formatMarketCap(sector.marketCap)}</span></span>
                    {sector.topStock && (
                      <span className="text-muted-foreground">
                        Top <span className="font-mono-data text-profit">{sector.topStock.symbol}</span>
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
