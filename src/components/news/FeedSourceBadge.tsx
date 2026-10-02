import { cn } from '@/lib/utils';

interface Props {
  source: { id: string; name: string; color: string };
  className?: string;
}

/** Colour dot + publisher name — quieter than a solid label, still scannable. */
export default function FeedSourceBadge({ source, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/85 min-w-0', className)}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: source.color }} />
      <span className="truncate">{source.name}</span>
    </span>
  );
}
