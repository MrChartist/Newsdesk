import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// NSE equity hours in IST: pre-open 09:00–09:15, session 09:15–15:30, Mon–Fri.
// Exchange holidays are NOT accounted for — Needs verification against the NSE calendar.
function nseState(now: Date): { label: string; tone: 'open' | 'pre' | 'closed' } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const mins = Number(get('hour')) * 60 + Number(get('minute'));
  const weekday = get('weekday');
  if (weekday === 'Sat' || weekday === 'Sun') return { label: 'NSE closed', tone: 'closed' };
  if (mins >= 540 && mins < 555) return { label: 'Pre-open', tone: 'pre' };
  if (mins >= 555 && mins < 930) return { label: 'NSE open', tone: 'open' };
  return { label: 'NSE closed', tone: 'closed' };
}

export default function MarketStatus({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const s = nseState(now);
  const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <span
      className={cn('chip !py-1 !px-2.5 gap-1.5', className)}
      title="Based on standard NSE hours (Mon–Fri, 9:15–15:30 IST). Exchange holidays not included."
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          s.tone === 'open' && 'bg-ios-green live-dot',
          s.tone === 'pre' && 'bg-ios-orange live-dot',
          s.tone === 'closed' && 'bg-ios-gray',
        )}
      />
      {s.label}
      <span className="text-muted-foreground tnum font-medium">{time} IST</span>
    </span>
  );
}
