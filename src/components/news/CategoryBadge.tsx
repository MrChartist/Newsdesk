import { cn } from '@/lib/utils';
import { getCategoryMeta } from '@/data/categories';

export default function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none', className)}
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`,
        // deepen toward the foreground so the label stays legible on paper-white
        color: `color-mix(in srgb, ${meta.color} 72%, hsl(var(--foreground)))`,
      }}
    >
      <Icon className="w-3 h-3" strokeWidth={2.4} />
      {meta.label}
    </span>
  );
}
