import type { Story } from '@/lib/stories';
import { cn } from '@/lib/utils';

/** Overlapping publisher dots + "+N sources" — shows how widely a story is reported. */
export default function Coverage({ story, className, light }: { story: Story; className?: string; light?: boolean }) {
  if (!story.others.length) return null;
  const shown = story.others.slice(0, 3);
  const names = story.others.map((s) => s.name).join(', ');
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', light ? 'text-white/85' : 'text-muted-foreground', className)}
      title={`Also reported by ${names}`}
    >
      <span className="flex -space-x-1.5">
        {shown.map((s) => (
          <span key={s.id} className="h-3.5 w-3.5 rounded-full ring-2 ring-card" style={{ background: s.color }} />
        ))}
      </span>
      +{story.others.length} {story.others.length === 1 ? 'source' : 'sources'}
    </span>
  );
}
