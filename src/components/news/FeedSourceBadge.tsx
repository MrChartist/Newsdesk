import { cn } from '@/lib/utils';

interface Props {
  source: {
    id: string;
    name: string;
    color: string;
  };
  className?: string;
}

export default function FeedSourceBadge({ source, className }: Props) {
  return (
    <span
      className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white tracking-wider uppercase leading-none shadow-sm", className)}
      style={{ backgroundColor: source.color }}
    >
      {source.name}
    </span>
  );
}
