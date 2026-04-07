import { cn } from '@/lib/utils';
import { getCategoryMeta } from '@/data/categories';

export default function CategoryBadge({ category, className }: { category: string, className?: string }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium leading-none", className)}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
      }}
    >
      <Icon className="w-2.5 h-2.5" />
      {category}
    </span>
  );
}
