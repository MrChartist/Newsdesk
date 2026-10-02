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

export function Stat({
  label, value, tone, className,
}: { label: string; value: React.ReactNode; tone?: 'profit' | 'loss'; className?: string }) {
  return (
    <div className={cn('card p-4', className)}>
      <p className="eyebrow !normal-case !tracking-normal !text-[0.8125rem] !font-medium">{label}</p>
      <p className={cn('mt-1 font-display text-[1.5rem] font-extrabold tracking-tight tnum', tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss')}>
        {value}
      </p>
    </div>
  );
}

/** Pill showing a signed percentage on a tinted wash. */
export function ChangePill({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tnum',
        up ? 'wash-profit text-profit' : 'wash-loss text-loss',
        className,
      )}
    >
      {up ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

/** Thin 52-week range bar with a marker for current price. */
export function RangeBar({ position, className }: { position: number | null; className?: string }) {
  if (position == null) return <span className="text-muted-foreground">—</span>;
  return (
    <div className={cn('relative h-1.5 w-full rounded-full bg-[var(--mat-fill-3)]', className)} title={`${position.toFixed(0)}% of 52-week range`}>
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-1"
        style={{ left: `${position}%` }}
      />
    </div>
  );
}
