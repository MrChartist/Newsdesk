import type { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon, title, hint, tone = 'neutral', action,
}: { icon: LucideIcon; title: string; hint?: string; tone?: 'neutral' | 'error'; action?: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 py-16 text-center">
      <div
        className="mb-2 flex h-14 w-14 items-center justify-center rounded-[18px]"
        style={{
          background: tone === 'error' ? 'hsl(var(--ios-red) / 0.14)' : 'var(--mat-fill-2)',
          color: tone === 'error' ? 'hsl(var(--ios-red))' : 'hsl(var(--muted-foreground))',
        }}
      >
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-display text-lg font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
