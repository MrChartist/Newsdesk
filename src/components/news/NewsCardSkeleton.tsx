import { cn } from '@/lib/utils';

export default function NewsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5 flex flex-col gap-3', className)} aria-hidden>
      <div className="flex items-center justify-between">
        <div className="skeleton h-3.5 w-24" />
        <div className="skeleton h-3 w-12" />
      </div>
      <div className="skeleton h-5 w-full" />
      <div className="skeleton h-5 w-4/5" />
      <div className="skeleton h-3.5 w-full mt-1" />
      <div className="skeleton h-3.5 w-2/3" />
      <div className="flex gap-2 pt-3">
        <div className="skeleton h-5 w-14 !rounded-full" />
        <div className="skeleton h-5 w-16 !rounded-full" />
      </div>
    </div>
  );
}
