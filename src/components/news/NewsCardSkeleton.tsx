import React from 'react';
import { cn } from '@/lib/utils';

export default function NewsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("premium-card p-4 animate-pulse flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-white/10 rounded"></div>
        <div className="h-3 w-16 bg-white/10 rounded"></div>
      </div>
      <div className="h-10 w-full bg-white/10 rounded"></div>
      <div className="h-16 w-full bg-white/10 rounded mt-2"></div>
      <div className="flex gap-2 mt-auto pt-4">
        <div className="h-4 w-12 bg-white/10 rounded"></div>
        <div className="h-4 w-16 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}
