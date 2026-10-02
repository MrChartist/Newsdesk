import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title, count, to, toLabel = 'See all', className, children,
}: { title: string; count?: number; to?: string; toLabel?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('mb-3 flex items-center gap-2', className)}>
      <h2 className="font-display text-[1.25rem] font-extrabold tracking-tight">{title}</h2>
      {count != null && <span className="chip tnum">{count.toLocaleString('en-IN')}</span>}
      <div className="ml-auto flex items-center gap-2">
        {children}
        {to && (
          <Link to={to} className="inline-flex items-center text-sm font-semibold text-primary hover:opacity-80">
            {toLabel}<ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** Page header — large title + supporting line, iOS style. */
export function PageHeader({
  title, subtitle, eyebrow, icon, actions,
}: { title: string; subtitle?: React.ReactNode; eyebrow?: string; icon?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      {icon}
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="large-title">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
