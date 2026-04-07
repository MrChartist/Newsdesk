import { useState, useEffect } from 'react';
import { timeAgo, cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export default function TimeAgo({ date, className }: { date: string, className?: string }) {
  const [timeStr, setTimeStr] = useState(timeAgo(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(timeAgo(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  // Flash new animation if less than 5 minutes old
  const isNew = (Date.now() - new Date(date).getTime()) < 5 * 60 * 1000;

  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] text-muted-foreground", isNew && "badge-new text-primary font-medium", className)}>
      <Clock className="w-3 h-3" />
      {timeStr}
    </span>
  );
}
