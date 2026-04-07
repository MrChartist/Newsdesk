import { cn } from '@/lib/utils';
import { useSectors } from '@/hooks/useStockData';
import { motion } from 'framer-motion';

export default function SectorHeatmap() {
  const { data: sectors, isLoading } = useSectors();

  if (isLoading || !sectors) {
    return (
      <div className="surface-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  function getSectorColor(change: number): string {
    if (change >= 2) return 'bg-emerald-500/30 ring-emerald-500/20';
    if (change >= 1) return 'bg-emerald-500/20 ring-emerald-500/10';
    if (change >= 0.3) return 'bg-emerald-500/10 ring-emerald-500/5';
    if (change >= -0.3) return 'bg-white/5 ring-white/5';
    if (change >= -1) return 'bg-red-500/10 ring-red-500/5';
    if (change >= -2) return 'bg-red-500/20 ring-red-500/10';
    return 'bg-red-500/30 ring-red-500/20';
  }

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-semibold font-display mb-3">Sector Performance</h3>
      <div className="grid grid-cols-3 gap-2">
        {sectors.slice(0, 12).map((sector, i) => (
          <motion.div
            key={sector.sector}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              'px-3 py-2.5 rounded-xl ring-1 transition-all cursor-default',
              getSectorColor(sector.avgChange)
            )}
          >
            <p className="text-[10px] text-muted-foreground truncate leading-tight">{sector.sector}</p>
            <p className={cn(
              'font-mono-data text-sm font-bold mt-0.5',
              sector.avgChange >= 0 ? 'text-profit' : 'text-loss'
            )}>
              {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
            </p>
            <p className="text-[9px] text-muted-foreground">{sector.count} stocks</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
