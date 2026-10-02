import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSectors } from '@/hooks/useStockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getSectorMeta } from '@/data/sectors';
import { PageHeader, ChangePill } from '@/components/ui/Section';
import { formatMarketCap } from '@/lib/utils';

export default function SectorsPage() {
  useDocumentTitle('Sectors');
  const { data: sectors, isLoading } = useSectors();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sector rotation"
        title="Sectors"
        subtitle="Where money is moving across the NSE today. Tap a sector for leaders, laggards and its news."
      />

      {isLoading || !sectors ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="card skeleton !rounded-[var(--r-lg)] h-[150px]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sectors.map((sector, i) => {
            const meta = getSectorMeta(sector.sector);
            const Icon = meta.icon;
            const total = sector.advancers + sector.decliners || 1;
            const advPct = (sector.advancers / total) * 100;

            return (
              <motion.div
                key={sector.sector}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.3), ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/sector/${encodeURIComponent(sector.sector)}`} className="card card-interactive block p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="squircle !h-9 !w-9 !rounded-[10px]" style={{ background: meta.color }}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2.3} />
                    </span>
                    <h3 className="min-w-0 flex-1 truncate font-display text-[1.0625rem] font-extrabold">{sector.sector}</h3>
                    <ChangePill value={sector.avgChange} />
                  </div>

                  <div className="mb-2 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-ios-green" style={{ width: `${advPct}%` }} />
                    <div className="h-full flex-1 rounded-full bg-ios-red/80" />
                  </div>
                  <div className="flex justify-between text-xs tnum">
                    <span className="font-semibold text-profit">{sector.advancers} up</span>
                    <span className="text-muted-foreground">{sector.count} stocks</span>
                    <span className="font-semibold text-loss">{sector.decliners} down</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--mat-separator)] pt-3 text-xs text-muted-foreground">
                    <span>Mkt cap <span className="font-semibold text-foreground tnum">{formatMarketCap(sector.marketCap)}</span></span>
                    {sector.topStock && <span>Leader <span className="font-bold text-profit">{sector.topStock.symbol}</span></span>}
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
