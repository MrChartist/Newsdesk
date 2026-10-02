import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSectors } from '@/hooks/useStockData';
import { SectionHeader } from '../ui/Section';

// Tint intensity scales with the move so the heat-map reads at a glance.
function tint(change: number): string {
  const a = Math.min(0.34, 0.07 + Math.abs(change) * 0.09);
  if (Math.abs(change) < 0.15) return 'var(--mat-fill-1)';
  return `hsl(var(--ios-${change > 0 ? 'green' : 'red'}) / ${a})`;
}

export default function SectorHeatmap() {
  const { data: sectors, isLoading } = useSectors();

  if (isLoading || !sectors) {
    return (
      <div>
        <SectionHeader title="Sectors" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-[74px] !rounded-[var(--r-md)]" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Sectors" to="/sectors" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {sectors.slice(0, 8).map((s) => (
          <Link
            key={s.sector}
            to={`/sector/${encodeURIComponent(s.sector)}`}
            className="card-interactive rounded-[var(--r-md)] px-3.5 py-3 shadow-1"
            style={{ background: tint(s.avgChange) }}
          >
            <p className="truncate text-xs font-semibold text-foreground/80">{s.sector}</p>
            <p className={cn('mt-1 text-lg font-extrabold tracking-tight tnum', s.avgChange >= 0 ? 'text-profit' : 'text-loss')}>
              {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
