import { useState, useEffect } from 'react';
import { timeAgo, cn } from '@/lib/utils';

export default function TimeAgo({ date, className }: { date: string; className?: string }) {
  const [timeStr, setTimeStr] = useState(timeAgo(date));

  useEffect(() => {
    setTimeStr(timeAgo(date));
    const interval = setInterval(() => setTimeStr(timeAgo(date)), 60000);
    return () => clearInterval(interval);
  }, [date]);

  const isNew = Date.now() - new Date(date).getTime() < 15 * 60 * 1000;

  return (
    <time
      dateTime={date}
      title={new Date(date).toLocaleString('en-IN')}
      className={cn('text-xs tnum text-muted-foreground whitespace-nowrap', isNew && 'text-primary font-semibold', className)}
    >
      {timeStr}
    </time>
  );
}
